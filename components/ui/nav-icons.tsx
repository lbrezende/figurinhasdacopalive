import * as React from "react";

/**
 * Ícones de navegação do app — outline 24×24, traço em `currentColor`.
 * Herdam a cor da aba (ativa = `text-primary`, inativa = `text-muted`).
 * Stroke-width 1.75, cantos arredondados — estilo coerente com lucide-react.
 */
type IconProps = React.SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Álbum — livro/álbum de figurinhas com lombada e marcador. */
export function AlbumIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 18.5z" />
      <path d="M5 17.5A1.5 1.5 0 0 1 6.5 16H19" />
      <path d="M14 3v6l-2-1.4L10 9V3" />
    </svg>
  );
}

/** Trocas — duas setas de troca formando ciclo. */
export function TrocasIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <path d="M4 8h12.5" />
      <path d="m13 4.5 3.5 3.5L13 11.5" />
      <path d="M20 16H7.5" />
      <path d="m11 12.5-3.5 3.5L11 19.5" />
    </svg>
  );
}

/** Encontros — calendário com data marcada. */
export function EncontrosIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v4M16 3v4" />
      <circle cx="12" cy="14.5" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Perfil — avatar de usuário. */
export function PerfilIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}
