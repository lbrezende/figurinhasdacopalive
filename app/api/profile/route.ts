import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  city: z.string().trim().min(1).max(60).optional(),
});

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const updated = await db.user.update({ where: { id: user.id }, data: parsed.data });
  return NextResponse.json({ user: { name: updated.name, city: updated.city } });
}
