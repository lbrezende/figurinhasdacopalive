import { PrismaClient } from "@prisma/client";
import { ALBUMS, getStickerInfo } from "../lib/stickers";

const db = new PrismaClient();

async function main() {
  for (const album of ALBUMS) {
    await db.album.upsert({
      where: { id: album.id },
      update: { name: album.name, total: album.total, emoji: album.emoji },
      create: { id: album.id, name: album.name, total: album.total, emoji: album.emoji },
    });

    // Gera as figurinhas do álbum em lote (idempotente via skipDuplicates)
    const rows = Array.from({ length: album.total }, (_, i) => {
      const number = i + 1;
      const info = getStickerInfo(number, album.id);
      return { albumId: album.id, number, name: info.name, rarity: info.rarity };
    });

    // createMany não atualiza existentes; limpamos e recriamos p/ manter consistência
    await db.sticker.deleteMany({ where: { albumId: album.id } });
    await db.sticker.createMany({ data: rows });

    console.log(`✓ ${album.emoji} ${album.name}: ${rows.length} figurinhas`);
  }
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
