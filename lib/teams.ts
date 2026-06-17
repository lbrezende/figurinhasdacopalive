// Identidade visual das seleções da Copa 2026 (cores + bandeira) usada na
// apresentação estilo "WE ARE {PAÍS}" do álbum.

export type TeamStyle = {
  /** Nome exibido (vem do banco, mas mantemos um fallback). */
  name: string;
  flag: string;
  /** [dominante, secundária, acento] — bandeira nacional. */
  colors: [string, string, string];
};

// Ordem oficial: especiais primeiro, depois seleções em ordem alfabética do código.
export const TEAM_ORDER = [
  "FWC",
  "ALG", "ARG", "AUS", "AUT", "BEL", "BIH", "BRA", "CAN", "CPV", "CIV",
  "COL", "COD", "CRO", "CUW", "CZE", "ECU", "EGY", "ENG", "FRA", "GER",
  "GHA", "HTI", "IRI", "IRQ", "JPN", "JOR", "KOR", "MAR", "MEX", "NED",
  "NOR", "NZL", "PAN", "PAR", "POR", "QAT", "KSA", "SCO", "SEN", "RSA",
  "ESP", "SWE", "SUI", "TUN", "TUR", "URU", "USA", "UZB",
];

export const TEAMS: Record<string, TeamStyle> = {
  FWC: { name: "FIFA World Cup 26", flag: "🏆", colors: ["#1a2a6c", "#d4af37", "#b21f1f"] },
  ALG: { name: "Algeria", flag: "🇩🇿", colors: ["#0a7d4b", "#ffffff", "#d21034"] },
  ARG: { name: "Argentina", flag: "🇦🇷", colors: ["#6cace4", "#ffffff", "#f6b40e"] },
  AUS: { name: "Australia", flag: "🇦🇺", colors: ["#00843d", "#ffcd00", "#012169"] },
  AUT: { name: "Austria", flag: "🇦🇹", colors: ["#ed2939", "#ffffff", "#c8102e"] },
  BEL: { name: "Belgium", flag: "🇧🇪", colors: ["#1a1a1a", "#fae042", "#ef3340"] },
  BIH: { name: "Bosnia and Herzegovina", flag: "🇧🇦", colors: ["#002395", "#ffd100", "#ffffff"] },
  BRA: { name: "Brazil", flag: "🇧🇷", colors: ["#009c3b", "#ffdf00", "#002776"] },
  CAN: { name: "Canada", flag: "🇨🇦", colors: ["#d80621", "#ffffff", "#ff0000"] },
  CPV: { name: "Cape Verde", flag: "🇨🇻", colors: ["#003893", "#ffffff", "#cf2027"] },
  CIV: { name: "Ivory Coast", flag: "🇨🇮", colors: ["#f77f00", "#ffffff", "#009e60"] },
  COL: { name: "Colombia", flag: "🇨🇴", colors: ["#fcd116", "#003893", "#ce1126"] },
  COD: { name: "DR Congo", flag: "🇨🇩", colors: ["#007fff", "#f7d618", "#ce1021"] },
  CRO: { name: "Croatia", flag: "🇭🇷", colors: ["#ff0000", "#ffffff", "#171796"] },
  CUW: { name: "Curacao", flag: "🇨🇼", colors: ["#002b7f", "#f9d616", "#ffffff"] },
  CZE: { name: "Czechia", flag: "🇨🇿", colors: ["#11457e", "#ffffff", "#d7141a"] },
  ECU: { name: "Ecuador", flag: "🇪🇨", colors: ["#ffdd00", "#034ea2", "#ed1c24"] },
  EGY: { name: "Egypt", flag: "🇪🇬", colors: ["#ce1126", "#ffffff", "#1a1a1a"] },
  ENG: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", colors: ["#ce1124", "#ffffff", "#001489"] },
  FRA: { name: "France", flag: "🇫🇷", colors: ["#0055a4", "#ffffff", "#ef4135"] },
  GER: { name: "Germany", flag: "🇩🇪", colors: ["#1a1a1a", "#dd0000", "#ffce00"] },
  GHA: { name: "Ghana", flag: "🇬🇭", colors: ["#ce1126", "#fcd116", "#006b3f"] },
  HTI: { name: "Haiti", flag: "🇭🇹", colors: ["#00209f", "#d21034", "#ffffff"] },
  IRI: { name: "Iran", flag: "🇮🇷", colors: ["#239f40", "#ffffff", "#da0000"] },
  IRQ: { name: "Iraq", flag: "🇮🇶", colors: ["#ce1126", "#ffffff", "#1a1a1a"] },
  JPN: { name: "Japan", flag: "🇯🇵", colors: ["#bc002d", "#ffffff", "#1a1a1a"] },
  JOR: { name: "Jordan", flag: "🇯🇴", colors: ["#1a1a1a", "#ce1126", "#007a3d"] },
  KOR: { name: "South Korea", flag: "🇰🇷", colors: ["#003478", "#c60c30", "#ffffff"] },
  MAR: { name: "Morocco", flag: "🇲🇦", colors: ["#c1272d", "#006233", "#ffffff"] },
  MEX: { name: "Mexico", flag: "🇲🇽", colors: ["#006847", "#ffffff", "#ce1126"] },
  NED: { name: "Netherlands", flag: "🇳🇱", colors: ["#ff6200", "#ffffff", "#21468b"] },
  NOR: { name: "Norway", flag: "🇳🇴", colors: ["#ba0c2f", "#ffffff", "#00205b"] },
  NZL: { name: "New Zealand", flag: "🇳🇿", colors: ["#1a1a1a", "#00247d", "#cc142b"] },
  PAN: { name: "Panama", flag: "🇵🇦", colors: ["#0049b7", "#da121a", "#ffffff"] },
  PAR: { name: "Paraguay", flag: "🇵🇾", colors: ["#d52b1e", "#ffffff", "#0038a8"] },
  POR: { name: "Portugal", flag: "🇵🇹", colors: ["#006600", "#ff0000", "#ffd000"] },
  QAT: { name: "Qatar", flag: "🇶🇦", colors: ["#8a1538", "#ffffff", "#5c0e26"] },
  KSA: { name: "Saudi Arabia", flag: "🇸🇦", colors: ["#006c35", "#ffffff", "#004a25"] },
  SCO: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", colors: ["#005eb8", "#ffffff", "#0065bd"] },
  SEN: { name: "Senegal", flag: "🇸🇳", colors: ["#00853f", "#fdef42", "#e31b23"] },
  RSA: { name: "South Africa", flag: "🇿🇦", colors: ["#007a4d", "#ffb612", "#001489"] },
  ESP: { name: "Spain", flag: "🇪🇸", colors: ["#aa151b", "#f1bf00", "#7a0f14"] },
  SWE: { name: "Sweden", flag: "🇸🇪", colors: ["#006aa7", "#fecc02", "#004f7e"] },
  SUI: { name: "Switzerland", flag: "🇨🇭", colors: ["#d52b1e", "#ffffff", "#a81f16"] },
  TUN: { name: "Tunisia", flag: "🇹🇳", colors: ["#e70013", "#ffffff", "#b00010"] },
  TUR: { name: "Turkey", flag: "🇹🇷", colors: ["#e30a17", "#ffffff", "#b00813"] },
  URU: { name: "Uruguay", flag: "🇺🇾", colors: ["#5b92e5", "#ffffff", "#fcd116"] },
  USA: { name: "United States", flag: "🇺🇸", colors: ["#3c3b6e", "#b22234", "#ffffff"] },
  UZB: { name: "Uzbekistan", flag: "🇺🇿", colors: ["#0099b5", "#ffffff", "#1eb53a"] },
};

const FALLBACK: TeamStyle = { name: "Seleção", flag: "🏳️", colors: ["#1f2937", "#9ca3af", "#e5e7eb"] };

export function teamStyle(code: string | null | undefined): TeamStyle {
  if (!code) return FALLBACK;
  return TEAMS[code] ?? FALLBACK;
}

/** Preto ou branco — o que contrasta melhor com a cor de fundo. */
export function idealText(hex: string): "#111111" | "#ffffff" {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#111111" : "#ffffff";
}

/** Escurece um hex em `amt` (0..1) — usado nos gradientes de cabeçalho. */
export function darken(hex: string, amt = 0.35): string {
  const h = hex.replace("#", "");
  const f = (i: number) => {
    const v = Math.round(parseInt(h.slice(i, i + 2), 16) * (1 - amt));
    return Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(2)}${f(4)}`;
}

/** Foto fictícia determinística por número de figurinha. */
export function fakePhoto(seed: number): string {
  const img = (Math.abs(seed) % 70) + 1; // pravatar tem 70 retratos
  return `https://i.pravatar.cc/240?img=${img}`;
}
