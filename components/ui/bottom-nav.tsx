import * as React from "react";
import { cn } from "@/lib/utils";

export type BottomNavItem<K extends string = string> = {
  key: K;
  icon: React.ReactNode;
  label: string;
};

export interface BottomNavProps<K extends string = string> {
  items: readonly BottomNavItem<K>[];
  value: K;
  onChange: (key: K) => void;
  /** Sobrescreve o posicionamento padrão (fixed bottom). */
  className?: string;
}

/**
 * BottomNav — navegação inferior fixa do app (Álbum/Trocas/Encontros/Perfil).
 * Aba ativa em `text-primary`; demais em `text-muted`. z-30, acima do conteúdo
 * e abaixo de modais (z-50).
 */
export function BottomNav<K extends string = string>({ items, value, onChange, className }: BottomNavProps<K>) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 border-t border-hairline bg-canvas/95 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex max-w-2xl">
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            aria-current={value === it.key ? "page" : undefined}
            onClick={() => onChange(it.key)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-semibold transition",
              value === it.key ? "text-primary" : "text-muted",
            )}
          >
            <span className="text-lg">{it.icon}</span>
            {it.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
