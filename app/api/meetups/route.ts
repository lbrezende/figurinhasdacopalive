import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth-helpers";
import { getActiveCollection } from "@/lib/collection";
import { db } from "@/lib/db";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const meetups = await db.meetup.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ meetups });
}

const schema = z.object({
  partnerId: z.string().optional(),
  partnerName: z.string().min(1),
  point: z.string().min(1),
  day: z.string().min(1),
  time: z.string().min(1),
  give: z.array(z.number().int()).default([]),
  get: z.array(z.number().int()).default([]),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const col = await getActiveCollection(user.id);
  if (!col) return NextResponse.json({ error: "no collection" }, { status: 400 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const d = parsed.data;
  const meetup = await db.meetup.create({
    data: {
      ownerId: user.id,
      partnerId: d.partnerId || null,
      partnerName: d.partnerName,
      albumId: col.albumId,
      city: user.city || "—",
      point: d.point,
      day: d.day,
      time: d.time,
      giveNumbers: d.give,
      getNumbers: d.get,
    },
  });
  return NextResponse.json({ meetup });
}
