"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Modal — diálogo centralizado no desktop, ancorado embaixo no mobile.
 * Scrim `bg-black/50`, card `rounded-2xl` com `shadow-airbnb-lg`. z-50 (acima da nav).
 */
export function Modal({
  children,
  onClose,
  className,
}: {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl border border-hairline bg-canvas p-6 shadow-[var(--shadow-airbnb-lg)]",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export type SheetAction = { icon: React.ReactNode; label: string; onSelect: () => void };

/**
 * ActionSheet — folha de ação nativa (iOS/Android). Lista de opções + Cancelar,
 * com scrim e animação de subida. Usada na escolha "Tirar foto / Galeria".
 */
export function ActionSheet({
  open,
  onClose,
  actions,
  cancelLabel = "Cancelar",
}: {
  open: boolean;
  onClose: () => void;
  actions: SheetAction[];
  cancelLabel?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[61] p-3"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
          >
            <div className="mx-auto max-w-sm space-y-2">
              <div className="overflow-hidden rounded-2xl border border-hairline bg-canvas shadow-[var(--shadow-airbnb-lg)]">
                {actions.map((a, i) => (
                  <React.Fragment key={a.label}>
                    {i > 0 && <div className="border-t border-hairline" />}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        a.onSelect();
                      }}
                      className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold text-ink transition hover:bg-surface-soft"
                    >
                      <span className="text-xl">{a.icon}</span>
                      {a.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl border border-hairline bg-canvas py-4 text-sm font-bold text-ink shadow-[var(--shadow-airbnb)] transition hover:bg-surface-soft"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
