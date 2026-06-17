import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// E-mails com acesso ao painel /admin.
// Configurável via env ADMIN_EMAILS (separados por vírgula); fallback no dono.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "lbrezende@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Garante que quem acessa é admin.
 * - Sem sessão → manda pro login (volta pra /admin depois).
 * - Logado mas não-admin → 404 (não revela a existência do painel).
 * Retorna o usuário (do banco) quando autorizado.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !isAdmin(user.email)) {
    notFound();
  }
  return user;
}
