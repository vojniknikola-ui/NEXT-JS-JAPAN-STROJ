import crypto from "node:crypto";

export type AdminRole = "admin" | "editor" | "read_only";

type SessionPayload = {
  role: AdminRole;
  exp: number;
};

const COOKIE_NAME = "admin_session";
const DEFAULT_TTL_SECONDS = 60 * 60 * 12; // 12h

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "dev-admin-secret-change-me";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      role?: unknown;
      exp?: unknown;
    };

    if (
      (parsed.role === "admin" || parsed.role === "editor" || parsed.role === "read_only") &&
      typeof parsed.exp === "number"
    ) {
      return { role: parsed.role, exp: parsed.exp };
    }
    return null;
  } catch {
    return null;
  }
}

function parseCookieHeader(cookieHeader: string | null) {
  const result = new Map<string, string>();
  if (!cookieHeader) return result;

  for (const entry of cookieHeader.split(";")) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex < 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    result.set(key, value);
  }
  return result;
}

export function createAdminSessionCookie(role: AdminRole, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payloadEncoded = encodePayload({ role, exp });
  const signature = sign(payloadEncoded);
  const token = `${payloadEncoded}.${signature}`;

  const cookieParts = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${ttlSeconds}`,
  ];

  if (process.env.NODE_ENV === "production") {
    cookieParts.push("Secure");
  }

  return cookieParts.join("; ");
}

export function clearAdminSessionCookie() {
  const cookieParts = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (process.env.NODE_ENV === "production") {
    cookieParts.push("Secure");
  }
  return cookieParts.join("; ");
}

export function getAdminRoleFromRequest(request: Request): AdminRole | null {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookieHeader(cookieHeader);
  const token = cookies.get(COOKIE_NAME);
  if (!token) return null;

  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return null;
  if (sign(payloadEncoded) !== signature) return null;

  const payload = decodePayload(payloadEncoded);
  if (!payload) return null;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) return null;
  return payload.role;
}

export function roleLabel(role: AdminRole) {
  if (role === "admin") return "Admin";
  if (role === "editor") return "Editor";
  return "Read-only";
}

export function canReadAdmin(role: AdminRole | null) {
  return role === "admin" || role === "editor" || role === "read_only";
}

export function canEditAdmin(role: AdminRole | null) {
  return role === "admin" || role === "editor";
}

export function canDeleteAdmin(role: AdminRole | null) {
  return role === "admin";
}

export function requireAdminRole(
  request: Request,
  allowedRoles: AdminRole[]
): { role: AdminRole } | { response: Response } {
  const role = getAdminRoleFromRequest(request);
  if (!role) {
    return {
      response: Response.json(
        { error: "Niste prijavljeni. Prijavite se za pristup admin API-ju." },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(role)) {
    return {
      response: Response.json(
        { error: "Nemate dozvolu za ovu akciju." },
        { status: 403 }
      ),
    };
  }

  return { role };
}
