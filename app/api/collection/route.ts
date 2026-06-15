import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth-helpers";
import { getActiveCollection, createCollection, getGrid, countsFromGrid } from "@/lib/collection";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const col = await getActiveCollection(user.id);
  if (!col) return NextResponse.json({ collection: null });
  const grid = await getGrid(col.id, col.albumId);
  return NextResponse.json({
    collection: { id: col.id, albumId: col.albumId, album: col.album },
    grid,
    counts: countsFromGrid(grid),
  });
}

const bodySchema = z.object({ albumId: z.string().min(1) });

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const col = await createCollection(user.id, parsed.data.albumId);
  return NextResponse.json({ collection: { id: col.id, albumId: col.albumId, album: col.album } });
}
