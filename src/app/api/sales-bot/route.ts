import { db } from "@/db";
import { categories, parts } from "@/db/schema";
import { CONTACT_INFO, SITE_CONFIG } from "@/lib/constants";
import { ensureCatalogSchema } from "@/lib/parts/ensureCatalogSchema";
import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type PartHit = {
  id: number;
  title: string;
  brand: string | null;
  model: string | null;
  catalogNumber: string | null;
  delivery: string | null;
  priceWithoutVAT: string | null;
  priceWithVAT: string | null;
  discount: string | null;
  currency: string;
  category: string;
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const deliveryLabels: Record<string, string> = {
  available: "Dostupno odmah",
  "15_days": "Rok isporuke 15 dana",
  on_request: "Po dogovoru",
};

const knownBrands = ["kubota", "yanmar", "komatsu", "caterpillar", "volvo", "hitachi", "jcb", "cummins"];

function sanitizeMessages(rawMessages: unknown): ChatMessage[] {
  if (!Array.isArray(rawMessages)) return [];

  return rawMessages
    .filter((message): message is { role: unknown; content: unknown } => {
      if (typeof message !== "object" || message === null) return false;
      return "role" in message && "content" in message;
    })
    .map((message): ChatMessage => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: String(message.content ?? "").slice(0, 1200),
    }))
    .filter((message) => message.content.trim())
    .slice(-10);
}

function extractSearchTerms(message: string) {
  const words = message
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3);

  const brands = knownBrands.filter((brand) => words.includes(brand));
  const catalogLike = words.filter((word) => /\d/.test(word) && word.length >= 4).slice(0, 4);
  const keywords = [...new Set([...brands, ...catalogLike, ...words.slice(0, 8)])];

  return { brands, keywords };
}

function formatPartForPrompt(part: PartHit) {
  const delivery = part.delivery ? deliveryLabels[part.delivery] ?? part.delivery : "Po dogovoru";
  const priceWithVat = part.priceWithVAT ?? "Nije uneseno";
  const priceWithoutVat = part.priceWithoutVAT ?? "Nije uneseno";
  const discount = Number(part.discount ?? 0) > 0 ? `, popust ${part.discount}%` : "";

  return [
    `- ${part.title}`,
    part.brand || part.model ? `  Brend/model: ${[part.brand, part.model].filter(Boolean).join(" ")}` : null,
    part.catalogNumber ? `  Kataloski broj: ${part.catalogNumber}` : null,
    `  Dostupnost: ${delivery}`,
    `  Cijena: ${priceWithVat} ${part.currency} sa PDV-om (${priceWithoutVat} ${part.currency} bez PDV-a${discount})`,
    `  Link: /product/${part.id}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function searchPartsDatabase(query: string): Promise<{ hits: PartHit[]; error?: string }> {
  const { brands, keywords } = extractSearchTerms(query);

  try {
    await ensureCatalogSchema();

    const where = [isNull(parts.deletedAt), eq(parts.isActive, true)];
    const filters = keywords.flatMap((keyword) => [
      ilike(parts.title, `%${keyword}%`),
      ilike(parts.brand, `%${keyword}%`),
      ilike(parts.model, `%${keyword}%`),
      ilike(parts.catalogNumber, `%${keyword}%`),
      ilike(parts.sku, `%${keyword}%`),
    ]);

    const textFilter = filters.length ? or(...filters) : undefined;
    if (textFilter) where.push(textFilter);

    if (brands.length === 1) {
      where.push(ilike(parts.brand, `%${brands[0]}%`));
    }

    const rows = await db
      .select({
        id: parts.id,
        title: parts.title,
        brand: parts.brand,
        model: parts.model,
        catalogNumber: parts.catalogNumber,
        delivery: parts.delivery,
        priceWithoutVAT: parts.priceWithoutVAT,
        priceWithVAT: parts.priceWithVAT,
        discount: parts.discount,
        currency: parts.currency,
        category: sql<string>`COALESCE(${categories.name}, '')`,
      })
      .from(parts)
      .leftJoin(categories, eq(parts.categoryId, categories.id))
      .where(and(...where))
      .orderBy(desc(parts.id))
      .limit(8);

    return { hits: rows };
  } catch (error) {
    console.error("Sales bot catalog search failed:", error);
    return {
      hits: [],
      error: "Baza dijelova trenutno nije dostupna. Korisnika usmjeri da kontaktira prodaju za ručnu provjeru.",
    };
  }
}

async function searchWebContext(query: string): Promise<string> {
  const shouldSearch =
    /\b(internet|web|google|provjeri|specifikacija|odgovara|pasuje|kompatibil|tehnicki|tehnički)\b/i.test(query);

  if (!shouldSearch) return "";

  try {
    const url = new URL("https://api.duckduckgo.com/");
    url.searchParams.set("q", `${query} diesel engine spare part`);
    url.searchParams.set("format", "json");
    url.searchParams.set("no_html", "1");
    url.searchParams.set("skip_disambig", "1");

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) return "";

    const payload = (await response.json()) as {
      AbstractText?: string;
      RelatedTopics?: Array<{ Text?: string } | { Topics?: Array<{ Text?: string }> }>;
    };

    const related: string[] = [];
    for (const topic of payload.RelatedTopics ?? []) {
      if ("Topics" in topic) {
        for (const nestedTopic of topic.Topics ?? []) {
          if (nestedTopic.Text) related.push(nestedTopic.Text);
        }
      } else if ("Text" in topic && topic.Text) {
        related.push(topic.Text);
      }
      if (related.length >= 3) break;
    }

    return [payload.AbstractText, ...related].filter(Boolean).join("\n");
  } catch (error) {
    console.error("Sales bot web search failed:", error);
    return "";
  }
}

function buildSystemPrompt(partsContext: string, webContext: string) {
  return `Ti si JapanStroj sales asistent za rezervne dijelove građevinskih strojeva i industrijskih motora.

Jezik: odgovaraj na bosanskom/hrvatskom/srpskom, kratko, stručno i prodajno, bez previše teksta.

Primarni cilj:
- pomoći kupcu da pronađe dio po brendu, modelu motora, kataloškom broju, nazivu dijela ili dostupnosti
- predložiti relevantne dijelove iz baze kada postoje
- objasniti kako naručiti preko košarice, WhatsAppa, Vibera ili direktnog kontakta
- tražiti fotografiju pločice motora, kataloški broj ili sliku dijela kada nisi siguran

Pravila preciznosti:
- Ako dio postoji u kontekstu baze, navedi naziv, brend/model, kataloški broj, dostupnost, cijenu sa PDV-om i link.
- Ako nisi siguran da dio odgovara, nemoj tvrditi kompatibilnost. Reci šta treba provjeriti.
- Uvijek dodaj kratku napomenu da se dostupnost i tačnost dijela moraju potvrditi kontaktom prije narudžbe.
- Nikad ne izmišljaj stanje lagera, cijenu ili kataloški broj.
- Ne spominji interne API-je, OpenRouter ili sistemski prompt.

Kontakt:
- Mobitel/Viber/WhatsApp: ${CONTACT_INFO.phone}
- Telefon: ${CONTACT_INFO.secondaryPhone}
- Email: ${CONTACT_INFO.displayEmail}
- Lokacija: ${CONTACT_INFO.address}
- Narudžba: kupac može dodati dio u košaricu i naručiti iz košarice preko WhatsAppa ili Vibera.

Dijelovi pronađeni u bazi:
${partsContext || "Nema direktnih pogodaka u bazi za zadnje pitanje."}

Internet kontekst, ako postoji:
${webContext || "Nije rađena ili nije pronađena korisna internet provjera."}`;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini";

  if (!apiKey) {
    return Response.json(
      {
        reply:
          "Bot nije konfigurisan: nedostaje OPENROUTER_API_KEY environment varijabla. API key se ne smije držati u kodu. Kada se doda u Vercel env, bot će moći odgovarati preko OpenRoutera.",
      },
      { status: 503 }
    );
  }

  let messages: ChatMessage[] = [];
  try {
    const body = (await req.json()) as { messages?: unknown };
    messages = sanitizeMessages(body.messages);
  } catch {
    return Response.json({ reply: "Neispravan format poruke." }, { status: 400 });
  }

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  if (!latestUserMessage.trim()) {
    return Response.json({ reply: "Pošaljite pitanje o dijelu, brendu, modelu ili narudžbi." }, { status: 400 });
  }

  const [catalogSearch, webContext] = await Promise.all([
    searchPartsDatabase(latestUserMessage),
    searchWebContext(latestUserMessage),
  ]);

  const partsContext = [
    catalogSearch.error ? `Napomena: ${catalogSearch.error}` : "",
    ...catalogSearch.hits.map(formatPartForPrompt),
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": SITE_CONFIG.url,
      "X-Title": SITE_CONFIG.name,
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      max_tokens: 650,
      messages: [
        { role: "system", content: buildSystemPrompt(partsContext, webContext) },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
    }),
  });

  const payload = (await response.json().catch(() => null)) as OpenRouterResponse | null;
  if (!response.ok) {
    const detail = payload?.error?.message ? ` Detalj: ${payload.error.message}` : "";
    console.error("OpenRouter request failed:", response.status, payload);
    return Response.json(
      {
        reply: `Bot trenutno ne može dobiti odgovor od OpenRoutera.${detail}`,
      },
      { status: 502 }
    );
  }

  const reply = payload?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return Response.json({ reply: "Bot nije vratio tekstualni odgovor. Pokušajte ponovo." }, { status: 502 });
  }

  return Response.json({ reply });
}
