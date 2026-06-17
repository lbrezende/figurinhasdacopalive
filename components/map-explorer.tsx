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

// Marcadores estilo Airbnb: pílula branca com tinta; ativa em Rausch.
function pillIcon(label: string, active: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="transform:translate(-50%,-50%)">
      <div style="
        background:${active ? "#ff385c" : "#ffffff"};color:${active ? "#ffffff" : "#222222"};
        font-weight:700;font-size:13px;padding:7px 13px;border-radius:999px;white-space:nowrap;
        box-shadow:rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.16) 0 2px 8px 0;
        border:1px solid ${active ? "#ff385c" : "#dddddd"};
        font-family:Inter,system-ui,sans-serif;transition:all .15s;${active ? "transform:scale(1.06)" : ""}
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
        style={{ height: "100%", width: "100%", background: "#f7f7f7" }}
      >
        <TileLayer
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
          <form onSubmit={searchAddress} className="flex flex-1 items-center gap-2 rounded-full border border-hairline bg-canvas px-2 py-1.5 shadow-[var(--shadow-airbnb)]">
            <span className="pl-2 text-ink">📍</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Digite seu endereço ou cidade…"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted-soft"
            />
            <button type="button" onClick={useMyLocation} className="hidden whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface-soft sm:block">
              Perto de mim
            </button>
            <button type="submit" className="grid h-9 w-9 place-items-center rounded-full bg-primary text-on-primary transition hover:bg-primary-active">🔎</button>
          </form>
          {/* Logo topo direito */}
          <div className="pointer-events-auto flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/app" className="hidden rounded-full border border-primary/30 bg-primary-soft px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 sm:block">
                📒 Meu álbum{userName ? ` · ${userName.split(" ")[0]}` : ""}
              </Link>
            ) : (
              <Link href="/login?callbackUrl=/" className="hidden rounded-full border border-hairline bg-canvas px-4 py-2 text-sm font-semibold text-ink shadow-[var(--shadow-airbnb)] hover:bg-surface-soft sm:block">
                Entrar
              </Link>
            )}
            <Link href="/" className="flex items-center gap-2 rounded-full border border-hairline bg-canvas px-3 py-2 text-sm font-bold text-ink shadow-[var(--shadow-airbnb)]">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-sm">⚽</span>
              <span className="hidden sm:block">Figura Certa</span>
            </Link>
          </div>
        </div>

        {/* Filtros de figurinha */}
        <div className="pointer-events-auto mx-auto mt-3 max-w-6xl">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-hairline bg-canvas p-2.5 shadow-[var(--shadow-airbnb)]">
            <span className="px-1 text-xs font-semibold text-muted">Filtrar por figurinha:</span>
            {POPULAR.map((n) => (
              <button key={n} onClick={() => toggleNum(n)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${wanted.includes(n) ? "bg-primary text-on-primary" : "bg-surface-soft text-body hover:bg-surface-strong"}`}>
                #{n}
              </button>
            ))}
            <div className="flex items-center gap-1 rounded-full bg-surface-soft px-2 py-0.5">
              <input value={customNum} onChange={(e) => setCustomNum(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustom()}
                inputMode="numeric" placeholder="nº" className="w-12 bg-transparent text-xs text-ink outline-none placeholder:text-muted-soft" />
              <button onClick={addCustom} className="text-xs font-bold text-primary">+</button>
            </div>
            {wanted.length > 0 && (
              <button onClick={() => setWanted([])} className="ml-auto rounded-full px-3 py-1 text-xs font-semibold text-error hover:bg-surface-soft">
                Limpar ({wanted.length})
              </button>
            )}
          </div>
          {(geoMsg || wanted.length > 0) && (
            <p className="mt-2 inline-block rounded-full border border-hairline bg-canvas px-3 py-1 text-xs text-muted shadow-[var(--shadow-airbnb)]">
              {geoMsg ?? `Mostrando ${visible.length} ponto(s) com as figurinhas selecionadas`}
            </p>
          )}
        </div>
      </div>

      {/* Card do ponto selecionado (estilo Airbnb) */}
      {selected && (
        <div className="absolute bottom-6 left-1/2 z-[500] w-[92%] max-w-sm -translate-x-1/2 overflow-hidden rounded-3xl border border-hairline bg-canvas shadow-[var(--shadow-airbnb-lg)]">
          <div className="p-5">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-surface-soft text-lg">📍</span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold leading-tight text-ink">{selected.name}</h3>
                  <p className="truncate text-xs text-muted">{selected.area}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Fechar"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-hairline bg-canvas text-muted transition hover:bg-surface-soft hover:text-ink"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
            </div>

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 text-xs font-semibold text-body">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {selected.traders.length} {selected.traders.length === 1 ? "colecionador" : "colecionadores"} aqui
            </div>

            <div className="mt-4 max-h-48 space-y-2.5 overflow-y-auto pr-1">
              {selected.traders.map((tr) => (
                <div key={tr.id} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: tr.color }}>
                    {traderInitials(tr)}
                  </span>
                  <div className="min-w-0 flex-1">
                    {isLoggedIn ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-ink">{tr.name}</span>
                        <a
                          href={`https://wa.me/${tr.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-full bg-[#e7f7ee] px-2.5 py-1 text-xs font-bold text-[#067647] transition hover:bg-[#d3efe0]"
                        >
                          WhatsApp
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="select-none rounded bg-surface-strong px-6 py-0.5 text-xs blur-[4px]" aria-hidden>•••• ••••</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-soft">
                          <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
                        </svg>
                      </div>
                    )}
                    <div className="mt-0.5 truncate text-xs text-muted">
                      Oferece:{" "}
                      {tr.offers.map((o, i) => (
                        <span key={o} className={wanted.includes(o) ? "font-bold text-primary" : "text-body"}>
                          {o}{i < tr.offers.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-hairline pt-4">
              {isLoggedIn ? (
                <Link href="/app" className="block rounded-xl bg-primary py-3 text-center text-sm font-semibold text-on-primary transition hover:bg-primary-active">
                  Abrir meu álbum e marcar troca
                </Link>
              ) : (
                <>
                  <Link href="/login?callbackUrl=/" className="block rounded-xl bg-primary py-3 text-center text-sm font-semibold text-on-primary transition hover:bg-primary-active">
                    Entrar para ver os contatos
                  </Link>
                  <p className="mt-2 text-center text-xs text-muted">Grátis · nomes e WhatsApp liberam após o login</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dica de scroll */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-[400] -translate-x-1/2 text-center">
        {!selected && (
          <span className="rounded-full border border-hairline bg-canvas/90 px-3 py-1 text-xs text-muted shadow-[var(--shadow-airbnb)] backdrop-blur">
            ↓ role pra conhecer o app
          </span>
        )}
      </div>
    </section>
  );
}
