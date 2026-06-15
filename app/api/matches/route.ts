import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth-helpers";
import { getActiveCollection, getMatches } from "@/lib/collection";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const col = await getActiveCollection(user.id);
  if (!col) return NextResponse.json({ matches: [], city: user.city ?? null });
  const matches = await getMatches(user.id, col.albumId);
  return NextResponse.json({ matches, city: user.city ?? null });
}
