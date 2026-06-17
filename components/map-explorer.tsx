"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from "react-leaflet";
import { TRADE_POINTS, traderInitials, type TradePoint } from "@/lib/map-points";

const POPULAR = [7, 9, 10, 18, 22, 27, 30, 100];

function matchInfo(p: TradePoint, wanted: number[]) {
  if (!wanted.length) return { count: p.traders.length, nums: [] as number[] };
  const nums = new Set<number>();
  p.traders.forEach((t) => t.offers.forEach((o) => { if (wanted.includes(o)) nums.add(o); }));
  return { count: nums.size, nums: [...nums] };
}

function pillIcon(label: string, active: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="transform:translate(-50%,-50%)">
      <div style="
        background:${active ? "#0d0903" : "#fff"};color:${active ? "#ffd23f" : "#0d0903"};
        font-weight:800;font-size:12px;padding:6px 11px;border-radius:999px;white-space:nowrap;
        box-shadow:0 3px 10px rgba(0,0,0,.4);border:1px solid rgba(0,0,0,.08);
        font-family:sans-serif;transition:all .15s;${active ? "transform:scale(1.1)" : ""}
      ">${label}</div></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function FlyTo({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 14, { duration: 1.2 }); }, [center, map]);
  return null;
}

export default function MapExplorer({ isLoggedIn = false, userName }: { isLoggedIn?: boolean; userName?: string | null }) {
  const [wanted, setWanted] = useState<number[]>([]);
  const [customNum, setCustomNum] = useState("");
  const [address, setAddress] = useState("");
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [youAt, setYouAt] = useState<[number, number] | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [selected, setSelected] = useState<TradePoint | null>(null);

  function toggleNum(n: number) {
    setWanted((w) => (w.includes(n) ? w.filter((x) => x !== n) : [...w, n]));
  }
  function addCustom() {
    const n = parseInt(customNum, 10);
    if (n > 0 && !wanted.includes(n)) setWanted((w) => [...w, n]);
    setCustomNum("");
  }

  async function searchAddress(e?: React.FormEvent) {
    e?.preventDefault();
    if (!address.trim()) return;
    setGeoMsg("Buscando endereço…");
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`);
      const j = await r.json();
      if (j[0]) { setCenter([+j[0].lat, +j[0].lon]); setYouAt([+j[0].lat, +j[0].lon]); setGeoMsg(null); }
      else setGeoMsg("Endereço não encontrado 🤔");
    } catch { setGeoMsg("Não consegui buscar agora."); }
  }

  function useMyLocation() {
    if (!navigator.geolocation) { setGeoMsg("Geolocalização indisponível."); return; }
    setGeoMsg("Localizando você…");
    navigator.geolocation.getCurrentPosition(
      (pos) => { const c: [number, number] = [pos.coords.latitude, pos.coords.longitude]; setCenter(c); setYouAt(c); setGeoMsg(null); },
      () => setGeoMsg("Não consegui pegar sua localização."),
    );
  }

  const visible = useMemo(
    () => TRADE_POINTS.map((p) => ({ p, m: matchInfo(p, wanted) })).filter(({ m }) => (wanted.length ? m.count > 0 : true)),
    [wanted],
  );

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <MapContainer
        center={[-23.5675, -46.66]}
        zoom={12}
        zoomControl={false}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", background: "#0a0f1e" }}
      >
        <TileLayer
          className="map-tiles-dark"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ZoomControl position="bottomright" />
        <FlyTo center={center} />
        {youAt && <Marker position={youAt} icon={pillIcon("📍 Você", false)} />}
        {visible.map(({ p, m }) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={pillIcon(wanted.length ? `🎯 ${m.count}` : `👥 ${m.count}`, selected?.id === p.id)}
            eventHandlers={{ click: () => setSelected(p) }}
          />
        ))}
      </MapContainer>

      {/* Barra superior (overlay) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-3 sm:p-4">
        <div className="pointer-events-auto mx-auto flex max-w-6xl items-center gap-3">
          <form onSubmit={searchAddress} className="flex flex-1 items-center gap-2 rounded-full border border-black/10 bg-white px-2 py-1.5 shadow-lg">
            <span className="pl-2 text-[#0d0903]">📍</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Digite seu endereço ou cidade…"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#0d0903] outline-none placeholder:text-gray-400"
            />
            <button type="button" onClick={useMyLocation} className="hidden whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 sm:block">
              Perto de mim
            </button>
            <button type="submit" className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] text-[#0d0903]">🔎</button>
          </form>
          {/* Logo topo direito */}
          <div className="pointer-events-auto flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/app" className="hidden rounded-full border border-[#ffd23f]/40 bg-[#ffd23f]/15 px-4 py-2 text-sm font-bold text-[#ffd23f] backdrop-blur hover:bg-[#ffd23f]/25 sm:block">
                📒 Meu álbum{userName ? ` · ${userName.split(" ")[0]}` : ""}
              </Link>
            ) : (
              <Link href="/login?callbackUrl=/" className="hidden rounded-full border border-white/15 bg-[#070a13]/70 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/10 sm:block">
                Entrar
              </Link>
            )}
            <Link href="/" className="flex items-center gap-2 rounded-full bg-[#070a13]/70 px-3 py-2 font-display text-sm font-extrabold text-white backdrop-blur">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] text-sm">⚽</span>
              <span className="hidden sm:block">Figura Certa</span>
            </Link>
          </div>
        </div>

        {/* Filtros de figurinha */}
        <div className="pointer-events-auto mx-auto mt-3 max-w-6xl">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#070a13]/75 p-2.5 backdrop-blur">
            <span className="px-1 text-xs font-semibold text-muted">Filtrar por figurinha:</span>
            {POPULAR.map((n) => (
              <button key={n} onClick={() => toggleNum(n)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${wanted.includes(n) ? "bg-[#ffd23f] text-[#0d0903]" : "bg-white/8 text-white/80 hover:bg-white/15"}`}>
                #{n}
              </button>
            ))}
            <div className="flex items-center gap-1 rounded-full bg-white/8 px-2 py-0.5">
              <input value={customNum} onChange={(e) => setCustomNum(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustom()}
                inputMode="numeric" placeholder="nº" className="w-12 bg-transparent text-xs text-white outline-none placeholder:text-white/40" />
              <button onClick={addCustom} className="text-xs font-bold text-[#ffd23f]">+</button>
            </div>
            {wanted.length > 0 && (
              <button onClick={() => setWanted([])} className="ml-auto rounded-full px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-white/10">
                Limpar ({wanted.length})
              </button>
            )}
          </div>
          {(geoMsg || wanted.length > 0) && (
            <p className="mt-2 inline-block rounded-lg bg-[#070a13]/80 px-3 py-1 text-xs text-muted backdrop-blur">
              {geoMsg ?? `Mostrando ${visible.length} ponto(s) com as figurinhas selecionadas`}
            </p>
          )}
        </div>
      </div>

      {/* Card do ponto selecionado (estilo Airbnb) */}
      {selected && (
        <div className="absolute bottom-6 left-1/2 z-[500] w-[92%] max-w-sm -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1221] shadow-2xl">
          <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-[#ffd23f]/30 to-[#ff8a00]/20 text-5xl">
            🤝
            <button onClick={() => setSelected(null)} className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-black/40 text-white">✕</button>
          </div>
          <div className="p-4">
            <h3 className="font-display text-lg font-bold">{selected.name}</h3>
            <p className="text-xs text-muted">{selected.area}</p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
              👥 {selected.traders.length} colecionadores aqui
            </div>
            <div className="mt-3 max-h-44 space-y-2 overflow-y-auto">
              {selected.traders.map((tr) => (
                <div key={tr.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0a0f1e]/60 p-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-[#0d0903]" style={{ background: tr.color }}>
                    {traderInitials(tr)}
                  </span>
                  <div className="min-w-0 flex-1">
                    {isLoggedIn ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{tr.name}</span>
                        <a href={`https://wa.me/${tr.whatsapp}`} target="_blank" rel="noopener noreferrer"
                          className="shrink-0 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30">
                          💬 WhatsApp
                        </a>
                      </div>
                    ) : (
                      <div>
                        <span className="select-none rounded bg-white/10 px-2 py-0.5 text-xs blur-[3px]">Nome Sobrenome</span> <span className="text-xs">🔒</span>
                      </div>
                    )}
                    <div className="mt-1 truncate text-xs text-muted">
                      Oferece:{" "}
                      {tr.offers.map((o, i) => (
                        <span key={o} className={wanted.includes(o) ? "font-bold text-[#ffd23f]" : ""}>{o}{i < tr.offers.length - 1 ? ", " : ""}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {isLoggedIn ? (
              <Link href="/app" className="mt-4 block rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] py-2.5 text-center font-display text-sm font-bold text-[#0d0903]">
                📒 Abrir meu álbum e marcar troca
              </Link>
            ) : (
              <Link href="/login?callbackUrl=/" className="mt-4 block rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] py-2.5 text-center font-display text-sm font-bold text-[#0d0903]">
                🔒 Fazer login pra ver os contatos
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Dica de scroll */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-[400] -translate-x-1/2 text-center text-xs text-white/60">
        {!selected && "↓ role pra conhecer o app"}
      </div>
    </section>
  );
}
