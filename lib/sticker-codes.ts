import { db } from "@/lib/db";

// Resolve códigos de figurinha (ex: "ARG17", "FWC2", "00", "ARG 17") para o
// `number` interno do álbum, usado pela coleção/ownership.

/** Quebra um texto livre em tokens (vírgula, ponto-e-vírgula ou quebra de linha). */
export function parseTokens(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** "ARG 17" / "arg-17" → "ARG17". */
export function normalizeToken(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export type ResolvedToken = { token: string; number: number; code: string | null; name: string };

export async function resolveTokens(
  albumId: string,
  tokens: string[]
): Promise<{ matches: ResolvedToken[]; notFound: string[] }> {
  const stickers = await db.sticker.findMany({
    where: { albumId },
    select: { number: true, code: true, name: true, teamCode: true, displayNo: true },
  });
  const isCatalog = stickers.some((s) => s.teamCode);

  const byCode = new Map<string, (typeof stickers)[number]>();
  const byTeamNo = new Map<string, (typeof stickers)[number]>();
  const byNumber = new Map<number, (typeof stickers)[number]>();
  for (const s of stickers) {
    if (s.code) byCode.set(normalizeToken(s.code), s);
    if (s.teamCode && s.displayNo != null) byTeamNo.set(`${s.teamCode.toUpperCase()}#${s.displayNo}`, s);
    byNumber.set(s.number, s);
  }

  const matches: ResolvedToken[] = [];
  const notFound: string[] = [];
  for (const token of tokens) {
    const norm = normalizeToken(token);
    if (!norm) continue;

    let hit = byCode.get(norm);
    if (!hit) {
      const m = norm.match(/^([A-Z]{2,4})(\d{1,3})$/); // "ARG017" → ARG + 17
      if (m) hit = byTeamNo.get(`${m[1]}#${Number(m[2])}`) ?? byCode.get(`${m[1]}${Number(m[2])}`);
    }
    // Número global cru só faz sentido em álbuns sem catálogo por seleção.
    if (!hit && !isCatalog && /^\d{1,4}$/.test(norm)) hit = byNumber.get(Number(norm));

    if (hit) matches.push({ token, number: hit.number, code: hit.code, name: hit.name });
    else notFound.push(token);
  }
  return { matches, notFound };
}
