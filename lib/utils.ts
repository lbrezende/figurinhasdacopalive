import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper padrão do shadcn/ui para combinar classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma duração (em horas) em pt-BR: "45min", "18h", "2d 4h".
 * Fica em utils (sem imports de servidor) para poder ser usada no cliente.
 */
export function formatDuration(hours: number | null): string {
  if (hours == null) return "—";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}min`;
  if (hours < 24) return `${Math.round(hours)}h`;
  const d = Math.floor(hours / 24);
  const h = Math.round(hours % 24);
  return h ? `${d}d ${h}h` : `${d}d`;
}
