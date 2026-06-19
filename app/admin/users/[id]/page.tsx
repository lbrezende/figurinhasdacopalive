import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserDetail } from "@/lib/admin-metrics";
import { formatDuration } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin";
import type { GridCell, Match } from "@/lib/collection";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  done: "border-emerald-500/30 bg-emerald-50 text-emerald-700",
  scheduled: "border-primary/30 bg-primary-soft text-primary",
  cancelled: "border-rose-500/30 bg-rose-50 text-rose-600",
};
const STATUS_LABEL: Record<string, string> = {
  done: "Concluída",
  scheduled: "Marcada",
  cancelled: "Cancelada",
};

function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin(); // guarda própria (não depende só do layout)
  const { id } = await params;
  const data = await getUserDetail(id);
  if (!data) notFound();

  const { user, stats, collections, meetups, matchGroups } = data;
  const initials = (user.name || user.email || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex text-sm text-muted hover:text-ink">
        ← Voltar ao painel
      </Link>

      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-hairline bg-canvas p-5">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-strong font-display text-xl font-bold text-muted">
            {initials || "?"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold text-ink">{user.name || "Sem nome"}</h1>
          <p className="text-sm text-muted">{user.email || "—"}</p>
        </div>
        <span className="rounded-md border border-primary/25 bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">
          {user.plan}
        </span>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Figurinhas" value={stats.stickersHave} />
        <Stat label="Repetidas" value={stats.repeatedCount} />
        <Stat label="Coleções" value={stats.collectionsCount} />
        <Stat label="Trocas marcadas" value={stats.meetupsTotal} />
        <Stat label="Trocas concluídas" value={stats.meetupsDone} />
        <Stat label="1ª troca em" value={formatDuration(stats.hoursToFirstTrade)} />
      </div>

      {/* Localização & contato */}
      <section className="rounded-2xl border border-hairline bg-canvas p-5">
        <h2 className="mb-3 font-display text-lg font-bold">Localização & contato</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <Field label="Cidade" value={user.city || "— não informada"} />
          <Field
            label="Telefone"
            value={user.phone ? `${user.phone}${user.phoneCountry ? ` (${user.phoneCountry})` : ""}` : "— não informado"}
          />
          <Field label="Cadastro" value={fmtDateTime(user.createdAt)} />
          <Field label="Última atualização" value={fmtDateTime(user.updatedAt)} />
        </dl>
        <p className="mt-3 text-xs text-muted">
          O cadastro guarda cidade e telefone — não há endereço completo de rua no perfil.
        </p>
      </section>

      {/* Coleções / figurinhas que ela tem */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold">Figurinhas por álbum</h2>
        {collections.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-canvas p-5 text-sm text-muted">
            Esta pessoa ainda não criou nenhuma coleção.
          </p>
        )}
        {collections.map((c, i) => (
          <details
            key={c.collectionId}
            open={i === 0}
            className="rounded-2xl border border-hairline bg-canvas p-5"
          >
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2.5 font-semibold">
                <span className="text-xl">{c.emoji}</span>
                {c.albumName}
              </span>
              <span className="flex items-center gap-4 text-sm text-muted">
                <span><b className="text-ink">{c.have}</b>/{c.total} ({c.pct}%)</span>
                <span>{c.repeated} repetidas</span>
                <span>{c.packsOpened} pacotes</span>
              </span>
            </summary>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-strong">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${c.pct}%` }}
              />
            </div>
            <StickerGrid grid={c.grid} />
            <Legend />
          </details>
        ))}
      </section>

      {/* Oportunidades de troca */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold">Oportunidades de troca</h2>
        <p className="-mt-2 text-xs text-muted">
          Colecionadores na mesma cidade com troca complementar (repetidas dela × faltas deles).
        </p>
        {matchGroups.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-canvas p-5 text-sm text-muted">
            Nenhuma oportunidade de troca no momento (sem cidade, sem repetidas ou sem vizinhos).
          </p>
        )}
        {matchGroups.map((g) => (
          <div key={g.albumId} className="rounded-2xl border border-hairline bg-canvas p-5">
            <p className="mb-3 flex items-center gap-2 font-semibold">
              <span>{g.emoji}</span> {g.albumName}
              <span className="text-xs font-normal text-muted">· {g.matches.length} matches</span>
            </p>
            <div className="space-y-3">
              {g.matches.map((m) => (
                <MatchRow key={m.userId} m={m} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Histórico de trocas */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold">Trocas (encontros)</h2>
        {meetups.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-canvas p-5 text-sm text-muted">
            Nenhuma troca marcada ainda.
          </p>
        )}
        {meetups.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-hairline bg-canvas">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2.5 font-semibold">Quando</th>
                  <th className="px-4 py-2.5 font-semibold">Papel</th>
                  <th className="px-4 py-2.5 font-semibold">Parceiro</th>
                  <th className="px-4 py-2.5 font-semibold">Ponto / horário</th>
                  <th className="px-4 py-2.5 font-semibold">Leva / recebe</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {meetups.map((m) => (
                  <tr key={`${m.id}-${m.role}`} className="border-b border-hairline-soft">
                    <td className="px-4 py-3 text-muted">{fmtDateTime(m.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted">{m.role === "owner" ? "Organizou" : "Convidado"}</span>
                    </td>
                    <td className="px-4 py-3">{m.partnerName || "—"}</td>
                    <td className="px-4 py-3 text-muted">
                      {m.point} · {m.day} {m.time}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-primary">↑{m.giveNumbers.length}</span>{" "}
                      <span className="text-emerald-600">↓{m.getNumbers.length}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[m.status] ?? STATUS_STYLE.scheduled}`}>
                        {STATUS_LABEL[m.status] ?? m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------- componentes ---------------- */

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-soft p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-xl font-extrabold tabular-nums text-ink">{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  );
}

function StickerGrid({ grid }: { grid: GridCell[] }) {
  return (
    <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(2.1rem,1fr))] gap-1">
      {grid.map((c) => {
        const state = c.repeated > 0 ? "rep" : c.have ? "have" : "miss";
        const cls =
          state === "rep"
            ? "bg-violet-500 text-white font-bold"
            : state === "have"
            ? "bg-emerald-500 text-white font-bold"
            : "border border-hairline text-muted-soft";
        return (
          <span
            key={c.number}
            title={`#${c.number} ${c.name}${c.repeated ? ` · ${c.repeated} repetida(s)` : ""}`}
            className={`grid aspect-square place-items-center rounded text-[11px] tabular-nums ${cls}`}
          >
            {c.number}
            {c.repeated > 1 && <sup className="text-[8px]">{c.repeated}</sup>}
          </span>
        );
      })}
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted">
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-violet-500" /> repetida
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-emerald-500" /> tem
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border border-hairline" /> falta
      </span>
    </div>
  );
}

function MatchRow({ m }: { m: Match }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-soft p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-ink">{m.name}</span>
        <span className="rounded-md bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
          score {m.score}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <NumberSet label="Ela recebe" tone="get" nums={m.theyGive} />
        <NumberSet label="Ela dá" tone="give" nums={m.theyWant} />
      </div>
    </div>
  );
}

function NumberSet({
  label,
  tone,
  nums,
}: {
  label: string;
  tone: "get" | "give";
  nums: number[];
}) {
  const chip = tone === "get" ? "border-emerald-500/30 text-emerald-700" : "border-primary/30 text-primary";
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label} ({nums.length})
      </p>
      <div className="flex flex-wrap gap-1">
        {nums.slice(0, 24).map((n) => (
          <span key={n} className={`rounded border px-1.5 py-0.5 text-[11px] tabular-nums ${chip}`}>
            #{n}
          </span>
        ))}
        {nums.length > 24 && <span className="text-[11px] text-muted">+{nums.length - 24}</span>}
        {nums.length === 0 && <span className="text-[11px] text-muted">—</span>}
      </div>
    </div>
  );
}
