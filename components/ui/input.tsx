import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-lg border border-hairline bg-canvas px-4 py-2.5 text-sm text-ink outline-none transition focus:border-ink placeholder:text-muted-soft disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(base, className)} {...props} />,
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(base, "resize-none rounded-xl bg-surface-soft", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

/** Field — rótulo padrão (text-sm font-semibold text-ink) + controle. */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}
