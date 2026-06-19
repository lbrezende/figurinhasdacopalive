import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button — primitivo de ação. Voltage Rausch só na variante `primary`
 * (CTAs). Demais ações usam superfícies neutras. Raio padrão `rounded-lg` (8px).
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-active disabled:bg-primary-disabled disabled:opacity-100",
        soft: "bg-surface-soft text-ink hover:bg-surface-strong",
        outline: "border border-hairline bg-canvas text-ink hover:bg-surface-soft",
        danger: "border border-error/40 text-error hover:bg-error/5",
        link: "text-muted underline underline-offset-2 hover:text-ink",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-4 py-2.5 text-sm",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size, fullWidth }), className)} {...props} />
  ),
);
Button.displayName = "Button";
