import { getAdminData, type HeartMetric } from "@/lib/admin-metrics";
import { formatDuration } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin";
import { AdminUsersTable } from "@/components/admin/users-table";
import { FunnelChart } from "@/components/admin/funnel-chart";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin(); // guarda própria (não depende só do layout)
  const { rows, overview: o } = await getAdminData();

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Painel de controle</h1>
        <p className="mt-1 text-sm text-muted">
          Visão geral do produto e da base de colecionadores.
        </p>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Cadastrados" value={o.totalUsers} sub={`+${o.signups7d} em 7 dias`} />
        <Kpi label="Ativados" value={o.activatedUsers} sub={`${pctText(o.activatedUsers, o.totalUsers)} da base`} accent />
        <Kpi label="Figurinhas" value={o.totalStickers} sub={`${o.totalRepeated} repetidas`} />
        <Kpi label="Trocas" value={o.totalMeetups} sub={`${o.doneMeetups} concluídas`} />
        <Kpi label="1ª troca (mediana)" value={formatDuration(o.medianHoursToFirstTrade)} sub={`média ${formatDuration(o.avgHoursToFirstTrade)}`} />
        <Kpi label="Retenção 7d" value={`${o.retention7dPct}%`} sub={`${o.active7d} ativos`} />
      </div>

      {/* Framework HEART */}
      <section className="rounded-2xl border border-hairline bg-canvas p-5">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">Indicadores de sucesso · framework HEART</h2>
            <p className="text-xs text-muted">
              Happiness · Engagement · Adoption · Retention · Task success
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {o.heart.map((m) => (
            <HeartCard key={m.key} m={m} />
          ))}
        </div>
      </section>

      {/* Funil de ativação */}
      <section className="rounded-2xl border border-hairline bg-canvas p-5">
        <h2 className="mb-1 font-display text-lg font-bold">Funil de ativação</h2>
        <p className="mb-4 text-xs text-muted">
          Do cadastro até concluir a primeira troca — onde as pessoas param.
        </p>
        <FunnelChart steps={o.funnel} />
      </section>

      {/* Tabela de usuários */}
      <AdminUsersTable rows={rows} />
    </div>
  );
}

/* ---------------- componentes ---------------- */

function pctText(part: number, whole: number): string {
  return `${whole > 0 ? Math.round((part / whole) * 100) : 0}%`;
}

function Kpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-soft p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${accent ? "text-primary" : "text-ink"}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function HeartCard({ m }: { m: HeartMetric }) {
  return (
    <div className="flex flex-col rounded-xl border border-hairline bg-surface-soft p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-sm font-bold text-primary">
          {m.key}
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-muted">{m.label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-ink">{m.value}</p>
      <p className="mt-0.5 text-xs font-medium text-body">{m.title}</p>
      <p className="mt-1 text-[11px] leading-snug text-muted">{m.hint}</p>
      <p className="mt-2 border-t border-hairline-soft pt-2 text-[11px] leading-snug text-muted">{m.desc}</p>
    </div>
  );
}
