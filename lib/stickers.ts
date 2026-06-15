// Geração determinística de figurinhas (portado do app estático original).
// Mesmo (albumId, número) sempre gera o mesmo nome e raridade.

export type RarityKey = "COMUM" | "RARO" | "LENDARIO";

export const ALBUMS = [
  { id: "copa", name: "Copa do Mundo 2026", total: 670, emoji: "⚽" },
  { id: "brasil", name: "Brasileirão 2026", total: 480, emoji: "🇧🇷" },
  { id: "animais", name: "Reino Animal", total: 240, emoji: "🦁" },
  { id: "herois", name: "Super-Heróis", total: 300, emoji: "🦸" },
  { id: "mini", name: "Álbum Teste (60)", total: 60, emoji: "🧪" },
] as const;

export type AlbumId = (typeof ALBUMS)[number]["id"];

// Hash FNV-1a (idêntico ao do app original)
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const COPA_STARS: Record<number, string> = {
  10: "Neymar Jr",
  7: "C. Ronaldo",
  30: "Lionel Messi",
  9: "Kylian Mbappé",
  18: "Vinícius Jr",
  22: "J. Bellingham",
  27: "Lamine Yamal",
  100: "Pelé",
};
const BRASIL_STARS: Record<number, string> = {
  10: "Estêvão",
  8: "Arrascaeta",
  7: "Lucas Moura",
  9: "Pedro",
  11: "Hulk",
};

const COPA_FIRSTS = ["Lucas","Matheus","Gabriel","Bruno","Felipe","Thiago","Diego","Arthur","Gustavo","Enzo","Harry","Thomas","Antoine","Marco","Julian","Marcus","Samuel","David","Christian","Alexis","Rodrygo","Richarlison","Casemiro","Alisson","Ederson","Raphinha","Paquetá"];
const COPA_LASTS = ["Silva","Santos","Souza","Oliveira","Pereira","Lima","Carvalho","Ferreira","Rodrigues","Almeida","Gomes","Costa","Smith","Johnson","Williams","Jones","Militao","Guimaraes","Martinelli","Endrick"];
const BRASIL_FIRSTS = ["Estêvão","Raphael","Everton","Gustavo","Alan","Ganso","Yuri","Pedro","Igor","Luciano","Calleri","Matheus","Tiquinho","Gerson","Fernandinho","Hulk","Paulinho","Deyverson","Léo","David","Guilherme","Lucas","Alerrandro","Luiz"];
const BRASIL_LASTS = ["Veiga","Cebolinha","Gómez","Patrick","Alberto","Guilherme","Coronado","Moura","Pereira","Soares","Sanches","Henrique","Moraes","Ortiz","Luiz","Arana","Jair","Melo","Piton"];
const ANIMALS = ["Leão","Tigre","Águia Real","Urso Polar","Leopardo","Guepardo","Lobo","Gorila","Panda","Elefante","Rinoceronte","Hipopótamo","Girafa","Zebra","Canguru","Coala","Ornitorrinco","Golfinho","Baleia Azul","Tubarão Branco","Polvo Gigante","Água-Viva","Tartaruga Marinha","Camaleão","Jacaré","Pinguim","Coruja","Arara Azul","Tucano","Tamanduá-Bandeira","Capivara","Mico-Leão-Dourado","Onça-Pintada","Lobo-Guará","Ariranha"];
const HERO_PREFIXES = ["Super-","Capitão ","Homem-","Mulher-","Lorde ","Agente ","Doutor ","Mestre ","Cavaleiro ","Guardião "];
const HERO_NOUNS = ["Trovão","Luz","Sombra","Aço","Fogo","Gelo","Ferro","Cristal","Vento","Estrela","Laser","Tempo","Caos","Espaço","Escudo","Guerreiro","Defensor","Fênix"];

export function getStickerInfo(
  n: number,
  albumId: string
): { name: string; rarity: RarityKey } {
  const h = hashStr(albumId + "|" + n);
  const pct = h % 100;

  let rarity: RarityKey = "COMUM";
  if (pct < 6 || n === 10 || n === 7 || n === 30 || n === 100) {
    rarity = "LENDARIO";
  } else if (pct < 25 || n === 9 || n === 18 || n === 22) {
    rarity = "RARO";
  }

  let name = "";
  if (albumId === "copa") {
    name = COPA_STARS[n] ?? `${COPA_FIRSTS[h % COPA_FIRSTS.length]} ${COPA_LASTS[(h >> 2) % COPA_LASTS.length]}`;
  } else if (albumId === "brasil") {
    name = BRASIL_STARS[n] ?? `${BRASIL_FIRSTS[h % BRASIL_FIRSTS.length]} ${BRASIL_LASTS[(h >> 2) % BRASIL_LASTS.length]}`;
  } else if (albumId === "animais") {
    name = ANIMALS[h % ANIMALS.length];
    if (rarity === "LENDARIO") name = "👑 " + name;
  } else if (albumId === "herois") {
    name = HERO_PREFIXES[h % HERO_PREFIXES.length] + HERO_NOUNS[(h >> 2) % HERO_NOUNS.length];
  } else {
    name = "Figurinha Especial #" + n;
  }

  return { name, rarity };
}
