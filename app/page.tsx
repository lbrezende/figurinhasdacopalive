import Link from "next/link";
import { auth } from "@/lib/auth";
import { MapExplorerSection } from "@/components/map-explorer-section";
import { LiveReminderModal } from "@/components/live-reminder-modal";

const FEATURES = [
  { icon: "📒", title: "Controle total do álbum", desc: "Marque o que você tem e o que está repetida em um toque. O app calcula o que falta em tempo real." },
  { icon: "🤝", title: "Match na sua cidade", desc: "Cruzamos suas repetidas com as faltas de quem está perto e mostramos o melhor par de troca." },
  { icon: "📍", title: "Ponto e horário marcados", desc: "Sugerimos lugares seguros e combinamos o horário. Você só aparece pra trocar." },
  { icon: "🎁", title: "Pacote diário grátis", desc: "Todo dia um pacote de 5 figurinhas por nossa conta pra acelerar o álbum." },
  { icon: "⭐", title: "Raridades na hora", desc: "O app avisa quando bate uma Lendária ou Rara pra você negociar melhor." },
  { icon: "🔒", title: "Tudo salvo na nuvem", desc: "Sua coleção sincronizada e segura. Acesse de qualquer aparelho." },
];

const STEPS = [
  { n: "1", title: "Crie sua conta", desc: "Entre com Google ou e-mail. Seu álbum é montado na hora." },
  { n: "2", title: "Marque suas figurinhas", desc: "Toque no que tem e marque as repetidas. O app entende o que falta." },
  { n: "3", title: "Receba os matches", desc: "Veja quem perto de você fecha a troca e marque o encontro." },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* Lembrete da próxima live (modal dismissível) */}
      <LiveReminderModal />

      {/* Mapa de trocas em tela cheia (primeiro contato) */}
      <MapExplorerSection isLoggedIn={isLoggedIn} userName={session?.user?.name ?? null} />

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-14 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary">
            ⚽ Álbum da Copa do Mundo 2026 e muito mais
          </span>
          <h1 className="mx-auto max-w-[16ch] text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl">
            Pare de caçar troca.{" "}
            <span className="text-primary">A gente acha por você.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[56ch] text-lg leading-relaxed text-body">
            O Figura Certa organiza seu álbum, descobre quem na <b className="text-ink">sua cidade</b> tem a
            figurinha que falta — e ainda marca o ponto e a hora do encontro. Você só aparece e cola. 🎉
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-primary px-7 py-3.5 text-base font-semibold text-on-primary transition hover:bg-primary-active"
            >
              Começar agora — é grátis
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-ink px-7 py-3.5 text-base font-semibold text-ink transition hover:bg-surface-soft"
            >
              Já tenho álbum
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted">14 dias grátis · Sem cartão pra começar</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Tudo num app só
          </p>
          <h2 className="mx-auto mb-12 max-w-[20ch] text-center text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Do álbum ao aperto de mão
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-hairline bg-canvas p-6 transition hover:shadow-[var(--shadow-airbnb)]"
              >
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-2xl">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-ink">{f.title}</h3>
                <p className="leading-relaxed text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-primary">Em 3 passos</p>
          <h2 className="mx-auto mb-12 max-w-[20ch] text-center text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Comece a trocar hoje mesmo
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-hairline bg-canvas p-7">
                <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-primary text-lg font-bold text-on-primary">
                  {s.n}
                </div>
                <h3 className="mb-1.5 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="leading-relaxed text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-md">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-primary">Preço</p>
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-ink sm:text-4xl">Simples e justo</h2>
          <div className="rounded-2xl border border-hairline bg-canvas p-8 text-center shadow-[var(--shadow-airbnb)]">
            <div className="text-sm font-bold uppercase tracking-wide text-primary">PRO</div>
            <div className="mt-2 text-5xl font-bold tracking-tight text-ink">
              R$ 19,90<span className="text-lg font-semibold text-muted">/mês</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-left text-sm text-body">
              <li>✅ Álbuns ilimitados</li>
              <li>✅ Matches de troca na sua cidade</li>
              <li>✅ Pacote diário grátis</li>
              <li>✅ Encontros marcados</li>
            </ul>
            <Link
              href="/login"
              className="mt-8 block rounded-lg bg-primary px-8 py-3.5 font-semibold text-on-primary transition hover:bg-primary-active"
            >
              Começar 14 dias grátis
            </Link>
            <p className="mt-3 text-xs text-muted">Sem cartão pra testar. Cancele quando quiser.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-hairline px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-sm">⚽</span>
            Figura Certa
          </div>
          <div>Feito pra quem leva figurinha a sério. © 2026</div>
        </div>
      </footer>
    </div>
  );
}
