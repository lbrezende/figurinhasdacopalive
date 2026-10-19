"use client";

import * as React from "react";
import { Pill } from "./pill";

export type AddressSuggestion = { placeId: string; description: string };

/**
 * SearchOrb — barra de busca de endereço da home (estilo Airbnb): pílula branca
 * com pino, dropdown de autocomplete (Google Places), "Perto de mim" e o orb
 * Rausch de submit. Componente controlado (estado e fetch ficam no consumidor).
 */
export function SearchOrb({
  value,
  onChange,
  suggestions,
  showSuggestions,
  onFocus,
  onBlur,
  onPick,
  onSubmit,
  onNearMe,
  placeholder = "Digite seu endereço ou cidade…",
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: AddressSuggestion[];
  showSuggestions: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onPick: (s: AddressSuggestion) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onNearMe: () => void;
  placeholder?: string;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-1 items-center gap-2 rounded-full border border-hairline bg-canvas px-2 py-1.5 shadow-[var(--shadow-airbnb)]"
    >
      <span className="pl-2 text-ink">📍</span>
      <div className="relative min-w-0 flex-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-soft"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-[600] max-h-72 overflow-y-auto rounded-2xl border border-hairline bg-canvas py-1.5 shadow-[var(--shadow-airbnb-lg)]">
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onPick(s)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-body transition hover:bg-surface-soft"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-soft text-muted">📍</span>
                  <span className="truncate">{s.description}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        onClick={onNearMe}
        className="hidden whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface-soft sm:block"
      >
        Perto de mim
      </button>
      <button
        type="submit"
        aria-label="Buscar"
        className="grid h-9 w-9 place-items-center rounded-full bg-primary text-on-primary transition hover:bg-primary-active"
      >
        🔎
      </button>
    </form>
  );
}

/**
 * StickerFilterBar — filtra pontos do mapa por número de figurinha. Chips de
 * marca (Pill tone="brand") + input numérico livre + limpar.
 */
export function StickerFilterBar({
  wanted,
  onToggle,
  popular = [7, 9, 10, 18, 22, 27, 30, 100],
  customNum,
  onCustomChange,
  onAddCustom,
  onClear,
}: {
  wanted: number[];
  onToggle: (n: number) => void;
  popular?: number[];
  customNum: string;
  onCustomChange: (v: string) => void;
  onAddCustom: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-hairline bg-canvas p-2.5 shadow-[var(--shadow-airbnb)]">
      <span className="px-1 text-xs font-semibold text-muted">Filtrar por figurinha:</span>
      {popular.map((n) => (
        <Pill key={n} tone="brand" active={wanted.includes(n)} onClick={() => onToggle(n)} className="font-bold">
          #{n}
        </Pill>
      ))}
      <div className="flex items-center gap-1 rounded-full bg-surface-soft px-2 py-0.5">
        <input
          value={customNum}
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddCustom()}
          inputMode="numeric"
          placeholder="nº"
          className="w-12 bg-transparent text-xs text-ink outline-none placeholder:text-muted-soft"
        />
        <button type="button" onClick={onAddCustom} className="text-xs font-bold text-primary">
          +
        </button>
      </div>
      {wanted.length > 0 && (
        <button onClick={onClear} className="ml-auto rounded-full px-3 py-1 text-xs font-semibold text-error hover:bg-surface-soft">
          Limpar ({wanted.length})
        </button>
      )}
    </div>
  );
}
