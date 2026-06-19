import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Pill — chip/toggle arredondado (`rounded-full`) para filtros e seleções
 * (dia/hora, filtros de figurinha, navegação de seleções).
 *
 * - tone `ink`  → ativo = bg-ink text-white (toggles/seleção)
 * - tone `brand`→ ativo = bg-primary text-on-primary (filtros de figurinha no mapa)
 * Inativo (ambos) = bg-surface-soft text-body hover:bg-surface-strong.
 */
export const pillVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
  {
    variants: {
      tone: { ink: "", brand: "" },
      active: { true: "", false: "bg-surface-soft text-body hover:bg-surface-strong" },
    },
    compoundVariants: [
      { tone: "ink", active: true, class: "bg-ink text-white" },
      { tone: "brand", active: true, class: "bg-primary text-on-primary" },
    ],
    defaultVariants: { tone: "ink", active: false },
  },
);

export interface PillProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pillVariants> {}

export const Pill = React.forwardRef<HTMLButtonElement, PillProps>(
  ({ className, tone, active, type = "button", "aria-pressed": ariaPressed, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={ariaPressed ?? !!active}
      className={cn(pillVariants({ tone, active }), className)}
      {...props}
    />
  ),
);
Pill.displayName = "Pill";
