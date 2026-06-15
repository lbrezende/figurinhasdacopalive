import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth-helpers";
import { getActiveCollection, openPack, packStatus } from "@/lib/collection";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const col = await getActiveCollection(user.id);
  if (!col) return NextResponse.json({ error: "no collection" }, { status: 400 });
  return NextResponse.json(await packStatus(col.id));
}

const schema = z.object({ skipCooldown: z.boolean().optional() });

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const col = await getActiveCollection(user.id);
  if (!col) return NextResponse.json({ error: "no collection" }, { status: 400 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  const skip = parsed.success ? parsed.data.skipCooldown ?? false : false;
  const result = await openPack(col.id, col.albumId, skip);
  return NextResponse.json(result);
}
