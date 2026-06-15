import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { daysLeftInTrial, hasAccess, isTrialActive } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default async function AppHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const trialDays = daysLeftInTrial(user);
  const access = hasAccess(user);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-display text-lg font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] text-base">
            ⚽
          </span>
          Figura Certa
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/5">
            Sair
          </button>
        </form>
      </div>

      {isTrialActive(user) && (
        <div className="mt-6 rounded-2xl border border-[#ffd23f]/25 bg-[#ffd23f]/10 px-5 py-4 text-sm">
          🎁 Você está no período grátis — <b>{trialDays}</b>{" "}
          {trialDays === 1 ? "dia restante" : "dias restantes"}.{" "}
          <a href="/settings/billing" className="font-bold text-[#ffd23f] underline underline-offset-2">
            Fazer upgrade
          </a>
        </div>
      )}

      <h1 className="mt-8 font-display text-3xl font-black">
        Olá, {user.name?.split(" ")[0] || "colecionador"}! 👋
      </h1>
      <p className="mt-2 text-muted">
        {access
          ? "Tudo certo por aqui. Seu álbum e os matches de troca chegam nas próximas etapas."
          : "Seu período grátis terminou. Assine o PRO para continuar."}
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-[#151d33] p-6">
        <h2 className="text-lg font-bold">Sua conta</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">E-mail</dt><dd>{user.email}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Plano</dt><dd>{user.plan}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Cidade</dt><dd>{user.city || "—"}</dd></div>
        </dl>
      </div>
    </main>
  );
}
