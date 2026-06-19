import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth-helpers";
import { getActiveCollection, getGrid, countsFromGrid, addOwnedByNumber } from "@/lib/collection";
import { parseTokens, resolveTokens } from "@/lib/sticker-codes";

const schema = z.object({
  text: z.string().max(4000).optional(),
  codes: z.array(z.string()).max(500).optional(),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const col = await getActiveCollection(user.id);
  if (!col) return NextResponse.json({ error: "no collection" }, { status: 400 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const tokens = parsed.data.codes?.length ? parsed.data.codes : parseTokens(parsed.data.text ?? "");
  if (!tokens.length) return NextResponse.json({ error: "nada para adicionar" }, { status: 400 });

  const { matches, notFound } = await resolveTokens(col.albumId, tokens);

  const added: string[] = [];
  const repeated: string[] = [];
  for (const m of matches) {
    const r = await addOwnedByNumber(col.id, col.albumId, m.number);
    const label = m.code ?? String(m.number);
    if (r?.isNew) added.push(label);
    else repeated.push(label);
  }

  const grid = await getGrid(col.id, col.albumId);
  return NextResponse.json({ added, repeated, notFound, counts: countsFromGrid(grid) });
}
