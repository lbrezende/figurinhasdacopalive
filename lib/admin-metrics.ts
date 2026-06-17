import { db } from "@/lib/db";
import type { Plan } from "@prisma/client";
import { getGrid, countsFromGrid, getMatches, type GridCell, type Match } from "@/lib/collection";
import { formatDuration } from "@/lib/utils";

const DAY_MS = 1000 * 60 * 60 * 24;

// ----------------------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------------------

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  city: string | null;
  plan: Plan;
  createdAt: string; // ISO
  stickersHave: number; // figurinhas que tem (have = true)
  repeatedCount: number; // soma de repetidas
  collectionsCount: number;
  meetupsTotal: number; // trocas marcadas (como dono)
  meetupsDone: number; // trocas concluídas (como dono)
  lastActiveAt: string | null; // ISO — atividade mais recente (coleção)
  firstTradeAt: string | null; // ISO
  hoursToFirstTrade: number | null; // do cadastro até a 1ª troca
};

export type FunnelStep = { label: string; value: number; pct: number };

export type HeartMetric = {
  key: "H" | "E" | "A" | "R" | "T";
  label: string; // Happiness, Engagement...
  title: string; // título pt-BR
  value: string; // valor formatado
  hint: string; // métrica usada
  desc: string; // explicação
};

export type AdminOverview = {
  totalUsers: number;
  onboardedUsers: number;
  activatedUsers: number;
  signups7d: number;
  signups30d: number;
  totalStickers: number;
  totalRepeated: number;
  avgStickersPerActivated: number;
  totalCollections: number;
  totalPacksOpened: number;
  totalMeetups: number;
  doneMeetups: number;
  usersWithTrade: number;
  usersWithDoneTrade: number;
  tradeConversionPct: number;
  active7d: number;
  active30d: number;
  retention7dPct: number;
  repeatTraders: number;
  avgHoursToFirstTrade: number | null;
  medianHoursToFirstTrade: number | null;
  fastestHoursToFirstTrade: number | null;
  funnel: FunnelStep[];
  heart: HeartMetric[];
};

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

// ----------------------------------------------------------------------------
// Dashboard: lista de usuários + overview (uma passada de queries)
// ----------------------------------------------------------------------------

export async function getAdminData(): Promise<{
  rows: AdminUserRow[];
  overview: AdminOverview;
}> {
  const now = Date.now();
  const cut7 = new Date(now - 7 * DAY_MS);
  const cut30 = new Date(now - 30 * DAY_MS);

  const [
    users,
    collections,
    haveAgg,
    packsAgg,
    meetupsByOwner,
    doneByOwner,
  ] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        city: true,
        plan: true,
        createdAt: true,
      },
    }),
    db.collection.findMany({
      select: { id: true, userId: true, updatedAt: true },
    }),
    // figurinhas que o usuário tem (e repetidas), agrupadas por coleção
    db.stickerOwnership.groupBy({
      by: ["collectionId"],
      where: { have: true },
      _count: { _all: true },
      _sum: { repeated: true },
    }),
    db.collection.aggregate({ _sum: { packsOpened: true } }),
    // trocas (como dono): total + 1ª troca
    db.meetup.groupBy({
      by: ["ownerId"],
      _count: { _all: true },
      _min: { createdAt: true },
    }),
    // trocas concluídas (como dono)
    db.meetup.groupBy({
      by: ["ownerId"],
      where: { status: "done" },
      _count: { _all: true },
    }),
  ]);

  // Mapas auxiliares: coleção → dono / atividade
  const colToUser = new Map<string, string>();
  const collectionsByUser = new Map<string, number>();
  const lastActiveByUser = new Map<string, number>();
  for (const c of collections) {
    colToUser.set(c.id, c.userId);
    collectionsByUser.set(c.userId, (collectionsByUser.get(c.userId) ?? 0) + 1);
    const t = c.updatedAt.getTime();
    const prev = lastActiveByUser.get(c.userId) ?? 0;
    if (t > prev) lastActiveByUser.set(c.userId, t);
  }

  // figurinhas/repetidas por usuário (somando coleções)
  const haveByUser = new Map<string, number>();
  const repByUser = new Map<string, number>();
  for (const g of haveAgg) {
    const uid = colToUser.get(g.collectionId);
    if (!uid) continue;
    haveByUser.set(uid, (haveByUser.get(uid) ?? 0) + (g._count._all ?? 0));
    repByUser.set(uid, (repByUser.get(uid) ?? 0) + (g._sum.repeated ?? 0));
  }

  // trocas por usuário
  const meetupsTotalByUser = new Map<string, number>();
  const firstTradeByUser = new Map<string, number>();
  for (const m of meetupsByOwner) {
    meetupsTotalByUser.set(m.ownerId, m._count._all ?? 0);
    if (m._min.createdAt) firstTradeByUser.set(m.ownerId, m._min.createdAt.getTime());
  }
  const doneByUser = new Map<string, number>();
  for (const m of doneByOwner) doneByUser.set(m.ownerId, m._count._all ?? 0);

  // Linhas da tabela
  const rows: AdminUserRow[] = users.map((u) => {
    const created = u.createdAt.getTime();
    const firstTrade = firstTradeByUser.get(u.id) ?? null;
    const hoursToFirstTrade =
      firstTrade != null ? Math.max(0, (firstTrade - created) / (1000 * 60 * 60)) : null;
    const lastActive = lastActiveByUser.get(u.id) ?? null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      city: u.city,
      plan: u.plan,
      createdAt: u.createdAt.toISOString(),
      stickersHave: haveByUser.get(u.id) ?? 0,
      repeatedCount: repByUser.get(u.id) ?? 0,
      collectionsCount: collectionsByUser.get(u.id) ?? 0,
      meetupsTotal: meetupsTotalByUser.get(u.id) ?? 0,
      meetupsDone: doneByUser.get(u.id) ?? 0,
      lastActiveAt: lastActive != null ? new Date(lastActive).toISOString() : null,
      firstTradeAt: firstTrade != null ? new Date(firstTrade).toISOString() : null,
      hoursToFirstTrade,
    };
  });

  // ---- Agregados (overview) ----
  const totalUsers = users.length;
  const onboardedUsers = collectionsByUser.size;
  const activatedUsers = [...haveByUser.values()].filter((n) => n > 0).length;
  const signups7d = users.filter((u) => u.createdAt >= cut7).length;
  const signups30d = users.filter((u) => u.createdAt >= cut30).length;

  const totalStickers = [...haveByUser.values()].reduce((a, b) => a + b, 0);
  const totalRepeated = [...repByUser.values()].reduce((a, b) => a + b, 0);
  const avgStickersPerActivated = activatedUsers ? Math.round(totalStickers / activatedUsers) : 0;
  const totalCollections = collections.length;
  const totalPacksOpened = packsAgg._sum.packsOpened ?? 0;

  const totalMeetups = [...meetupsTotalByUser.values()].reduce((a, b) => a + b, 0);
  const doneMeetups = [...doneByUser.values()].reduce((a, b) => a + b, 0);
  const usersWithTrade = meetupsTotalByUser.size;
  const usersWithDoneTrade = [...doneByUser.values()].filter((n) => n > 0).length;
  const repeatTraders = [...meetupsTotalByUser.values()].filter((n) => n >= 2).length;
  const tradeConversionPct = pct(usersWithTrade, activatedUsers || totalUsers);

  const active7d = [...lastActiveByUser.values()].filter((t) => t >= cut7.getTime()).length;
  const active30d = [...lastActiveByUser.values()].filter((t) => t >= cut30.getTime()).length;
  const retention7dPct = pct(active7d, onboardedUsers || totalUsers);

  const ttft = rows
    .map((r) => r.hoursToFirstTrade)
    .filter((h): h is number => h != null);
  const avgHoursToFirstTrade = ttft.length
    ? Math.round((ttft.reduce((a, b) => a + b, 0) / ttft.length) * 10) / 10
    : null;
  const medianHoursToFirstTrade = median(ttft);
  const fastestHoursToFirstTrade = ttft.length ? Math.min(...ttft) : null;

  const funnel: FunnelStep[] = [
    { label: "Cadastraram", value: totalUsers, pct: 100 },
    { label: "Criaram coleção", value: onboardedUsers, pct: pct(onboardedUsers, totalUsers) },
    { label: "Cadastraram figurinha", value: activatedUsers, pct: pct(activatedUsers, totalUsers) },
    { label: "Marcaram troca", value: usersWithTrade, pct: pct(usersWithTrade, totalUsers) },
    { label: "Concluíram troca", value: usersWithDoneTrade, pct: pct(usersWithDoneTrade, totalUsers) },
  ];

  const heart: HeartMetric[] = [
    {
      key: "H",
      label: "Happiness",
      title: "Satisfação",
      value: `${pct(repeatTraders, usersWithTrade || 1)}%`,
      hint: `${repeatTraders} de ${usersWithTrade} trocadores voltaram a trocar`,
      desc: "Proxy de satisfação: quem fecha uma 2ª troca gostou da 1ª.",
    },
    {
      key: "E",
      label: "Engagement",
      title: "Engajamento",
      value: `${avgStickersPerActivated}`,
      hint: `figurinhas/usuário ativo · ${totalPacksOpened} pacotes abertos`,
      desc: "Profundidade de uso: quanto cada pessoa mexe no álbum.",
    },
    {
      key: "A",
      label: "Adoption",
      title: "Adoção",
      value: `${pct(activatedUsers, totalUsers)}%`,
      hint: `${activatedUsers} de ${totalUsers} cadastraram ≥1 figurinha`,
      desc: "Ativação: quantos cadastrados chegam a usar de verdade.",
    },
    {
      key: "R",
      label: "Retention",
      title: "Retenção",
      value: `${retention7dPct}%`,
      hint: `${active7d} ativos nos últimos 7 dias`,
      desc: "Quantos voltam: atividade recente sobre quem já começou.",
    },
    {
      key: "T",
      label: "Task success",
      title: "Sucesso na tarefa",
      value: formatDuration(medianHoursToFirstTrade),
      hint: `mediana até a 1ª troca · ${tradeConversionPct}% convertem`,
      desc: "Tempo do cadastro até concluir o objetivo principal: trocar.",
    },
  ];

  return {
    rows,
    overview: {
      totalUsers,
      onboardedUsers,
      activatedUsers,
      signups7d,
      signups30d,
      totalStickers,
      totalRepeated,
      avgStickersPerActivated,
      totalCollections,
      totalPacksOpened,
      totalMeetups,
      doneMeetups,
      usersWithTrade,
      usersWithDoneTrade,
      tradeConversionPct,
      active7d,
      active30d,
      retention7dPct,
      repeatTraders,
      avgHoursToFirstTrade,
      medianHoursToFirstTrade,
      fastestHoursToFirstTrade,
      funnel,
      heart,
    },
  };
}

// ----------------------------------------------------------------------------
// Detalhe de um usuário
// ----------------------------------------------------------------------------

export type AdminCollectionDetail = {
  collectionId: string;
  albumId: string;
  albumName: string;
  emoji: string;
  total: number;
  have: number;
  miss: number;
  repeated: number;
  pct: number;
  packsOpened: number;
  grid: GridCell[];
};

export type AdminMeetupRow = {
  id: string;
  role: "owner" | "partner";
  partnerName: string | null;
  albumId: string;
  city: string;
  point: string;
  day: string;
  time: string;
  giveNumbers: number[];
  getNumbers: number[];
  status: string;
  createdAt: string;
};

export type AdminMatchGroup = {
  albumId: string;
  albumName: string;
  emoji: string;
  matches: Match[];
};

export type AdminUserDetail = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    city: string | null;
    phone: string | null;
    phoneCountry: string | null;
    plan: Plan;
    trialEndsAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    stickersHave: number;
    repeatedCount: number;
    collectionsCount: number;
    meetupsTotal: number;
    meetupsDone: number;
    firstTradeAt: string | null;
    hoursToFirstTrade: number | null;
  };
  collections: AdminCollectionDetail[];
  meetups: AdminMeetupRow[];
  matchGroups: AdminMatchGroup[];
};

export async function getUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const [cols, meetupsOwner, meetupsPartner] = await Promise.all([
    db.collection.findMany({
      where: { userId },
      include: { album: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.meetup.findMany({ where: { ownerId: userId }, orderBy: { createdAt: "desc" } }),
    db.meetup.findMany({ where: { partnerId: userId }, orderBy: { createdAt: "desc" } }),
  ]);

  // Grids + matches por coleção
  const collections: AdminCollectionDetail[] = [];
  const matchGroups: AdminMatchGroup[] = [];
  for (const col of cols) {
    const grid = await getGrid(col.id, col.albumId);
    const counts = countsFromGrid(grid);
    collections.push({
      collectionId: col.id,
      albumId: col.albumId,
      albumName: col.album.name,
      emoji: col.album.emoji,
      total: col.album.total,
      have: counts.have,
      miss: counts.miss,
      repeated: counts.rep,
      pct: counts.pct,
      packsOpened: col.packsOpened,
      grid,
    });
    const matches = await getMatches(userId, col.albumId);
    if (matches.length) {
      matchGroups.push({
        albumId: col.albumId,
        albumName: col.album.name,
        emoji: col.album.emoji,
        matches,
      });
    }
  }

  const meetups: AdminMeetupRow[] = [
    ...meetupsOwner.map((m) => ({ ...toMeetupRow(m), role: "owner" as const })),
    ...meetupsPartner.map((m) => ({ ...toMeetupRow(m), role: "partner" as const })),
  ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const stickersHave = collections.reduce((a, c) => a + c.have, 0);
  const repeatedCount = collections.reduce((a, c) => a + c.repeated, 0);
  const firstTrade = meetupsOwner.length
    ? meetupsOwner.reduce(
        (min, m) => (m.createdAt.getTime() < min ? m.createdAt.getTime() : min),
        Infinity
      )
    : null;
  const hoursToFirstTrade =
    firstTrade != null && firstTrade !== Infinity
      ? Math.max(0, (firstTrade - user.createdAt.getTime()) / (1000 * 60 * 60))
      : null;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      city: user.city,
      phone: user.phone,
      phoneCountry: user.phoneCountry,
      plan: user.plan,
      trialEndsAt: user.trialEndsAt ? user.trialEndsAt.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    stats: {
      stickersHave,
      repeatedCount,
      collectionsCount: cols.length,
      meetupsTotal: meetupsOwner.length,
      meetupsDone: meetupsOwner.filter((m) => m.status === "done").length,
      firstTradeAt:
        firstTrade != null && firstTrade !== Infinity
          ? new Date(firstTrade).toISOString()
          : null,
      hoursToFirstTrade,
    },
    collections,
    meetups,
    matchGroups,
  };
}

function toMeetupRow(m: {
  id: string;
  partnerName: string | null;
  albumId: string;
  city: string;
  point: string;
  day: string;
  time: string;
  giveNumbers: number[];
  getNumbers: number[];
  status: string;
  createdAt: Date;
}): Omit<AdminMeetupRow, "role"> {
  return {
    id: m.id,
    partnerName: m.partnerName,
    albumId: m.albumId,
    city: m.city,
    point: m.point,
    day: m.day,
    time: m.time,
    giveNumbers: m.giveNumbers,
    getNumbers: m.getNumbers,
    status: m.status,
    createdAt: m.createdAt.toISOString(),
  };
}
