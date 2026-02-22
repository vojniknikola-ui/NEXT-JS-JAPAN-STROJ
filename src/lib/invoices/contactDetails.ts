const PHONE_PREFIX = "Tel:";
const EMAIL_PREFIX = "Email:";

export type ParsedCustomerContact = {
  name: string;
  phone: string;
  email: string;
};

function normalizeText(value: string | null | undefined) {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim();
}

export function isValidEmail(value: string) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function formatCustomerContactSummary(input: {
  name: string;
  phone?: string | null;
  email?: string | null;
}) {
  const name = normalizeText(input.name);
  const phone = normalizeText(input.phone ?? "");
  const email = normalizeText(input.email ?? "");

  const segments = [];
  if (name) segments.push(name);
  if (phone) segments.push(`${PHONE_PREFIX} ${phone}`);
  if (email) segments.push(`${EMAIL_PREFIX} ${email}`);

  return segments.join(" | ").slice(0, 200);
}

export function parseCustomerContactSummary(
  value: string | null | undefined
): ParsedCustomerContact {
  const raw = normalizeText(value);
  if (!raw) {
    return { name: "", phone: "", email: "" };
  }

  const segments = raw
    .split("|")
    .map((segment) => normalizeText(segment))
    .filter(Boolean);

  if (!segments.length) {
    return { name: raw, phone: "", email: "" };
  }

  let name = "";
  let phone = "";
  let email = "";

  for (const segment of segments) {
    const normalized = segment.toLowerCase();
    if (normalized.startsWith("tel:") || normalized.startsWith("telefon:")) {
      if (!phone) {
        const [, ...rest] = segment.split(":");
        phone = normalizeText(rest.join(":"));
      }
      continue;
    }
    if (
      normalized.startsWith("email:") ||
      normalized.startsWith("e-mail:") ||
      normalized.startsWith("mail:")
    ) {
      if (!email) {
        const [, ...rest] = segment.split(":");
        email = normalizeText(rest.join(":"));
      }
      continue;
    }
    name = name ? `${name} | ${segment}` : segment;
  }

  return {
    name: name || raw,
    phone,
    email,
  };
}
