import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { getActiveCollection, demoFill, resetCollection } from "@/lib/collection";

const NAMES = ["Lucas","Marina","Rafael","Juliana","Pedro","Ana","Bruno","Carla","Diego","Fernanda","Gustavo","Helena"];

const schema = z.object({ action: z.enum(["fill", "reset", "neighbors"]) });

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const col = await getActiveCollection(user.id);
  if (!col) return NextResponse.json({ error: "no collection" }, { status: 400 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });

  if (parsed.data.action === "fill") {
    await demoFill(col.id, col.albumId);
    return NextResponse.json({ ok: true });
  }
  if (parsed.data.action === "reset") {
    await resetCollection(col.id);
    return NextResponse.json({ ok: true });
  }

  // neighbors: cria 5 colecionadores demo na mesma cidade, com coleção complementar
  if (!user.city) return NextResponse.json({ error: "sem cidade" }, { status: 400 });
  const total = await db.sticker.count({ where: { albumId: col.albumId } });
  const stickers = await db.sticker.findMany({ where: { albumId: col.albumId }, select: { id: true, number: true } });
  let created = 0;
  for (let i = 0; i < 5; i++) {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const nb = await db.user.create({
      data: {
        name: `${name} (demo)`,
        city: user.city,
        plan: "TRIAL",
        trialEndsAt: new Date(Date.now() + 14 * 864e5),
        collections: { create: { albumId: col.albumId } },
      },
      include: { collections: true },
    });
    const nbCol = nb.collections[0];
    const rows = stickers
      .filter(() => Math.random() < 0.6)
      .map((s) => {
        const r = Math.random();
        return { collectionId: nbCol.id, stickerId: s.id, number: s.number, have: true, repeated: r < 0.25 ? 1 + Math.floor(Math.random() * 2) : 0 };
      });
    if (rows.length) await db.stickerOwnership.createMany({ data: rows });
    created++;
  }
  return NextResponse.json({ ok: true, created, total });
}
