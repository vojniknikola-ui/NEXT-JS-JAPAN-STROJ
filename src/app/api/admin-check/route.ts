import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("admin")?.value;
  if (cookie === "1") {
    return new Response("OK", { status: 200 });
  }
  return new Response("Unauthorized", { status: 401 });
}