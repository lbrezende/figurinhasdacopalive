import Link from "next/link";
import { signIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="mb-8 flex items-center gap-2.5 font-display text-lg font-extrabold">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] text-base">
          ⚽
        </span>
        Figura Certa
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#151d33] p-8">
        <h1 className="font-display text-2xl font-bold">Entrar no seu álbum</h1>
        <p className="mt-2 text-sm text-muted">
          Crie sua conta em segundos. Os primeiros 14 dias são grátis. 🎉
        </p>

        <form
          action={async () => {
            "use server";
            const sp = await searchParams;
            await signIn("google", { redirectTo: sp.callbackUrl || "/app" });
          }}
          className="mt-6"
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 font-display text-sm font-bold text-[#1f1f1f] transition hover:-translate-y-0.5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
            </svg>
            Continuar com Google
          </button>
        </form>

        <p className="mt-5 text-xs text-muted">
          Ao entrar, você concorda com os termos de uso. Login por e-mail chega em breve.
        </p>
      </div>

      <Link href="/" className="mt-6 text-sm text-muted underline-offset-4 hover:underline">
        ← Voltar pra home
      </Link>
    </main>
  );
}
