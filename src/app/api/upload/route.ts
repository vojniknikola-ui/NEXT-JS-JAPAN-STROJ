import { put } from "@vercel/blob";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return new Response("file missing", { status: 400 });

  const filename = `parts/${Date.now()}-${file.name}`;
  const blob = await put(filename, file, { access: "public", addRandomSuffix: true });
  return Response.json({ url: blob.url });
}