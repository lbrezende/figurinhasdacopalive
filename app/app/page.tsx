import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasAccess } from "@/lib/subscription";
import { PaywallGate } from "@/components/paywall/paywall-gate";
import { getActiveCollection, getGrid, countsFromGrid } from "@/lib/collection";
import { ALBUMS } from "@/lib/stickers";
import { CITIES } from "@/lib/cities";
import { Onboarding } from "./onboarding";
import { AppClient } from "./app-client";

export const dynamic = "force-dynamic";

export default async function AppHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  if (!hasAccess(user)) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas px-6">
        <PaywallGate user={user}>{null}</PaywallGate>
      </main>
    );
  }

  const col = await getActiveCollection(user.id);
  if (!user.city || !col) {
    return (
      <Onboarding
        cities={CITIES}
        albums={ALBUMS.map((a) => ({ id: a.id, name: a.name, emoji: a.emoji, total: a.total }))}
        hasCity={!!user.city}
        defaultCity={user.city ?? ""}
        userName={user.name ?? ""}
      />
    );
  }

  const grid = await getGrid(col.id, col.albumId);
  const counts = countsFromGrid(grid);

  return (
    <AppClient
      user={{
        name: user.name,
        email: user.email,
        city: user.city,
        plan: user.plan,
        trialEndsAt: user.trialEndsAt ? user.trialEndsAt.toISOString() : null,
      }}
      album={{ id: col.album.id, name: col.album.name, emoji: col.album.emoji, total: col.album.total }}
      initialGrid={grid}
      initialCounts={counts}
    />
  );
}
