import * as React from "react";
import { cn } from "@/lib/utils";
import { teamStyle, idealText, darken, fakePhoto } from "@/lib/teams";

export type CellState = "have" | "miss" | "rep";
export type StickerKind = "SPECIAL" | "BADGE" | "PHOTO" | "PLAYER" | null;

/** Anel de progresso (%) — verde emerald sobre trilho hairline. */
export function ProgressRing({ pct, size = 86 }: { pct: number; size?: number }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const c = size / 2;
  return (
    <div className="relative shrink-0" style={{ height: size, width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle stroke="#ebebeb" strokeWidth="6" fill="transparent" r={r} cx={c} cy={c} />
        <circle
          stroke="#10b981"
          strokeWidth="6"
          fill="transparent"
          r={r}
          cx={c}
          cy={c}
          strokeDasharray={circ}
          strokeDashoffset={circ - (pct / 100) * circ}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-lg font-bold text-ink">{pct}%</div>
    </div>
  );
}

/** Mini-estatística (Tenho/Faltam/Repetidas). */
export function StatChip({ n, label, className }: { n: number; label: string; className?: string }) {
  return (
    <div className="rounded-xl bg-surface-soft py-2">
      <div className={cn("text-xl font-bold", className)}>{n}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  );
}

/** Célula do grid simples (álbuns sem seleção): número + estado por cor. */
export function StickerCell({
  number,
  state,
  rarity,
  repeated,
  ...handlers
}: {
  number: number;
  state: CellState;
  rarity?: "COMUM" | "RARO" | "LENDARIO";
  repeated?: number;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      data-num={number}
      className={cn(
        "relative aspect-square rounded-md text-xs font-bold transition",
        state === "rep"
          ? "bg-violet-500 text-white"
          : state === "have"
            ? "bg-emerald-500 text-white"
            : "bg-surface-soft text-muted-soft",
      )}
      {...handlers}
    >
      {number}
      {rarity === "LENDARIO" && <span className="absolute -right-0.5 -top-0.5 text-[8px]">⭐</span>}
      {(repeated ?? 0) > 1 && <span className="absolute bottom-0 right-0.5 text-[8px]">×{repeated}</span>}
    </button>
  );
}

export type StickerCardCell = {
  number: number;
  name: string;
  have: boolean;
  repeated: number;
  code: string | null;
  teamCode: string | null;
  kind: StickerKind;
  displayNo: number | null;
};

/** Card de figurinha estilo Panini: escudo, seleção, especial ou jogador (foto fictícia). */
export function StickerCard({
  cell,
  colors,
  onDown,
  onUp,
  onCancel,
  onDetail,
}: {
  cell: StickerCardCell;
  colors: [string, string, string];
  onDown: () => void;
  onUp: () => void;
  onCancel: () => void;
  onDetail: () => void;
}) {
  const p = colors[0];
  const have = cell.have;
  const rep = cell.repeated > 0;
  const no = cell.displayNo ?? cell.number;
  const isPhotoCard = cell.kind === "PLAYER";
  const frame = have ? p : "#d9dde3";
  const labelBg = have ? p : "#eef0f3";
  const labelText = have ? idealText(p) : "#5a5a5a";
  const tag = cell.teamCode === "FWC" ? cell.code ?? "★" : `${cell.teamCode} ${no}`;
  const crestLabel = cell.kind === "BADGE" ? "Escudo" : cell.kind === "PHOTO" ? "Seleção" : "Especial";

  return (
    <button
      data-num={no}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerLeave={onCancel}
      onContextMenu={(e) => {
        e.preventDefault();
        onDetail();
      }}
      className="relative flex flex-col overflow-hidden rounded-xl text-left shadow-sm transition active:scale-[0.97]"
      style={{ background: frame, padding: 3 }}
    >
      <span className="absolute left-1.5 top-1.5 z-10 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-ink">
        {tag}
      </span>
      {rep ? (
        <span className="absolute right-1.5 top-1.5 z-10 rounded-md bg-rose-500 px-1.5 py-0.5 text-[9px] font-black text-white">
          ×REP
        </span>
      ) : have ? (
        <span className="absolute right-1.5 top-1.5 z-10 grid h-5 w-5 place-items-center rounded-md bg-emerald-500 text-[11px] font-black text-white">
          ✓
        </span>
      ) : null}

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
        {isPhotoCard ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fakePhoto(cell.number)}
              alt={cell.name}
              loading="lazy"
              className={cn("h-full w-full object-cover transition", !have && "opacity-60 grayscale")}
            />
            {!have && (
              <span className="absolute inset-0 grid place-items-center bg-black/30 text-3xl font-black text-white/90">
                {no}
              </span>
            )}
          </>
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center"
            style={{ background: have ? `linear-gradient(135deg, ${p}, ${darken(p, 0.4)})` : "#f2f3f5" }}
          >
            <span className="text-4xl leading-none">
              {cell.kind === "SPECIAL" ? "🏆" : cell.kind === "PHOTO" ? "📸" : teamStyle(cell.teamCode).flag}
            </span>
            <span
              className="mt-1.5 text-[10px] font-black uppercase tracking-widest"
              style={{ color: have ? idealText(p) : "#9aa0a8" }}
            >
              {crestLabel}
            </span>
          </div>
        )}
      </div>

      <div className="truncate px-1.5 py-1 text-center text-[10px] font-bold" style={{ background: labelBg, color: labelText }}>
        {cell.name}
      </div>
    </button>
  );
}
