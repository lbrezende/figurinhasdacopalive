import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#070a13]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5 font-display font-extrabold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] text-sm">
                ⚽
              </span>
              <span className="leading-none">
                Figura Certa
                <span className="ml-2 rounded-md border border-[#ffd23f]/25 bg-[#ffd23f]/10 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-[#ffd23f]">
                  Admin
                </span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span className="hidden sm:inline">{admin.email}</span>
            <Link
              href="/app"
              className="rounded-lg border border-white/10 px-3 py-1.5 font-semibold text-foreground transition hover:bg-white/5"
            >
              Ir pro app →
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-7">{children}</main>
    </div>
  );
}
