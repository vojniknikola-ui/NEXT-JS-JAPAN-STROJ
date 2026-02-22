import { del, put } from "@vercel/blob";
import { requireAdminRole } from "@/lib/auth/adminSession";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = requireAdminRole(req, ["admin", "editor"]);
  if ("response" in auth) return auth.response;

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return new Response("file missing", { status: 400 });

  const filename = `parts/${Date.now()}-${file.name}`;
  const blob = await put(filename, file, { access: "public", addRandomSuffix: true });
  return Response.json({ url: blob.url });
}

export async function DELETE(req: Request) {
  const auth = requireAdminRole(req, ["admin", "editor"]);
  if ("response" in auth) return auth.response;

  try {
    const payload = (await req.json().catch(() => ({}))) as { url?: string };
    const imageUrl = payload.url?.trim();
    if (!imageUrl) {
      return Response.json({ error: "URL slike je obavezan." }, { status: 400 });
    }

    await del(imageUrl);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error deleting blob image:", error);
    return Response.json(
      { error: "Brisanje slike na serveru nije uspjelo." },
      { status: 500 }
    );
  }
}
