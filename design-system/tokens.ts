/**
 * Fonte de verdade dos tokens do Design System "Figura Certa".
 * Espelha as CSS vars em app/globals.css (@theme). Use SEMPRE os nomes
 * semânticos (classes Tailwind bg-canvas, text-ink…) no código de UI;
 * este módulo existe para a documentação no Storybook renderizar amostras.
 */

export type ColorToken = {
  name: string; // classe semântica (ex: bg-canvas)
  cssVar: string; // --canvas
  hex: string;
  use: string;
};

export const SURFACES: ColorToken[] = [
  { name: "canvas", cssVar: "--canvas", hex: "#ffffff", use: "Fundo base do app" },
  { name: "surface-soft", cssVar: "--surface-soft", hex: "#f7f7f7", use: "Cartões internos, chips inativos, inputs" },
  { name: "surface-strong", cssVar: "--surface-strong", hex: "#f2f2f2", use: "Hover de superfícies suaves" },
];

export const INK: ColorToken[] = [
  { name: "ink", cssVar: "--ink", hex: "#222222", use: "Texto principal / títulos (nunca preto puro)" },
  { name: "body", cssVar: "--body", hex: "#3f3f3f", use: "Texto de corpo" },
  { name: "muted", cssVar: "--muted", hex: "#6a6a6a", use: "Texto secundário" },
  { name: "muted-soft", cssVar: "--muted-soft", hex: "#929292", use: "Placeholders, legendas tênues" },
];

export const BORDERS: ColorToken[] = [
  { name: "hairline", cssVar: "--hairline", hex: "#dddddd", use: "Borda padrão (1px) de cards e inputs" },
  { name: "hairline-soft", cssVar: "--hairline-soft", hex: "#ebebeb", use: "Divisórias mais sutis" },
  { name: "border-strong", cssVar: "--border-strong", hex: "#c1c1c1", use: "Borda de ênfase" },
];

export const BRAND: ColorToken[] = [
  { name: "primary", cssVar: "--primary", hex: "#ff385c", use: "Voltage único (Rausch) — só CTAs primários, orb, nav ativa" },
  { name: "primary-active", cssVar: "--primary-active", hex: "#e00b41", use: "Hover/pressed do primário" },
  { name: "primary-disabled", cssVar: "--primary-disabled", hex: "#ffd1da", use: "CTA primário desabilitado" },
  { name: "primary-soft", cssVar: "--primary-soft", hex: "#fff0f3", use: "Tint de fundo (avisos, seleção leve)" },
  { name: "on-primary", cssVar: "--on-primary", hex: "#ffffff", use: "Texto/ícone sobre o primário" },
];

export const SEMANTIC: ColorToken[] = [
  { name: "error", cssVar: "--error", hex: "#c13515", use: "Erros, ação destrutiva" },
  { name: "success", cssVar: "--success", hex: "#008a05", use: "Sucesso/confirmação" },
];

/** Estados de coleção (figurinhas) — exceções ao voltage único, semânticas de domínio. */
export const COLLECTION_STATES = [
  { name: "tenho", hex: "#10b981", tw: "emerald-500", use: "Figurinha que o usuário tem" },
  { name: "falta", hex: "#f7f7f7", tw: "surface-soft", use: "Figurinha faltando" },
  { name: "repetida", hex: "#8b5cf6", tw: "violet-500", use: "Figurinha repetida (para troca)" },
];

export const RADII = [
  { name: "rounded-lg", value: "8px", use: "Botões" },
  { name: "rounded-xl", value: "12px", use: "Inputs, chips internos" },
  { name: "radius-card / rounded-2xl", value: "14–16px", use: "Cards" },
  { name: "radius-xl-soft / rounded-3xl", value: "20–24px", use: "Modais, painéis, stage" },
  { name: "radius-xxl-soft", value: "32px", use: "Superfícies extra-arredondadas" },
  { name: "rounded-full", value: "999px", use: "Pílulas, chips, search, avatares" },
];

export const SHADOWS = [
  {
    name: "shadow-airbnb",
    use: "Elevação padrão (único tier) — cards flutuantes, search",
    value:
      "rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.1) 0 4px 8px 0",
  },
  {
    name: "shadow-airbnb-lg",
    use: "Modais e painéis (action sheet, preview, detalhe)",
    value:
      "rgba(0,0,0,0.04) 0 0 0 1px, rgba(0,0,0,0.08) 0 6px 16px 0, rgba(0,0,0,0.12) 0 12px 28px 0",
  },
];

/** Escala de espaçamento Tailwind realmente usada nas telas (base 4px). */
export const SPACING = [
  { name: "1.5", px: "6px", use: "Gap fino entre células do grid, ícone+label" },
  { name: "2", px: "8px", use: "Gap entre chips/botões" },
  { name: "2.5", px: "10px", use: "Gap de listas" },
  { name: "3", px: "12px", use: "Padding de inputs/chips, gaps médios" },
  { name: "4", px: "16px", use: "Padding de cards compactos, gap de seções" },
  { name: "5", px: "20px", use: "Padding interno de cards" },
  { name: "6", px: "24px", use: "Padding de modais" },
];

export const TYPE_SCALE = [
  { name: "Display", cls: "text-3xl/text-4xl font-black", use: "Hero, título 'WE ARE'" },
  { name: "H1", cls: "text-xl font-bold", use: "Títulos de modal/seção" },
  { name: "H2", cls: "text-lg font-bold", use: "Títulos de card" },
  { name: "Body", cls: "text-sm text-body", use: "Texto padrão" },
  { name: "Caption", cls: "text-xs text-muted", use: "Legendas, metadados" },
  { name: "Micro", cls: "text-[11px]/text-[10px] text-muted", use: "Dicas, selos" },
  { name: "Eyebrow", cls: "text-[11px] font-black uppercase tracking-[0.25em]", use: "Rótulos acima de títulos" },
];
