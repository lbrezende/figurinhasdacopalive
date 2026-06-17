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
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b border-hairline bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5 font-bold text-ink">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm">
                ⚽
              </span>
              <span className="leading-none">
                Figura Certa
                <span className="ml-2 rounded-md border border-primary/25 bg-primary-soft px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-primary">
                  Admin
                </span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span className="hidden sm:inline">{admin.email}</span>
            <Link
              href="/app"
              className="rounded-lg border border-hairline px-3 py-1.5 font-semibold text-ink transition hover:bg-surface-soft"
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
