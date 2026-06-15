import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth-helpers";
import { getActiveCollection, cycleOwnership, setOwnership, getGrid, countsFromGrid } from "@/lib/collection";

const schema = z.object({
  number: z.number().int().positive(),
  action: z.enum(["cycle", "set"]).default("cycle"),
  have: z.boolean().optional(),
  repeated: z.number().int().min(0).optional(),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const col = await getActiveCollection(user.id);
  if (!col) return NextResponse.json({ error: "no collection" }, { status: 400 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const { number, action, have, repeated } = parsed.data;

  if (action === "set") {
    await setOwnership(col.id, col.albumId, number, have ?? false, repeated ?? 0);
  } else {
    await cycleOwnership(col.id, col.albumId, number);
  }
  const grid = await getGrid(col.id, col.albumId);
  const cell = grid.find((c) => c.number === number);
  return NextResponse.json({ cell, counts: countsFromGrid(grid) });
}
