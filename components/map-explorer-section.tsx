"use client";

import dynamic from "next/dynamic";

// Leaflet usa window → carrega só no client
const MapExplorer = dynamic(() => import("./map-explorer"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[100svh] w-full place-items-center bg-surface-soft text-muted">Carregando mapa…</div>
  ),
});

export function MapExplorerSection({ isLoggedIn, userName }: { isLoggedIn: boolean; userName?: string | null }) {
  return <MapExplorer isLoggedIn={isLoggedIn} userName={userName} />;
}
