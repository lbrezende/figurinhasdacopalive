import { db } from "@/lib/db";
import type { Rarity } from "@prisma/client";

export type GridCell = {
  number: number;
  name: string;
  rarity: Rarity;
  have: boolean;
  repeated: number;
};

export type Counts = { have: number; miss: number; rep: number; total: number; pct: number };

/** Coleção ativa do usuário (a mais recente). null se ainda não escolheu álbum. */
export async function getActiveCollection(userId: string) {
  return db.collection.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { album: true },
  });
}

/** Cria (ou retorna) a coleção do usuário num álbum. */
export async function createCollection(userId: string, albumId: string) {
  const album = await db.album.findUnique({ where: { id: albumId } });
  if (!album) throw new Error("Álbum inexistente");
  return db.collection.upsert({
    where: { userId_albumId: { userId, albumId } },
    update: { updatedAt: new Date() },
    create: { userId, albumId },
    include: { album: true },
  });
}

/** Grid completo do álbum com o estado de cada figurinha na coleção. */
export async function getGrid(collectionId: string, albumId: string): Promise<GridCell[]> {
  const [stickers, owns] = await Promise.all([
    db.sticker.findMany({ where: { albumId }, orderBy: { number: "asc" } }),
    db.stickerOwnership.findMany({ where: { collectionId } }),
  ]);
  const byNum = new Map(owns.map((o) => [o.number, o]));
  return stickers.map((s) => {
    const o = byNum.get(s.number);
    return {
      number: s.number,
      name: s.name,
      rarity: s.rarity,
      have: o?.have ?? false,
      repeated: o?.repeated ?? 0,
    };
  });
}

export function countsFromGrid(grid: GridCell[]): Counts {
  let have = 0;
  let rep = 0;
  for (const c of grid) {
    if (c.have) have++;
    rep += c.repeated;
  }
  const total = grid.length;
  return { have, miss: total - have, rep, total, pct: total ? Math.round((have / total) * 100) : 0 };
}

/** Garante a linha de ownership de uma figurinha (busca o sticker pelo número). */
async function ownershipRef(collectionId: string, albumId: string, number: number) {
  const sticker = await db.sticker.findUnique({ where: { albumId_number: { albumId, number } } });
  if (!sticker) throw new Error("Figurinha inexistente");
  return { stickerId: sticker.id, number };
}

/** Define o estado exato (have + repeated) de uma figurinha. */
export async function setOwnership(
  collectionId: string,
  albumId: string,
  number: number,
  have: boolean,
  repeated: number
) {
  const { stickerId } = await ownershipRef(collectionId, albumId, number);
  const rep = Math.max(0, repeated);
  await db.stickerOwnership.upsert({
    where: { collectionId_stickerId: { collectionId, stickerId } },
    update: { have, repeated: have ? rep : 0 },
    create: { collectionId, stickerId, number, have, repeated: have ? rep : 0 },
  });
  await db.collection.update({ where: { id: collectionId }, data: { updatedAt: new Date() } });
}

/** Tap cíclico: Falta → Tenho → Repetida → Falta. */
export async function cycleOwnership(collectionId: string, albumId: string, number: number) {
  const { stickerId } = await ownershipRef(collectionId, albumId, number);
  const cur = await db.stickerOwnership.findUnique({
    where: { collectionId_stickerId: { collectionId, stickerId } },
  });
  let have: boolean, repeated: number;
  if (!cur || !cur.have) { have = true; repeated = 0; } // Falta → Tenho
  else if (cur.repeated === 0) { have = true; repeated = 1; } // Tenho → Repetida
  else { have = false; repeated = 0; } // Repetida → Falta
  await setOwnership(collectionId, albumId, number, have, repeated);
  return { number, have, repeated };
}

const PACK_COOLDOWN_MS = 8 * 60 * 60 * 1000; // 8h

export async function packStatus(collectionId: string) {
  const c = await db.collection.findUnique({ where: { id: collectionId } });
  const last = c?.lastPackAt?.getTime() ?? 0;
  const readyAt = last + PACK_COOLDOWN_MS;
  return { ready: Date.now() >= readyAt, readyAt, packsOpened: c?.packsOpened ?? 0 };
}

/** Abre um pacote de 5 figurinhas aleatórias do álbum. */
export async function openPack(collectionId: string, albumId: string, skipCooldown = false) {
  const status = await packStatus(collectionId);
  if (!status.ready && !skipCooldown) {
    return { ok: false as const, readyAt: status.readyAt, cards: [] };
  }
  const total = await db.sticker.count({ where: { albumId } });
  const picks: number[] = [];
  while (picks.length < 5) {
    const n = 1 + Math.floor(Math.random() * total);
    picks.push(n);
  }
  const cards: { number: number; name: string; rarity: Rarity; isNew: boolean }[] = [];
  for (const n of picks) {
    const sticker = await db.sticker.findUnique({ where: { albumId_number: { albumId, number: n } } });
    if (!sticker) continue;
    const cur = await db.stickerOwnership.findUnique({
      where: { collectionId_stickerId: { collectionId, stickerId: sticker.id } },
    });
    const isNew = !cur || !cur.have;
    await db.stickerOwnership.upsert({
      where: { collectionId_stickerId: { collectionId, stickerId: sticker.id } },
      update: isNew ? { have: true } : { repeated: { increment: 1 } },
      create: { collectionId, stickerId: sticker.id, number: n, have: true, repeated: 0 },
    });
    cards.push({ number: n, name: sticker.name, rarity: sticker.rarity, isNew });
  }
  await db.collection.update({
    where: { id: collectionId },
    data: { lastPackAt: new Date(), packsOpened: { increment: 1 } },
  });
  return { ok: true as const, readyAt: Date.now() + PACK_COOLDOWN_MS, cards };
}

/** Preenche um álbum de exemplo (demo): ~70% têm, ~15% repetidas. */
export async function demoFill(collectionId: string, albumId: string) {
  const stickers = await db.sticker.findMany({ where: { albumId } });
  await db.$transaction(
    stickers.map((s) => {
      const r = Math.random();
      const have = r < 0.7;
      const repeated = r < 0.15 ? 1 + Math.floor(Math.random() * 3) : 0;
      return db.stickerOwnership.upsert({
        where: { collectionId_stickerId: { collectionId, stickerId: s.id } },
        update: { have, repeated: have ? repeated : 0 },
        create: { collectionId, stickerId: s.id, number: s.number, have, repeated: have ? repeated : 0 },
      });
    })
  );
  await db.collection.update({ where: { id: collectionId }, data: { updatedAt: new Date() } });
}

/** Zera a coleção (apaga ownership). */
export async function resetCollection(collectionId: string) {
  await db.stickerOwnership.deleteMany({ where: { collectionId } });
  await db.collection.update({
    where: { id: collectionId },
    data: { lastPackAt: null, packsOpened: 0, updatedAt: new Date() },
  });
}

export type Match = {
  userId: string;
  name: string;
  score: number;
  theyGive: number[]; // repetidas deles que eu preciso
  theyWant: number[]; // minhas repetidas que eles precisam
};

/** Matches na mesma cidade: colecionadores com troca complementar no mesmo álbum. */
export async function getMatches(userId: string, albumId: string): Promise<Match[]> {
  const me = await db.user.findUnique({ where: { id: userId } });
  if (!me?.city) return [];
  const myCol = await db.collection.findUnique({ where: { userId_albumId: { userId, albumId } } });
  if (!myCol) return [];
  const myOwns = await db.stickerOwnership.findMany({ where: { collectionId: myCol.id } });
  const myHave = new Set(myOwns.filter((o) => o.have).map((o) => o.number));
  const myRep = new Set(myOwns.filter((o) => o.have && o.repeated > 0).map((o) => o.number));

  const neighbors = await db.user.findMany({
    where: { city: me.city, id: { not: userId } },
    include: { collections: { where: { albumId }, include: { ownerships: true } } },
    take: 30,
  });

  const matches: Match[] = [];
  for (const nb of neighbors) {
    const col = nb.collections[0];
    if (!col) continue;
    const theirHave = new Set(col.ownerships.filter((o) => o.have).map((o) => o.number));
    const theirRep = new Set(col.ownerships.filter((o) => o.have && o.repeated > 0).map((o) => o.number));
    const theyGive = [...theirRep].filter((n) => !myHave.has(n)); // repetida dele que me falta
    const theyWant = [...myRep].filter((n) => !theirHave.has(n)); // minha repetida que falta nele
    const score = theyGive.length + theyWant.length;
    if (score > 0) {
      matches.push({ userId: nb.id, name: nb.name || "Colecionador", score, theyGive, theyWant });
    }
  }
  return matches.sort((a, b) => b.score - a.score).slice(0, 20);
}
