import { del, put } from "@vercel/blob";
import { requireAdminRole } from "@/lib/auth/adminSession";
export const runtime = "nodejs";

import sharp from "sharp";

export async function POST(req: Request) {
  const auth = requireAdminRole(req, ["admin", "editor"]);
  if ("response" in auth) return auth.response;

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return new Response("file missing", { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  
  // 1. Generate display-safe WebP with capped dimensions.
  const optimizedBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toBuffer();

  // 2. Generate compact catalog thumbnail.
  const thumbBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: 320, height: 320, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 68, effort: 5 })
    .toBuffer();

  // 3. Generate blur placeholder
  const blurBuffer = await sharp(buffer)
    .rotate()
    .resize(10, 10, { fit: "inside" })
    .webp({ quality: 20 })
    .blur()
    .toBuffer();
  
  const blurData = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  const baseName = `parts/${Date.now()}`;
  
  const [blobOriginal, blobThumb] = await Promise.all([
    put(`${baseName}-main.webp`, optimizedBuffer, { access: "public", addRandomSuffix: true }),
    put(`${baseName}-thumb.webp`, thumbBuffer, { access: "public", addRandomSuffix: true })
  ]);

  return Response.json({ 
    url: blobOriginal.url, 
    thumbUrl: blobThumb.url,
    blurData
  });
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
