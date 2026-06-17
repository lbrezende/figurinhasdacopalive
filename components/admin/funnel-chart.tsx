"use client";

import { useState } from "react";
import type { FunnelStep } from "@/lib/admin-metrics";

// Gráfico de funil estilo funnel-graph-js, em SVG próprio (sem dependência):
// cada etapa é um trapézio que afunila conforme o valor cai. Usa os tokens do
// design system (Rausch via var(--primary)) p/ casar com o tema Airbnb.

const W = 1000; // largura em unidades de viewBox (escala 100% no container)
const H = 190; // altura do funil
const MIN_H = 6; // piso visual p/ etapas zeradas (mostra um filete em vez de sumir)

export function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = steps.length;
  if (n === 0) return null;

  const cw = W / n;
  const maxV = Math.max(...steps.map((s) => s.value), 1);
  const hs = steps.map((s) => Math.max((s.value / maxV) * H, MIN_H));

  const cols = steps.map((s, i) => {
    const x0 = i * cw;
    const x1 = (i + 1) * cw;
    const lh = hs[i];
    const rh = i + 1 < n ? hs[i + 1] : hs[i]; // última coluna fica reta
    const d = `M ${x0} ${(H - lh) / 2} L ${x1} ${(H - rh) / 2} L ${x1} ${(H + rh) / 2} L ${x0} ${(H + lh) / 2} Z`;
    const prev = i > 0 ? steps[i - 1] : null;
    const dropoff = prev && prev.value > 0 ? Math.round(((prev.value - s.value) / prev.value) * 100) : 0;
    return { ...s, i, x0, d, dropoff };
  });

  return (
    <div onMouseLeave={() => setHover(null)}>
      {/* Rótulos por etapa, alinhados às colunas do funil */}
      <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
        {cols.map((c) => {
          const active = hover === null || hover === c.i;
          return (
            <div
              key={c.i}
              onMouseEnter={() => setHover(c.i)}
              className={`pb-3 transition-opacity ${c.i > 0 ? "border-l border-hairline-soft pl-2.5" : ""} ${
                active ? "opacity-100" : "opacity-40"
              }`}
            >
              <div className="font-display text-xl font-bold tabular-nums text-ink sm:text-2xl">{c.value}</div>
              <div className="text-[11px] leading-tight text-muted">{c.label}</div>
              <div className="mt-0.5 text-[11px] tabular-nums">
                <span className="text-body">{c.pct}%</span>
                {c.dropoff > 0 && <span className="ml-1 font-semibold text-primary">−{c.dropoff}%</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Funil */}
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" role="img" aria-label="Funil de ativação">
        <defs>
          <linearGradient id="adminFunnelGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2="0">
            <stop offset="0" stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--primary-active)" />
          </linearGradient>
        </defs>
        {cols.map((c) => {
          const active = hover === null || hover === c.i;
          return (
            <g key={c.i} onMouseEnter={() => setHover(c.i)}>
              <path
                d={c.d}
                fill="url(#adminFunnelGrad)"
                opacity={active ? 1 : 0.4}
                style={{ transition: "opacity .15s" }}
              />
              {hover === c.i && (
                <path d={c.d} fill="none" stroke="var(--on-primary)" strokeOpacity="0.6" strokeWidth="1.5" />
              )}
              {/* área transparente p/ capturar hover mesmo em etapas afuniladas/zeradas */}
              <rect x={c.x0} y="0" width={cw} height={H} fill="transparent" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
