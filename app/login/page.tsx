import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="mb-8 flex items-center gap-2.5 font-display text-lg font-extrabold">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] text-base">
          ⚽
        </span>
        Figura Certa
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#151d33] p-8">
        <h1 className="font-display text-2xl font-bold">Entrar</h1>
        <p className="mt-2 text-sm text-muted">
          O login (Google + e-mail) está sendo conectado. Volta já já. 🔧
        </p>
        <Link
          href="/"
          className="mt-6 block rounded-xl border border-white/10 px-6 py-3 text-sm font-bold transition hover:bg-white/5"
        >
          Voltar pra home
        </Link>
      </div>
    </main>
  );
}
