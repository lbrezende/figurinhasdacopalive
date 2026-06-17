// Pontos de troca (mock para o teaser da home).
// Coordenadas reais em São Paulo. Identidade/contato dos colecionadores
// só são revelados quando o usuário está logado.

export type Trader = {
  id: string;
  name: string; // revelado só após login
  whatsapp: string; // só dígitos; revelado só após login
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

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join(". ").toUpperCase() + ".";
}
export function traderInitials(t: Trader) {
  return initials(t.name).replace(/\s/g, "").slice(0, 2);
}

function t(id: string, name: string, i: number, offers: number[], wants: number, phone: string): Trader {
  return { id, name, whatsapp: phone, color: C[i % C.length], offers, wants };
}

export const TRADE_POINTS: TradePoint[] = [
  {
    id: "eldorado",
    name: "Shopping Eldorado",
    area: "Pinheiros · praça de alimentação",
    lat: -23.5747,
    lng: -46.6997,
    traders: [
      t("e1", "Marina Souza", 0, [7, 10, 30], 4, "5511991110001"),
      t("e2", "Rafael Alves", 1, [9, 18], 2, "5511991110002"),
      t("e3", "Camila Lima", 2, [100, 22, 27], 6, "5511991110003"),
    ],
  },
  {
    id: "ibirapuera",
    name: "Parque Ibirapuera",
    area: "Portão 9 · fins de semana de manhã",
    lat: -23.5874,
    lng: -46.6576,
    traders: [
      t("i1", "João Pereira", 3, [10, 9, 7], 3, "5511991110004"),
      t("i2", "Ana Ferreira", 4, [18, 30, 22, 27], 5, "5511991110005"),
    ],
  },
  {
    id: "paulista",
    name: "Av. Paulista (MASP)",
    area: "Vão livre · domingo aberto",
    lat: -23.5614,
    lng: -46.6559,
    traders: [
      t("p1", "Lucas Martins", 0, [30, 100], 2, "5511991110006"),
      t("p2", "Daniela Castro", 2, [7, 9, 10, 18], 7, "5511991110007"),
      t("p3", "Bruno Ramos", 3, [22], 1, "5511991110008"),
      t("p4", "Fernanda Gomes", 5, [27, 9], 3, "5511991110009"),
    ],
  },
  {
    id: "morumbi",
    name: "Estádio do Morumbi",
    area: "Portaria · em dia de jogo",
    lat: -23.6,
    lng: -46.7197,
    traders: [
      t("m1", "Gustavo Henrique", 1, [9, 27], 2, "5511991110010"),
      t("m2", "Thiago Santos", 4, [10, 7, 100], 4, "5511991110011"),
    ],
  },
  {
    id: "mercadao",
    name: "Mercadão (Centro)",
    area: "Rua 25 de Março · sábado de manhã",
    lat: -23.5419,
    lng: -46.6295,
    traders: [
      t("md1", "Paulo Vieira", 2, [18, 30, 22], 3, "5511991110012"),
      t("md2", "Helena Costa", 5, [7, 10], 2, "5511991110013"),
      t("md3", "Sofia Oliveira", 0, [9, 27, 100], 5, "5511991110014"),
    ],
  },
  {
    id: "allianz",
    name: "Allianz Parque",
    area: "Água Branca · em dia de jogo",
    lat: -23.5275,
    lng: -46.6781,
    traders: [
      t("a1", "Eduardo Nunes", 3, [10, 18], 2, "5511991110015"),
      t("a2", "Vitória Lopes", 1, [7, 9, 30, 22, 27], 6, "5511991110016"),
    ],
  },
];

export function totalTraders() {
  return TRADE_POINTS.reduce((acc, p) => acc + p.traders.length, 0);
}
