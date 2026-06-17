import Link from "next/link";
import { MapExplorerSection } from "@/components/map-explorer-section";

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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Mapa de trocas em tela cheia (primeiro contato) */}
      <MapExplorerSection />

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-14 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ffd23f]/25 bg-[#ffd23f]/10 px-4 py-1.5 text-sm font-semibold text-[#ffd23f]">
            ⚽ Álbum da Copa do Mundo 2026 e muito mais
          </span>
          <h1 className="mx-auto max-w-[14ch] font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            Pare de caçar troca.{" "}
            <span className="bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] bg-clip-text text-transparent">
              A gente acha por você.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-[56ch] text-lg leading-relaxed text-muted">
            O Figura Certa organiza seu álbum, descobre quem na <b className="text-foreground">sua cidade</b> tem a
            figurinha que falta — e ainda marca o ponto e a hora do encontro. Você só aparece e cola. 🎉
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] px-8 py-4 font-display text-base font-bold text-[#0d0903] shadow-lg shadow-[#ffd23f]/30 transition hover:-translate-y-0.5"
            >
              Começar agora — é grátis
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/10 px-8 py-4 font-display text-base font-bold transition hover:bg-white/5"
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
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#ffd23f]">
            Tudo num app só
          </p>
          <h2 className="mx-auto mb-12 max-w-[20ch] text-center font-display text-3xl font-extrabold sm:text-4xl">
            Do álbum ao aperto de mão
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-[#151d33]/55 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-[#ffd23f]/30"
              >
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] text-2xl">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
                <p className="leading-relaxed text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#ffd23f]">Em 3 passos</p>
          <h2 className="mx-auto mb-12 max-w-[20ch] text-center font-display text-3xl font-extrabold sm:text-4xl">
            Comece a trocar hoje mesmo
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-[#151d33] p-7">
                <div className="mb-2 bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] bg-clip-text font-display text-4xl font-black text-transparent">
                  {s.n}
                </div>
                <h3 className="mb-1.5 text-lg font-bold">{s.title}</h3>
                <p className="leading-relaxed text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-md">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#ffd23f]">Preço</p>
          <h2 className="mb-10 text-center font-display text-3xl font-extrabold sm:text-4xl">Simples e justo</h2>
          <div className="rounded-3xl border border-[#ffd23f]/25 bg-gradient-to-b from-[#ffd23f]/10 to-transparent p-8 text-center">
            <div className="font-display text-sm font-bold uppercase tracking-wide text-[#ffd23f]">PRO</div>
            <div className="mt-2 font-display text-5xl font-black">
              R$ 19,90<span className="text-lg font-semibold text-muted">/mês</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-left text-sm">
              <li>✅ Álbuns ilimitados</li>
              <li>✅ Matches de troca na sua cidade</li>
              <li>✅ Pacote diário grátis</li>
              <li>✅ Encontros marcados</li>
            </ul>
            <Link
              href="/login"
              className="mt-8 block rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] px-8 py-4 font-display font-bold text-[#0d0903] transition hover:-translate-y-0.5"
            >
              Começar 14 dias grátis
            </Link>
            <p className="mt-3 text-xs text-muted">Sem cartão pra testar. Cancele quando quiser.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <div className="flex items-center gap-2 font-display font-bold text-foreground">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] text-sm">
              ⚽
            </span>
            Figura Certa
          </div>
          <div>Feito pra quem leva figurinha a sério. © 2026</div>
        </div>
      </footer>
    </div>
  );
}
