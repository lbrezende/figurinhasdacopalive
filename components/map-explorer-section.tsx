"use client";

import dynamic from "next/dynamic";

// Leaflet usa window → carrega só no client
const MapExplorer = dynamic(() => import("./map-explorer"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[100svh] w-full place-items-center bg-[#0a0f1e] text-muted">Carregando mapa…</div>
  ),
});

export function MapExplorerSection() {
  return <MapExplorer />;
}
