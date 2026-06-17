"use client";

import dynamic from "next/dynamic";
import { totalTraders, TRADE_POINTS } from "@/lib/map-points";

// Leaflet só roda no client (usa window) → ssr:false
const TradeMap = dynamic(() => import("./trade-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[460px] place-items-center rounded-2xl border border-white/10 bg-[#0a0f1e] text-muted">
      Carregando mapa…
    </div>
  ),
});

export function MapSection() {
  return (
    <section className="px-6 py-16" id="mapa">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#ffd23f]">
          Mapa de trocas ao vivo
        </p>
        <h2 className="mx-auto mb-3 max-w-[22ch] text-center font-display text-3xl font-extrabold sm:text-4xl">
          Veja onde estão as figurinhas que faltam pra você
        </h2>
        <p className="mx-auto mb-10 max-w-[56ch] text-center text-muted">
          {TRADE_POINTS.length} pontos de troca · {totalTraders()} colecionadores por perto. Clique num ponto pra ver o
          que oferecem — os contatos liberam quando você cria sua conta.
        </p>
        <TradeMap />
      </div>
    </section>
  );
}
