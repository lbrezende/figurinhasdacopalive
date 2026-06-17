import { PrismaClient, type Rarity } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ALBUMS, getStickerInfo } from "../lib/stickers";

const db = new PrismaClient();

type CatalogRow = {
  number: number;
  code: string;
  teamCode: string;
  teamName: string;
  kind: string;
  displayNo: number | null;
  name: string;
  verified: boolean;
  rarity: Rarity;
};

/** Copa 2026: catálogo oficial Panini (980 figurinhas) vindo do CSV. */
async function seedCopa() {
  const album = ALBUMS.find((a) => a.id === "copa")!;
  await db.album.upsert({
    where: { id: album.id },
    update: { name: album.name, total: album.total, emoji: album.emoji },
    create: { id: album.id, name: album.name, total: album.total, emoji: album.emoji },
  });

  const catalog: CatalogRow[] = JSON.parse(
    readFileSync(join(__dirname, "wc26-catalog.json"), "utf-8")
  );

  // Upsert por (albumId, number): preserva os stickerId (e a coleção do usuário).
  for (const r of catalog) {
    await db.sticker.upsert({
      where: { albumId_number: { albumId: "copa", number: r.number } },
      update: {
        name: r.name,
        rarity: r.rarity,
        code: r.code,
        teamCode: r.teamCode,
        teamName: r.teamName,
        kind: r.kind,
        displayNo: r.displayNo,
        verified: r.verified,
      },
      create: {
        albumId: "copa",
        number: r.number,
        name: r.name,
        rarity: r.rarity,
        code: r.code,
        teamCode: r.teamCode,
        teamName: r.teamName,
        kind: r.kind,
        displayNo: r.displayNo,
        verified: r.verified,
      },
    });
  }

  // Remove sobras de seeds antigos (números acima do catálogo atual).
  await db.sticker.deleteMany({ where: { albumId: "copa", number: { gt: catalog.length } } });

  console.log(`✓ ${album.emoji} ${album.name}: ${catalog.length} figurinhas (catálogo oficial)`);
}

/** Demais álbuns: geração determinística (como antes). */
async function seedGenerated() {
  for (const album of ALBUMS) {
    if (album.id === "copa") continue;
    await db.album.upsert({
      where: { id: album.id },
      update: { name: album.name, total: album.total, emoji: album.emoji },
      create: { id: album.id, name: album.name, total: album.total, emoji: album.emoji },
    });

    const rows = Array.from({ length: album.total }, (_, i) => {
      const number = i + 1;
      const info = getStickerInfo(number, album.id);
      return { albumId: album.id, number, name: info.name, rarity: info.rarity };
    });

    await db.sticker.deleteMany({ where: { albumId: album.id } });
    await db.sticker.createMany({ data: rows });

    console.log(`✓ ${album.emoji} ${album.name}: ${rows.length} figurinhas`);
  }
}

async function main() {
  await seedCopa();
  await seedGenerated();
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
