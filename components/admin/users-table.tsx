"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminUserRow } from "@/lib/admin-metrics";
import { formatDuration } from "@/lib/utils";

type SortKey =
  | "createdAt"
  | "stickersHave"
  | "repeatedCount"
  | "meetupsTotal"
  | "hoursToFirstTrade"
  | "lastActiveAt";

const PLAN_STYLE: Record<string, string> = {
  PRO: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  TRIAL: "border-[#ffd23f]/30 bg-[#ffd23f]/10 text-[#ffd23f]",
  FREE: "border-white/15 bg-white/5 text-muted",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function relativeDays(iso: string | null): string {
  if (!iso) return "nunca";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `${days}d atrás`;
  return fmtDate(iso);
}

export function AdminUsersTable({ rows }: { rows: AdminUserRow[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = rows;
    if (needle) {
      out = rows.filter((r) =>
        [r.name, r.email, r.city].some((v) => v?.toLowerCase().includes(needle))
      );
    }
    const sorted = [...out].sort((a, b) => {
      const av = sortVal(a, sort);
      const bv = sortVal(b, sort);
      if (av == null && bv == null) return 0;
      if (av == null) return 1; // nulos sempre no fim
      if (bv == null) return -1;
      return dir === "asc" ? av - bv : bv - av;
    });
    return sorted;
  }, [rows, q, sort, dir]);

  function toggleSort(key: SortKey) {
    if (sort === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDir("desc");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--card)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
        <div>
          <h2 className="font-display text-lg font-bold">Usuários cadastrados</h2>
          <p className="text-xs text-muted">
            {filtered.length} de {rows.length} · clique numa pessoa para ver os detalhes
          </p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar nome, e-mail ou cidade…"
          className="w-full max-w-xs rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-[#ffd23f]/40"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-2.5 font-semibold">Pessoa</th>
              <th className="px-4 py-2.5 font-semibold">Cidade</th>
              <th className="px-4 py-2.5 font-semibold">Plano</th>
              <Th label="Figurinhas" active={sort === "stickersHave"} dir={dir} onClick={() => toggleSort("stickersHave")} />
              <Th label="Repetidas" active={sort === "repeatedCount"} dir={dir} onClick={() => toggleSort("repeatedCount")} />
              <Th label="Trocas" active={sort === "meetupsTotal"} dir={dir} onClick={() => toggleSort("meetupsTotal")} />
              <Th label="1ª troca em" active={sort === "hoursToFirstTrade"} dir={dir} onClick={() => toggleSort("hoursToFirstTrade")} />
              <Th label="Cadastro" active={sort === "createdAt"} dir={dir} onClick={() => toggleSort("createdAt")} />
              <Th label="Ativo" active={sort === "lastActiveAt"} dir={dir} onClick={() => toggleSort("lastActiveAt")} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="group border-b border-white/5 transition hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${r.id}`} className="flex items-center gap-3">
                    <Avatar name={r.name} email={r.email} image={r.image} />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground group-hover:text-[#ffd23f]">
                        {r.name || "Sem nome"}
                      </span>
                      <span className="block truncate text-xs text-muted">{r.email || "—"}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{r.city || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${PLAN_STYLE[r.plan] ?? PLAN_STYLE.FREE}`}>
                    {r.plan}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold tabular-nums">{r.stickersHave}</td>
                <td className="px-4 py-3 tabular-nums text-muted">{r.repeatedCount}</td>
                <td className="px-4 py-3 tabular-nums">
                  <span className="font-semibold">{r.meetupsTotal}</span>
                  {r.meetupsDone > 0 && (
                    <span className="ml-1 text-xs text-emerald-300">({r.meetupsDone}✓)</span>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted">
                  {formatDuration(r.hoursToFirstTrade)}
                </td>
                <td className="px-4 py-3 text-muted">{fmtDate(r.createdAt)}</td>
                <td className="px-4 py-3 text-muted">{relativeDays(r.lastActiveAt)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-2.5 font-semibold">
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 transition hover:text-foreground ${active ? "text-[#ffd23f]" : ""}`}
      >
        {label}
        <span className="text-[10px]">{active ? (dir === "asc" ? "▲" : "▼") : "⇅"}</span>
      </button>
    </th>
  );
}

function Avatar({
  name,
  email,
  image,
}: {
  name: string | null;
  email: string | null;
  image: string | null;
}) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  const initials = (name || email || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-muted">
      {initials || "?"}
    </span>
  );
}

function sortVal(r: AdminUserRow, key: SortKey): number | null {
  switch (key) {
    case "createdAt":
      return new Date(r.createdAt).getTime();
    case "lastActiveAt":
      return r.lastActiveAt ? new Date(r.lastActiveAt).getTime() : null;
    case "hoursToFirstTrade":
      return r.hoursToFirstTrade;
    case "stickersHave":
      return r.stickersHave;
    case "repeatedCount":
      return r.repeatedCount;
    case "meetupsTotal":
      return r.meetupsTotal;
  }
}
