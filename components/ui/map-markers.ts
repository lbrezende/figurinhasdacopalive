/**
 * Builders de HTML dos marcadores do mapa (estilo Airbnb).
 * São strings puras (sem Leaflet) — usadas tanto pelo `L.divIcon` em runtime
 * quanto pelas stories (via dangerouslySetInnerHTML).
 */

/** Pílula branca com tinta; ativa em Rausch. Usada no marcador "📍 Você". */
export function pillMarkerHtml(label: string, active: boolean): string {
  return `<div style="transform:translate(-50%,-50%)">
    <div style="
      background:${active ? "#ff385c" : "#ffffff"};color:${active ? "#ffffff" : "#222222"};
      font-weight:700;font-size:13px;padding:7px 13px;border-radius:999px;white-space:nowrap;
      box-shadow:rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.16) 0 2px 8px 0;
      border:1px solid ${active ? "#ff385c" : "#dddddd"};
      font-family:Inter,system-ui,sans-serif;transition:all .15s;${active ? "transform:scale(1.06)" : ""}
    ">${label}</div></div>`;
}

/** Mini-figurinha (cartão branco com cabeça/ombros) usada no leque do pino. */
function stickerCard(cx: number, cy: number, deg: number, color: string): string {
  return `<g transform="translate(${cx},${cy}) rotate(${deg})">
    <rect x="-7.5" y="-9.5" width="15" height="19" rx="2.8" fill="#ffffff" stroke="#c4ccd6" stroke-width="0.9"/>
    <rect x="-7.5" y="-9.5" width="15" height="19" rx="2.8" fill="${color}" opacity="0.16"/>
    <circle cx="0" cy="-2.6" r="3.1" fill="${color}"/>
    <rect x="-4.6" y="2.6" width="9.2" height="6" rx="3" fill="${color}"/>
  </g>`;
}

/** Ponto de interesse: pino + três figurinhas em leque + selo com a contagem. */
export function poiMarkerHtml(label: string, active: boolean): string {
  const svg = `<svg width="52" height="68" viewBox="0 0 64 84" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="79.5" rx="10.5" ry="3.4" fill="#7cc1ff" opacity="0.9"/>
    <path d="M32 78 C32 78 14 52 14 34 C14 22 22 13.5 32 13.5 C42 13.5 50 22 50 34 C50 52 32 78 32 78 Z"
      fill="#ff385c" stroke="#d11a40" stroke-width="1.5"/>
    <circle cx="32" cy="33" r="13.5" fill="#ffffff"/>
    ${stickerCard(25.5, 32, -20, "#ffd23f")}
    ${stickerCard(38.5, 32, 20, "#4aa3ff")}
    ${stickerCard(32, 29.5, 0, "#22c55e")}
  </svg>`;
  return `<div style="transform:translate(-50%,-100%)">
    <div style="position:relative;width:52px;height:68px;transform-origin:50% 100%;transform:scale(${active ? 1.16 : 1});transition:transform .15s;${active ? "filter:drop-shadow(0 7px 11px rgba(0,0,0,.3));" : "filter:drop-shadow(0 3px 5px rgba(0,0,0,.22));"}">
      ${svg}
      <div style="position:absolute;top:-3px;right:-5px;min-width:20px;height:20px;padding:0 5px;
        background:${active ? "#222222" : "#ff385c"};color:#ffffff;border:2px solid #ffffff;border-radius:999px;
        font:800 11px Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;
        box-shadow:0 1px 3px rgba(0,0,0,.3);">${label}</div>
    </div></div>`;
}
