"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from "react-leaflet";
import { TRADE_POINTS, type TradePoint } from "@/lib/map-points";
import { pillMarkerHtml, poiMarkerHtml } from "@/components/ui/map-markers";
import { TradePointCard } from "@/components/ui/trade-point-card";
import { SearchOrb, StickerFilterBar } from "@/components/ui/search";

function matchInfo(p: TradePoint, wanted: number[]) {
  if (!wanted.length) return { count: p.traders.length, nums: [] as number[] };
  const nums = new Set<number>();
  p.traders.forEach((t) => t.offers.forEach((o) => { if (wanted.includes(o)) nums.add(o); }));
  return { count: nums.size, nums: [...nums] };
}

// divIcons do Leaflet a partir dos builders de HTML do DS (components/ui/map-markers).
function pillIcon(label: string, active: boolean) {
  return L.divIcon({ className: "", html: pillMarkerHtml(label, active), iconSize: [0, 0], iconAnchor: [0, 0] });
}
function poiIcon(label: string, active: boolean) {
  return L.divIcon({ className: "", html: poiMarkerHtml(label, active), iconSize: [0, 0], iconAnchor: [0, 0] });
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

  // --- Autocomplete (Google Places via /api/places) ---
  type Suggestion = { placeId: string; description: string };
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const sessionRef = useRef<string | null>(null);
  const skipFetchRef = useRef(false); // evita re-buscar após escolher uma sugestão

  function newSession() {
    sessionRef.current =
      typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  }

  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }
    const q = address.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    if (!sessionRef.current) newSession();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/places?q=${encodeURIComponent(q)}&session=${sessionRef.current}`,
          { signal: ctrl.signal },
        );
        const j = await r.json();
        setSuggestions(j.suggestions ?? []);
        setShowSuggestions(true);
      } catch {
        /* abortado ou offline — ignora */
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [address]);

  async function pickSuggestion(s: Suggestion) {
    skipFetchRef.current = true;
    setAddress(s.description);
    setShowSuggestions(false);
    setSuggestions([]);
    setGeoMsg("Buscando endereço…");
    try {
      const r = await fetch(`/api/places?id=${encodeURIComponent(s.placeId)}&session=${sessionRef.current}`);
      const j = await r.json();
      if (j.lat != null) {
        setCenter([j.lat, j.lng]);
        setYouAt([j.lat, j.lng]);
        setGeoMsg(null);
      } else setGeoMsg("Não consegui localizar esse endereço.");
    } catch {
      setGeoMsg("Não consegui buscar agora.");
    } finally {
      sessionRef.current = null; // sessão de billing encerra ao escolher
    }
  }

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
    // Se há sugestões do Google, usa a primeira (mais relevante).
    if (suggestions.length > 0) {
      await pickSuggestion(suggestions[0]);
      return;
    }
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
        scrollWheelZoom={false}
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
            icon={poiIcon(String(m.count), selected?.id === p.id)}
            eventHandlers={{ click: () => setSelected(p) }}
          />
        ))}
      </MapContainer>

      {/* Barra superior (overlay) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-3 sm:p-4">
        <div className="pointer-events-auto mx-auto flex max-w-6xl items-center gap-3">
          <SearchOrb
            value={address}
            onChange={setAddress}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            onFocus={() => suggestions.length && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onPick={pickSuggestion}
            onSubmit={searchAddress}
            onNearMe={useMyLocation}
          />
          {/* Auth + logo topo direito — botão de login sempre visível (inclusive no mobile retrato) */}
          <div className="pointer-events-auto flex shrink-0 items-center gap-2">
            {isLoggedIn ? (
              <Link href="/app" className="whitespace-nowrap rounded-full border border-primary/30 bg-primary-soft px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 sm:px-4">
                📒<span className="hidden sm:inline"> Meu álbum{userName ? ` · ${userName.split(" ")[0]}` : ""}</span>
              </Link>
            ) : (
              <Link href="/login?callbackUrl=/" className="whitespace-nowrap rounded-full border border-hairline bg-canvas px-4 py-2 text-sm font-semibold text-ink shadow-[var(--shadow-airbnb)] hover:bg-surface-soft">
                Entrar
              </Link>
            )}
            <Link href="/" className="hidden items-center gap-2 rounded-full border border-hairline bg-canvas px-3 py-2 text-sm font-bold text-ink shadow-[var(--shadow-airbnb)] sm:flex">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-sm">⚽</span>
              <span className="hidden sm:block">Figura Certa</span>
            </Link>
          </div>
        </div>

        {/* Filtros de figurinha */}
        <div className="pointer-events-auto mx-auto mt-3 max-w-6xl">
          <StickerFilterBar
            wanted={wanted}
            onToggle={toggleNum}
            customNum={customNum}
            onCustomChange={setCustomNum}
            onAddCustom={addCustom}
            onClear={() => setWanted([])}
          />
          {(geoMsg || wanted.length > 0) && (
            <p className="mt-2 inline-block rounded-full border border-hairline bg-canvas px-3 py-1 text-xs text-muted shadow-[var(--shadow-airbnb)]">
              {geoMsg ?? `Mostrando ${visible.length} ponto(s) com as figurinhas selecionadas`}
            </p>
          )}
        </div>
      </div>

      {/* Card do ponto selecionado (estilo Airbnb) */}
      {selected && (
        <div className="absolute bottom-6 left-1/2 z-[500] w-[92%] max-w-sm -translate-x-1/2">
          <TradePointCard point={selected} isLoggedIn={isLoggedIn} wanted={wanted} onClose={() => setSelected(null)} />
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
