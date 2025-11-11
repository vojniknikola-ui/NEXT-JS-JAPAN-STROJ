export async function POST(req: Request) {
  const { password } = await req.json();
  if (password !== "citybar") return new Response("Unauthorized", { status: 401 });

  const res = new Response(JSON.stringify({ ok: true }));
  res.headers.set("Set-Cookie", `admin=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
  return res;
}