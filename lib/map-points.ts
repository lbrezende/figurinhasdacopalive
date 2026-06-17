// Pontos de troca (mock para o teaser público da home).
// Coordenadas reais em São Paulo; os "traders" são anonimizados —
// nome real e contato só aparecem depois do login.

export type Trader = {
  id: string;
  initials: string; // ex: "M. S." — identidade real fica escondida
  color: string;
  offers: number[]; // figurinhas que essa pessoa tem para trocar
  wants: number; // quantas ela procura
};

export type TradePoint = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  traders: Trader[];
};

const C = ["#ffd23f", "#34d399", "#a78bfa", "#22d3ee", "#ff8a00", "#f472b6"];

function t(id: string, initials: string, i: number, offers: number[], wants: number): Trader {
  return { id, initials, color: C[i % C.length], offers, wants };
}

export const TRADE_POINTS: TradePoint[] = [
  {
    id: "eldorado",
    name: "Shopping Eldorado",
    area: "Pinheiros · praça de alimentação",
    lat: -23.5747,
    lng: -46.6997,
    traders: [
      t("e1", "M. S.", 0, [7, 10, 30], 4),
      t("e2", "R. A.", 1, [9, 18], 2),
      t("e3", "C. L.", 2, [100, 22, 27], 6),
    ],
  },
  {
    id: "ibirapuera",
    name: "Parque Ibirapuera",
    area: "Portão 9 · fins de semana de manhã",
    lat: -23.5874,
    lng: -46.6576,
    traders: [
      t("i1", "J. P.", 3, [10, 9, 7], 3),
      t("i2", "A. F.", 4, [18, 30, 22, 27], 5),
    ],
  },
  {
    id: "paulista",
    name: "Av. Paulista (MASP)",
    area: "Vão livre · domingo aberto",
    lat: -23.5614,
    lng: -46.6559,
    traders: [
      t("p1", "L. M.", 0, [30, 100], 2),
      t("p2", "D. C.", 2, [7, 9, 10, 18], 7),
      t("p3", "B. R.", 3, [22], 1),
      t("p4", "F. G.", 5, [27, 9], 3),
    ],
  },
  {
    id: "morumbi",
    name: "Estádio do Morumbi",
    area: "Portaria · em dia de jogo",
    lat: -23.6,
    lng: -46.7197,
    traders: [
      t("m1", "G. H.", 1, [9, 27], 2),
      t("m2", "T. S.", 4, [10, 7, 100], 4),
    ],
  },
  {
    id: "mercadao",
    name: "Mercadão (Centro)",
    area: "Rua 25 de Março · sábado de manhã",
    lat: -23.5419,
    lng: -46.6295,
    traders: [
      t("md1", "P. V.", 2, [18, 30, 22], 3),
      t("md2", "H. C.", 5, [7, 10], 2),
      t("md3", "S. O.", 0, [9, 27, 100], 5),
    ],
  },
  {
    id: "allianz",
    name: "Allianz Parque",
    area: "Água Branca · em dia de jogo",
    lat: -23.5275,
    lng: -46.6781,
    traders: [
      t("a1", "E. N.", 3, [10, 18], 2),
      t("a2", "V. L.", 1, [7, 9, 30, 22, 27], 6),
    ],
  },
];

export function totalTraders() {
  return TRADE_POINTS.reduce((acc, p) => acc + p.traders.length, 0);
}
