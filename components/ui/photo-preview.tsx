"use client";

import { motion } from "motion/react";

const PHOTO_SPRING = { type: "spring" as const, duration: 0.5, bounce: 0.18 };

/**
 * PhotoPreview — pré-visualização da foto enviada com morph (layoutId).
 *
 * - `open` → painel ampliado: lado direito no desktop, inferior (acima da nav)
 *   no mobile, com `object-contain` respeitando a proporção.
 * - `!open` → thumbnail clicável inline (montado onde o componente é renderizado,
 *   tipicamente logo abaixo do campo de figurinhas).
 *
 * Monte UM PhotoPreview por foto: ele alterna entre painel e thumb e o `layoutId`
 * compartilhado anima a transição.
 */
export function PhotoPreview({
  src,
  open,
  busy = false,
  onExpand,
  onMinimize,
}: {
  src: string;
  open: boolean;
  busy?: boolean;
  onExpand: () => void;
  onMinimize: () => void;
}) {
  if (!open) {
    return (
      <motion.button
        type="button"
        onClick={onExpand}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        title="Ampliar foto"
        className="mt-3 flex items-center gap-2.5 rounded-xl border border-hairline bg-surface-soft p-1.5 pr-3 text-left transition hover:bg-surface-strong"
      >
        <motion.img
          layoutId="sticker-photo"
          src={src}
          alt="Foto enviada"
          transition={PHOTO_SPRING}
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
        <span className="text-xs font-semibold text-body">
          Foto enviada
          <span className="block text-[11px] font-normal text-muted">toque para ampliar</span>
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-x-3 bottom-24 z-40 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-24 sm:w-[min(380px,30vw)]"
    >
      <div className="relative rounded-3xl border border-hairline bg-canvas p-3 shadow-[var(--shadow-airbnb-lg)]">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">
            {busy ? "Lendo foto…" : "Pré-visualização"}
          </span>
          <button
            type="button"
            onClick={onMinimize}
            aria-label="Minimizar foto"
            title="Minimizar"
            className="grid h-8 w-8 place-items-center rounded-full border border-hairline bg-canvas text-muted transition hover:bg-surface-soft hover:text-ink"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-hidden rounded-2xl bg-surface-soft">
          <motion.img
            layoutId="sticker-photo"
            src={src}
            alt="Pré-visualização da foto"
            transition={PHOTO_SPRING}
            className="mx-auto max-h-[38vh] w-full object-contain sm:max-h-[68vh]"
          />
        </div>
        {busy && (
          <div className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-muted">
            <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Identificando figurinhas…
          </div>
        )}
      </div>
    </motion.div>
  );
}
