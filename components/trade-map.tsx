"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { TRADE_POINTS, type TradePoint } from "@/lib/map-points";

function pinIcon(count: number, active: boolean) {
  return L.divIcon({
    className: "",
    html: `
      <div style="transform:translate(-50%,-100%)">
        <div style="
          display:grid;place-items:center;width:38px;height:38px;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:linear-gradient(135deg,#ffd23f,#ff8a00);
          box-shadow:0 6px 16px rgba(255,138,0,${active ? 0.7 : 0.4});
          border:2px solid ${active ? "#fff" : "rgba(255,255,255,0.5)"};
        ">
          <span style="transform:rotate(45deg);font-weight:800;color:#0d0903;font-size:13px;font-family:sans-serif">${count}</span>
        </div>
      </div>`,
    iconSize: [38, 38],
    iconAnchor: [0, 0],
  });
}

export default function TradeMap() {
  const [selected, setSelected] = useState<TradePoint | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      {/* Mapa */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10">
        <MapContainer
          center={[-23.5675, -46.66]}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: "460px", width: "100%", background: "#0a0f1e" }}
        >
          <TileLayer
            url="https://{s}.basemap.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {TRADE_POINTS.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={pinIcon(p.traders.length, selected?.id === p.id)}
              eventHandlers={{ click: () => setSelected(p) }}
            />
          ))}
        </MapContainer>
        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-lg bg-[#070a13]/80 px-3 py-1.5 text-xs text-muted backdrop-blur">
          📍 Toque num ponto pra ver quem troca ali
        </div>
      </div>

      {/* Painel */}
      <div className="rounded-2xl border border-white/10 bg-[#151d33]/60 p-5">
        {!selected ? (
          <div className="flex h-full flex-col justify-center text-center">
            <div className="text-4xl">🗺️</div>
            <h3 className="mt-3 font-display text-lg font-bold">Trocas perto de você</h3>
            <p className="mt-2 text-sm text-muted">
              Cada pino é um ponto de troca com colecionadores que têm figurinhas que faltam pra você. Clique pra ver
              quantos são e o que oferecem.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold">{selected.name}</h3>
                <p className="text-xs text-muted">{selected.area}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted hover:text-foreground">✕</button>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
              👥 {selected.traders.length} pessoas podem trocar aqui
            </div>

            <div className="mt-4 space-y-2">
              {selected.traders.map((tr) => (
                <div key={tr.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0a0f1e]/60 p-3">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-[#0d0903]"
                    style={{ background: tr.color }}
                  >
                    {tr.initials.replace(/\W/g, "").slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    {/* Nome real escondido até o login */}
                    <div className="flex items-center gap-2">
                      <span className="select-none rounded bg-white/10 px-2 py-0.5 text-xs blur-[3px]">
                        Nome Sobrenome
                      </span>
                      <span className="text-xs text-muted">🔒</span>
                    </div>
                    <div className="mt-1 truncate text-xs text-muted">
                      Oferece: <b className="text-emerald-400">{tr.offers.join(", ")}</b> · busca {tr.wants}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-[#ffd23f]/25 bg-[#ffd23f]/10 p-4 text-center">
              <p className="text-sm font-semibold">🔒 Quer ver quem são e falar com elas?</p>
              <p className="mt-1 text-xs text-muted">Crie sua conta grátis pra desbloquear nomes e contatos.</p>
              <Link
                href="/login?callbackUrl=/app"
                className="mt-3 inline-block w-full rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] px-6 py-3 font-display text-sm font-bold text-[#0d0903] transition hover:-translate-y-0.5"
              >
                Fazer login pra ver os contatos
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
