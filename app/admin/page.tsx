import { getAdminData, type FunnelStep, type HeartMetric } from "@/lib/admin-metrics";
import { formatDuration } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin";
import { AdminUsersTable } from "@/components/admin/users-table";

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
      <section className="rounded-2xl border border-white/10 bg-[var(--card)] p-5">
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
      <section className="rounded-2xl border border-white/10 bg-[var(--card)] p-5">
        <h2 className="mb-1 font-display text-lg font-bold">Funil de ativação</h2>
        <p className="mb-4 text-xs text-muted">
          Do cadastro até concluir a primeira troca — onde as pessoas param.
        </p>
        <div className="space-y-2.5">
          {o.funnel.map((step, i) => (
            <FunnelBar key={step.label} step={step} prev={i > 0 ? o.funnel[i - 1] : null} />
          ))}
        </div>
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
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl font-extrabold tabular-nums ${accent ? "text-[#ffd23f]" : ""}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function HeartCard({ m }: { m: HeartMetric }) {
  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#ffd23f]/15 font-display text-sm font-extrabold text-[#ffd23f]">
          {m.key}
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-muted">{m.label}</span>
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold tabular-nums">{m.value}</p>
      <p className="mt-0.5 text-xs font-medium text-foreground/80">{m.title}</p>
      <p className="mt-1 text-[11px] leading-snug text-muted">{m.hint}</p>
      <p className="mt-2 border-t border-white/5 pt-2 text-[11px] leading-snug text-muted">{m.desc}</p>
    </div>
  );
}

function FunnelBar({ step, prev }: { step: FunnelStep; prev: FunnelStep | null }) {
  const dropoff =
    prev && prev.value > 0 ? Math.round(((prev.value - step.value) / prev.value) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{step.label}</span>
        <span className="tabular-nums text-muted">
          <span className="font-semibold text-foreground">{step.value}</span> · {step.pct}%
          {prev && dropoff > 0 && (
            <span className="ml-2 text-[#ff8a00]">−{dropoff}%</span>
          )}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ffd23f] to-[#ff8a00]"
          style={{ width: `${Math.max(2, step.pct)}%` }}
        />
      </div>
    </div>
  );
}
