import { NextResponse } from "next/server";
import {
  canDeleteAdmin,
  canEditAdmin,
  canReadAdmin,
  clearAdminSessionCookie,
  createAdminSessionCookie,
  getAdminRoleFromRequest,
  roleLabel,
  type AdminRole,
} from "@/lib/auth/adminSession";

export const runtime = "nodejs";

type LoginPayload = {
  username?: string;
  password?: string;
};

function resolveRole(username: string, password: string): AdminRole | null {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const editorUsername = process.env.EDITOR_USERNAME || "editor";
  const readOnlyUsername = process.env.READ_ONLY_USERNAME || "viewer";

  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const editorPassword = process.env.EDITOR_PASSWORD || "editor123";
  const readOnlyPassword = process.env.READ_ONLY_PASSWORD || "viewer123";

  if (username === adminUsername && password === adminPassword) return "admin";
  if (username === editorUsername && password === editorPassword) return "editor";
  if (username === readOnlyUsername && password === readOnlyPassword) return "read_only";
  return null;
}

function permissionsForRole(role: AdminRole | null) {
  return {
    canRead: canReadAdmin(role),
    canEdit: canEditAdmin(role),
    canDelete: canDeleteAdmin(role),
  };
}

export async function GET(request: Request) {
  const role = getAdminRoleFromRequest(request);
  if (!role) {
    return NextResponse.json(
      {
        authenticated: false,
        role: null,
        roleLabel: null,
        permissions: permissionsForRole(null),
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    role,
    roleLabel: roleLabel(role),
    permissions: permissionsForRole(role),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginPayload;
  const username = body.username?.trim() || "";
  const password = body.password || "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Korisničko ime i lozinka su obavezni." },
      { status: 400 }
    );
  }

  const role = resolveRole(username, password);
  if (!role) {
    return NextResponse.json(
      { error: "Neispravni pristupni podaci." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    authenticated: true,
    role,
    roleLabel: roleLabel(role),
    permissions: permissionsForRole(role),
  });
  response.headers.set("Set-Cookie", createAdminSessionCookie(role));
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", clearAdminSessionCookie());
  return response;
}
