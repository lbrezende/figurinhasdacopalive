"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { CITIES, TRADE_POINTS, DAYS, TIMES } from "@/lib/cities";
import { TEAM_ORDER, teamStyle, idealText, darken, fakePhoto } from "@/lib/teams";

type Kind = "SPECIAL" | "BADGE" | "PHOTO" | "PLAYER" | null;
type Cell = {
  number: number;
  name: string;
  rarity: "COMUM" | "RARO" | "LENDARIO";
  have: boolean;
  repeated: number;
  code: string | null;
  teamCode: string | null;
  teamName: string | null;
  kind: Kind;
  displayNo: number | null;
  verified: boolean;
};
type Counts = { have: number; miss: number; rep: number; total: number; pct: number };
type Album = { id: string; name: string; emoji: string; total: number };
type UserT = { name: string | null; email: string | null; city: string | null; plan: string; trialEndsAt: string | null };
type Match = { userId: string; name: string; score: number; theyGive: number[]; theyWant: number[] };
type Meetup = { id: string; partnerName: string | null; point: string; day: string; time: string; giveNumbers: number[]; getNumbers: number[]; status: string };

type Tab = "album" | "trade" | "meets" | "profile";
const RARITY_LABEL = { COMUM: "Comum", RARO: "Rara ✦", LENDARIO: "Lendária ★" } as const;

// Figurinhas usam fills sólidos (Airbnb evita gradientes): Rausch p/ lendária, violeta p/ rara, sky p/ comum.
const RARITY_CARD = {
  LENDARIO: "bg-primary text-on-primary",
  RARO: "bg-violet-500 text-white",
  COMUM: "bg-sky-500 text-white",
} as const;

export function AppClient({
  user, album, initialGrid, initialCounts,
}: { user: UserT; album: Album; initialGrid: Cell[]; initialCounts: Counts }) {
  const [tab, setTab] = useState<Tab>("album");
  const [grid, setGrid] = useState<Cell[]>(initialGrid);
  const [counts, setCounts] = useState<Counts>(initialCounts);
  const [filter, setFilter] = useState<"all" | "miss" | "have" | "rep">("all");
  const [detail, setDetail] = useState<Cell | null>(null);
  const [packCards, setPackCards] = useState<{ number: number; name: string; rarity: string; isNew: boolean }[] | null>(null);
  const [city, setCity] = useState(user.city || CITIES[0]);
  const [name, setName] = useState(user.name || "");

  const trialDays = useMemo(() => {
    if (user.plan !== "TRIAL" || !user.trialEndsAt) return 0;
    const d = Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / 864e5);
    return d > 0 ? d : 0;
  }, [user]);

  /* ---------- ações de banco ---------- */
  async function refreshGrid() {
    const r = await fetch("/api/collection").then((r) => r.json());
    if (r.grid) { setGrid(r.grid); setCounts(r.counts); }
  }

  function cellState(c: Cell) { return c.repeated > 0 ? "rep" : c.have ? "have" : "miss"; }

  async function cycle(c: Cell) {
    // otimista
    const next = !c.have ? { have: true, repeated: 0 } : c.repeated === 0 ? { have: true, repeated: 1 } : { have: false, repeated: 0 };
    setGrid((g) => g.map((x) => (x.number === c.number ? { ...x, ...next } : x)));
    const res = await fetch("/api/ownership", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ number: c.number, action: "cycle" }),
    }).then((r) => r.json());
    if (res.counts) setCounts(res.counts);
  }

  async function setState(number: number, have: boolean, repeated: number) {
    setGrid((g) => g.map((x) => (x.number === number ? { ...x, have, repeated: have ? repeated : 0 } : x)));
    setDetail((d) => (d && d.number === number ? { ...d, have, repeated: have ? repeated : 0 } : d));
    const res = await fetch("/api/ownership", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ number, action: "set", have, repeated }),
    }).then((r) => r.json());
    if (res.counts) setCounts(res.counts);
  }

  /* ---------- pacote ---------- */
  const [packLoading, setPackLoading] = useState(false);
  async function openPack(skip = false) {
    setPackLoading(true);
    try {
      const res = await fetch("/api/pack", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ skipCooldown: skip }),
      }).then((r) => r.json());
      if (!res.ok) {
        const mins = Math.ceil((res.readyAt - Date.now()) / 60000);
        toast(`Pacote em recarga ⏳ volte em ~${mins} min (ou use "pular cooldown")`);
        return;
      }
      setPackCards(res.cards);
      await refreshGrid();
    } finally { setPackLoading(false); }
  }

  /* ---------- long press p/ detalhe ---------- */
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);
  function onCellDown(c: Cell) {
    longPressed.current = false;
    pressTimer.current = setTimeout(() => { longPressed.current = true; setDetail(c); }, 450);
  }
  function onCellUp(c: Cell) {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (!longPressed.current) cycle(c);
  }

  /* ---------- catálogo por seleção ---------- */
  const isCatalog = useMemo(() => grid.some((c) => c.teamCode), [grid]);
  const teamsPresent = useMemo(() => {
    const set = new Set(grid.map((c) => c.teamCode ?? "FWC"));
    return TEAM_ORDER.filter((t) => set.has(t));
  }, [grid]);
  const [team, setTeam] = useState<string>(
    () => initialGrid.find((c) => c.teamCode && c.teamCode !== "FWC")?.teamCode ?? "FWC"
  );

  function matchFilter(c: Cell) {
    if (filter === "miss") return !c.have;
    if (filter === "have") return c.have;
    if (filter === "rep") return c.repeated > 0;
    return true;
  }

  const teamAll = useMemo(
    () => grid.filter((c) => (c.teamCode ?? "FWC") === team).sort((a, b) => a.number - b.number),
    [grid, team]
  );
  const teamHave = teamAll.filter((c) => c.have).length;
  const teamCells = teamAll.filter(matchFilter);
  const visible = grid.filter(matchFilter); // grid simples (álbuns gerados sem seleção)

  /* ---------- busca ---------- */
  const [search, setSearch] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);
  function highlight(n: number) {
    const el = gridRef.current?.querySelector(`[data-num="${n}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    (el as HTMLElement)?.classList.add("ring-4", "ring-amber-300");
    setTimeout(() => (el as HTMLElement)?.classList.remove("ring-4", "ring-amber-300"), 1600);
  }
  function jumpTo(n: number) {
    if (!isCatalog) { highlight(n); return; }
    if (teamAll.some((c) => c.displayNo === n)) { highlight(n); return; }
    const other = grid.find((c) => c.displayNo === n && c.teamCode);
    if (other?.teamCode) {
      setTeam(other.teamCode);
      setFilter("all");
      setTimeout(() => highlight(n), 80);
    }
  }
  function stepTeam(dir: number) {
    const i = teamsPresent.indexOf(team);
    const next = (i + dir + teamsPresent.length) % teamsPresent.length;
    setTeam(teamsPresent[next]);
    setFilter("all");
  }

  /* ---------- trocas ---------- */
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [matchCity, setMatchCity] = useState<string | null>(user.city);
  async function loadMatches() {
    setMatches(null);
    const r = await fetch("/api/matches").then((r) => r.json());
    setMatches(r.matches); setMatchCity(r.city);
  }
  useEffect(() => { if (tab === "trade" && matches === null) loadMatches(); }, [tab]); // eslint-disable-line

  /* ---------- encontros ---------- */
  const [meetups, setMeetups] = useState<Meetup[] | null>(null);
  async function loadMeetups() {
    const r = await fetch("/api/meetups").then((r) => r.json());
    setMeetups(r.meetups);
  }
  useEffect(() => { if (tab === "meets" && meetups === null) loadMeetups(); }, [tab]); // eslint-disable-line

  /* ---------- modal agendar troca ---------- */
  const [scheduling, setScheduling] = useState<Match | null>(null);

  /* ---------- perfil ---------- */
  async function saveProfile() {
    await fetch("/api/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, city }) });
    toast("Perfil salvo ✅");
  }
  function exportText() {
    const faltam = grid.filter((c) => !c.have).map((c) => c.number);
    const rep = grid.filter((c) => c.repeated > 0).map((c) => c.number);
    const txt = `📒 Meu álbum ${album.emoji} ${album.name}\n\n❌ Faltam (${faltam.length}): ${faltam.join(", ") || "—"}\n\n🔁 Repetidas (${rep.length}): ${rep.join(", ") || "—"}\n\nvia Figura Certa`;
    navigator.clipboard?.writeText(txt);
    toast("Lista copiada! Cola no WhatsApp 💬");
  }
  async function demo(action: "fill" | "reset" | "neighbors") {
    if (action === "reset" && !confirm("Apagar toda a sua coleção deste álbum?")) return;
    const r = await fetch("/api/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) }).then((r) => r.json());
    if (action === "neighbors") { toast(`${r.created || 0} vizinhos demo criados na sua cidade 👥`); setMatches(null); }
    else { await refreshGrid(); toast(action === "fill" ? "Álbum de exemplo preenchido 🎲" : "Coleção zerada 🧹"); }
  }

  return (
    <div className="min-h-screen bg-canvas pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-base">{album.emoji}</span>
            <div>
              <div className="text-sm font-bold leading-tight text-ink">Figura Certa</div>
              <div className="text-xs text-muted">{album.name}</div>
            </div>
          </div>
          <div className="text-right text-xs">
            <b className="text-ink">{user.name?.split(" ")[0]}</b>
            <div className="text-muted">📍 {user.city}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5">
        {trialDays > 0 && (
          <div className="mb-4 rounded-xl border border-primary/20 bg-primary-soft px-4 py-2.5 text-sm text-ink">
            🎁 Período grátis — <b>{trialDays}</b> {trialDays === 1 ? "dia" : "dias"}.
          </div>
        )}

        {/* ===== ÁLBUM ===== */}
        {tab === "album" && (
          <div className="space-y-4">
            {/* stats */}
            <div className="flex items-center gap-5 rounded-2xl border border-hairline bg-canvas p-5 shadow-[var(--shadow-airbnb)]">
              <div className="relative h-[86px] w-[86px] shrink-0">
                <svg width="86" height="86" className="-rotate-90">
                  <circle stroke="#ebebeb" strokeWidth="6" fill="transparent" r="38" cx="43" cy="43" />
                  <circle stroke="#10b981" strokeWidth="6" fill="transparent" r="38" cx="43" cy="43"
                    strokeDasharray="238.76" strokeDashoffset={238.76 - (counts.pct / 100) * 238.76} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-lg font-bold text-ink">{counts.pct}%</div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-ink">Meu Álbum</h2>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <Stat n={counts.have} l="Tenho" c="text-emerald-600" />
                  <Stat n={counts.miss} l="Faltam" c="text-rose-500" />
                  <Stat n={counts.rep} l="Repetidas" c="text-violet-600" />
                </div>
              </div>
            </div>

            {/* pacote */}
            <div className="flex items-center gap-4 rounded-2xl border border-hairline bg-canvas p-5">
              <div className="text-4xl">🎁</div>
              <div className="flex-1">
                <h3 className="font-bold text-ink">Pacote diário grátis</h3>
                <p className="text-xs text-muted">5 figurinhas pra acelerar o álbum.</p>
                <div className="mt-2 flex items-center gap-3">
                  <button onClick={() => openPack(false)} disabled={packLoading} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-active disabled:bg-primary-disabled">
                    {packLoading ? "Abrindo…" : "Abrir pacote"}
                  </button>
                  <button onClick={() => openPack(true)} className="text-xs text-muted underline">Pular cooldown (demo)</button>
                </div>
              </div>
            </div>

            {/* busca + filtros */}
            <div className="rounded-2xl border border-hairline bg-canvas p-4">
              <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface-soft px-3 py-2">
                <span>🔎</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && search) jumpTo(Number(search)); }}
                  inputMode="numeric" placeholder={isCatalog ? "Ir para o nº do jogador… (Enter)" : "Ir para o número… (Enter)"} className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-soft" />
              </div>
              <div className="mt-3 flex gap-2">
                {(["all", "miss", "have", "rep"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === f ? "bg-ink text-white" : "bg-surface-soft text-body hover:bg-surface-strong"}`}>
                    {f === "all" ? "Todas" : f === "miss" ? "Faltam" : f === "have" ? "Tenho" : "Repetidas"}
                  </button>
                ))}
              </div>

              {isCatalog ? (
                /* navegação de seleções */
                <div className="mt-4 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                  {teamsPresent.map((tc) => {
                    const ts = teamStyle(tc);
                    const active = tc === team;
                    return (
                      <button key={tc} onClick={() => { setTeam(tc); setFilter("all"); }}
                        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${active ? "border-ink bg-ink text-white" : "border-hairline bg-surface-soft text-body hover:bg-surface-strong"}`}>
                        <span className="text-sm">{ts.flag}</span>{tc === "FWC" ? "★" : tc}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div className="mt-3 flex gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-surface-strong" /> Falta</span>
                    <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Tenho</span>
                    <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-violet-500" /> Repetida</span>
                  </div>
                  <div ref={gridRef} className="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-8">
                    {visible.map((c) => {
                      const st = cellState(c);
                      return (
                        <button key={c.number} data-num={c.number}
                          onPointerDown={() => onCellDown(c)} onPointerUp={() => onCellUp(c)} onPointerLeave={() => pressTimer.current && clearTimeout(pressTimer.current)}
                          onContextMenu={(e) => { e.preventDefault(); setDetail(c); }}
                          className={`relative aspect-square rounded-md text-xs font-bold transition ${st === "rep" ? "bg-violet-500 text-white" : st === "have" ? "bg-emerald-500 text-white" : "bg-surface-soft text-muted-soft"}`}>
                          {c.number}
                          {c.rarity === "LENDARIO" && <span className="absolute -right-0.5 -top-0.5 text-[8px]">⭐</span>}
                          {c.repeated > 1 && <span className="absolute bottom-0 right-0.5 text-[8px]">×{c.repeated}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-center text-xs text-muted">Toque: Falta ⇄ Tenho ⇄ Repetida · Segure: detalhes</p>
                </>
              )}
            </div>

            {/* ===== STAGE DA SELEÇÃO (estilo WE ARE) ===== */}
            {isCatalog && (() => {
              const ts = teamStyle(team);
              const [p] = ts.colors;
              const onP = idealText(p);
              const title = team === "FWC" ? "Especiais" : (teamAll[0]?.teamName ?? ts.name);
              return (
                <section className="overflow-hidden rounded-3xl border border-hairline shadow-[var(--shadow-airbnb)]">
                  {/* cabeçalho com fundo poligonal */}
                  <div className="relative px-5 pt-6 pb-5" style={{ background: `linear-gradient(135deg, ${p}, ${darken(p, 0.45)})` }}>
                    <TeamBackdrop colors={ts.colors} />
                    <div className="relative flex items-start justify-between gap-3">
                      <div style={{ color: onP }}>
                        <div className="text-[11px] font-black uppercase tracking-[0.25em] opacity-80">We are</div>
                        <h2 className="text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-4xl">{title}</h2>
                        <div className="mt-2 text-[11px] font-semibold opacity-85">{ts.flag} {team === "FWC" ? "Figurinhas do torneio" : `Seleção • ${team}`}</div>
                      </div>
                      <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-center shadow-lg">
                        <div className="text-2xl font-black leading-none text-ink">{teamHave}<span className="text-sm text-muted">/{teamAll.length}</span></div>
                        <div className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-primary">coladas</div>
                      </div>
                    </div>
                  </div>

                  {/* grade de cards */}
                  <div ref={gridRef} className="grid grid-cols-3 gap-2.5 bg-canvas p-4 sm:grid-cols-4">
                    {teamCells.map((c) => (
                      <StickerCard key={c.number} cell={c} colors={ts.colors}
                        onDown={() => onCellDown(c)} onUp={() => onCellUp(c)}
                        onCancel={() => pressTimer.current && clearTimeout(pressTimer.current)}
                        onDetail={() => setDetail(c)} />
                    ))}
                    {teamCells.length === 0 && (
                      <p className="col-span-full py-10 text-center text-sm text-muted">Nenhuma figurinha com esse filtro.</p>
                    )}
                  </div>

                  {/* navegação ◀ país ▶ */}
                  <div className="flex items-center justify-between gap-3 border-t border-hairline bg-canvas px-4 py-3">
                    <button onClick={() => stepTeam(-1)} className="grid h-9 w-9 place-items-center rounded-full bg-ink text-lg font-bold text-white transition hover:bg-ink/80">‹</button>
                    <div className="truncate text-sm font-black uppercase tracking-wide text-ink">{title}</div>
                    <button onClick={() => stepTeam(1)} className="grid h-9 w-9 place-items-center rounded-full bg-ink text-lg font-bold text-white transition hover:bg-ink/80">›</button>
                  </div>
                  <p className="bg-canvas pb-3 text-center text-xs text-muted">Toque: Falta ⇄ Tenho ⇄ Repetida · Segure: detalhes</p>
                </section>
              );
            })()}
          </div>
        )}

        {/* ===== TROCAS ===== */}
        {tab === "trade" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-hairline bg-canvas p-5">
              <h2 className="text-lg font-bold text-ink">🤝 Trocas em {matchCity || "—"}</h2>
              <p className="mt-1 text-sm text-muted">Quem tem o que você precisa e quer suas repetidas. Maior score = melhor troca.</p>
              <button onClick={loadMatches} className="mt-3 rounded-lg bg-surface-soft px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-surface-strong">Atualizar</button>
            </div>
            {matches === null && <p className="text-center text-sm text-muted">Carregando…</p>}
            {matches?.length === 0 && (
              <div className="rounded-2xl border border-hairline bg-canvas p-5 text-center text-sm text-muted">
                Ninguém na sua cidade ainda. Crie <b className="text-ink">vizinhos de demonstração</b> no Perfil pra ver como funciona. 👥
              </div>
            )}
            {matches?.map((m) => (
              <div key={m.userId} className="rounded-2xl border border-hairline bg-canvas p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <b className="text-ink">{m.name}</b>
                    <div className="text-xs text-muted">Te dá <b className="text-emerald-600">{m.theyGive.length}</b> · quer <b className="text-violet-600">{m.theyWant.length}</b> suas</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{m.score}</div>
                    <div className="text-[10px] text-muted">score</div>
                  </div>
                </div>
                <button onClick={() => setScheduling(m)} className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-active">Marcar troca</button>
              </div>
            ))}
          </div>
        )}

        {/* ===== ENCONTROS ===== */}
        {tab === "meets" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-hairline bg-canvas p-5">
              <h2 className="text-lg font-bold text-ink">📅 Minhas trocas marcadas</h2>
            </div>
            {meetups === null && <p className="text-center text-sm text-muted">Carregando…</p>}
            {meetups?.length === 0 && <p className="rounded-2xl border border-hairline bg-canvas p-5 text-center text-sm text-muted">Nenhum encontro marcado ainda. Vá em Trocas e marque um! 🤝</p>}
            {meetups?.map((m) => (
              <div key={m.id} className="rounded-2xl border border-hairline bg-canvas p-4">
                <b className="text-ink">{m.partnerName}</b>
                <div className="mt-1 text-sm text-muted">📍 {m.point}</div>
                <div className="text-sm text-muted">🕐 {m.day} · {m.time}</div>
                <div className="mt-2 text-xs text-muted">Leva {m.giveNumbers.length} · recebe {m.getNumbers.length}</div>
              </div>
            ))}
          </div>
        )}

        {/* ===== PERFIL ===== */}
        {tab === "profile" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-hairline bg-canvas p-5">
              <h2 className="text-lg font-bold text-ink">👤 Meu perfil</h2>
              <label className="mt-3 block text-sm font-semibold text-ink">Nome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-hairline bg-canvas px-4 py-2.5 text-sm text-ink outline-none focus:border-ink" />
              <label className="mt-3 block text-sm font-semibold text-ink">Cidade</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-lg border border-hairline bg-canvas px-4 py-2.5 text-sm text-ink outline-none focus:border-ink">
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <button onClick={saveProfile} className="mt-4 w-full rounded-lg bg-primary py-2.5 font-semibold text-on-primary transition hover:bg-primary-active">Salvar alterações</button>
            </div>

            <div className="rounded-2xl border border-hairline bg-canvas p-5">
              <h2 className="text-lg font-bold text-ink">📋 Exportar p/ WhatsApp</h2>
              <p className="mt-1 text-sm text-muted">Gera a lista de faltantes e repetidas pra compartilhar.</p>
              <button onClick={exportText} className="mt-3 w-full rounded-lg bg-surface-soft py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-strong">💬 Copiar lista</button>
            </div>

            <div className="rounded-2xl border border-hairline bg-canvas p-5">
              <h2 className="text-lg font-bold text-ink">⚡ Atalhos e testes</h2>
              <div className="mt-3 space-y-2">
                <button onClick={() => demo("fill")} className="w-full rounded-lg bg-surface-soft py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-strong">🎲 Preencher álbum de exemplo</button>
                <button onClick={() => demo("neighbors")} className="w-full rounded-lg bg-surface-soft py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-strong">👥 Criar vizinhos de demonstração</button>
                <button onClick={() => demo("reset")} className="w-full rounded-lg border border-error/40 py-2.5 text-sm font-semibold text-error transition hover:bg-error/5">Apagar coleção</button>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full rounded-lg border border-hairline py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-soft">Sair</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Nav inferior */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-hairline bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl">
          {([["album", "📒", "Álbum"], ["trade", "🔁", "Trocas"], ["meets", "📅", "Encontros"], ["profile", "👤", "Perfil"]] as const).map(([t, ic, lb]) => (
            <button key={t} onClick={() => setTab(t)} className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-semibold transition ${tab === t ? "text-primary" : "text-muted"}`}>
              <span className="text-lg">{ic}</span>{lb}
            </button>
          ))}
        </div>
      </nav>

      {/* Modal detalhe */}
      {detail && (
        <Modal onClose={() => setDetail(null)}>
          <div className="text-center">
            {detail.teamCode ? (
              (() => {
                const ts = teamStyle(detail.teamCode);
                const p = ts.colors[0];
                const tag = detail.teamCode === "FWC" ? detail.code : `${detail.teamCode} ${detail.displayNo ?? detail.number}`;
                return (
                  <div className="mx-auto w-40 overflow-hidden rounded-2xl shadow-lg" style={{ background: detail.have ? p : "#d9dde3", padding: 4 }}>
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                      {detail.kind === "PLAYER" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fakePhoto(detail.number)} alt={detail.name}
                          className={`h-full w-full object-cover ${detail.have ? "" : "opacity-60 grayscale"}`} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-5xl"
                          style={{ background: `linear-gradient(135deg, ${p}, ${darken(p, 0.4)})` }}>
                          {detail.kind === "SPECIAL" ? "🏆" : ts.flag}
                        </div>
                      )}
                      {!detail.have && (
                        <div className="absolute inset-0 grid place-items-center bg-black/35 text-3xl font-black text-white">
                          {detail.displayNo ?? detail.number}
                        </div>
                      )}
                    </div>
                    <div className="px-1 py-1.5 text-center text-xs font-black" style={{ color: detail.have ? idealText(p) : "#6a6a6a" }}>{tag}</div>
                  </div>
                );
              })()
            ) : (
              <div className={`mx-auto flex h-44 w-32 flex-col items-center justify-center rounded-2xl ${RARITY_CARD[detail.rarity]}`}>
                <div className="text-xs font-bold opacity-80">{RARITY_LABEL[detail.rarity]}</div>
                <div className="text-4xl font-bold">{detail.number}</div>
                <div className="px-2 text-center text-sm font-bold">{detail.name}</div>
              </div>
            )}
            <h2 className="mt-4 text-xl font-bold text-ink">{detail.name}</h2>
            <p className="mt-0.5 text-xs text-muted">
              {detail.teamName ? `${detail.teamName} • ${detail.code}` : `Figurinha #${detail.number}`}
              {!detail.verified && " • nome fictício"}
            </p>
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold text-ink">Estado</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={() => setState(detail.number, true, detail.repeated)} className={`rounded-lg py-2.5 text-sm font-bold transition ${detail.have ? "bg-emerald-500 text-white" : "bg-surface-soft text-ink hover:bg-surface-strong"}`}>Tenho</button>
              <button onClick={() => setState(detail.number, false, 0)} className={`rounded-lg py-2.5 text-sm font-bold transition ${!detail.have ? "bg-rose-500 text-white" : "bg-surface-soft text-ink hover:bg-surface-strong"}`}>Falta</button>
            </div>
          </div>
          {detail.have && (
            <div className="mt-4">
              <label className="text-sm font-semibold text-ink">Repetidas para troca</label>
              <div className="mt-2 flex items-center justify-center gap-4">
                <button onClick={() => setState(detail.number, true, Math.max(0, detail.repeated - 1))} className="h-10 w-10 rounded-lg bg-surface-soft text-lg font-bold text-ink transition hover:bg-surface-strong">—</button>
                <span className="text-2xl font-bold text-ink">{detail.repeated}</span>
                <button onClick={() => setState(detail.number, true, detail.repeated + 1)} className="h-10 w-10 rounded-lg bg-surface-soft text-lg font-bold text-ink transition hover:bg-surface-strong">+</button>
              </div>
            </div>
          )}
          <button onClick={() => setDetail(null)} className="mt-6 w-full rounded-lg bg-primary py-2.5 font-semibold text-on-primary transition hover:bg-primary-active">Confirmar e fechar</button>
        </Modal>
      )}

      {/* Modal pacote aberto */}
      {packCards && (
        <Modal onClose={() => setPackCards(null)}>
          <h2 className="text-center text-xl font-bold text-ink">🎁 Você abriu um pacote!</h2>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {packCards.map((c, i) => (
              <div key={i} className={`flex aspect-[3/4] flex-col items-center justify-center rounded-lg text-center ${RARITY_CARD[(c.rarity as keyof typeof RARITY_CARD)] ?? RARITY_CARD.COMUM}`}>
                <div className="text-lg font-bold">{c.number}</div>
                <div className="text-[9px] font-bold">{c.isNew ? "NOVA!" : "repetida"}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setPackCards(null)} className="mt-5 w-full rounded-lg bg-primary py-2.5 font-semibold text-on-primary transition hover:bg-primary-active">Boa!</button>
        </Modal>
      )}

      {/* Modal agendar troca */}
      {scheduling && (
        <ScheduleModal match={scheduling} onClose={() => setScheduling(null)} onDone={() => { setScheduling(null); setMeetups(null); setTab("meets"); toast("Troca combinada! ✅"); }} />
      )}
    </div>
  );
}

function Stat({ n, l, c }: { n: number; l: string; c: string }) {
  return (
    <div className="rounded-xl bg-surface-soft py-2">
      <div className={`text-xl font-bold ${c}`}>{n}</div>
      <div className="text-[10px] text-muted">{l}</div>
    </div>
  );
}

/** Fundo poligonal nas cores da seleção (estilo das artes "WE ARE"). */
function TeamBackdrop({ colors }: { colors: [string, string, string] }) {
  const [, s, a] = colors;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 200" aria-hidden>
      <polygon points="0,200 170,200 0,70" fill={s} opacity="0.22" />
      <polygon points="400,0 400,130 250,0" fill={a} opacity="0.30" />
      <polygon points="400,200 210,200 400,85" fill={a} opacity="0.16" />
      <polygon points="110,0 250,0 150,95" fill={s} opacity="0.12" />
    </svg>
  );
}

/** Card de figurinha estilo Panini: escudo, seleção, especial ou jogador (com foto fictícia). */
function StickerCard({
  cell, colors, onDown, onUp, onCancel, onDetail,
}: {
  cell: Cell;
  colors: [string, string, string];
  onDown: () => void; onUp: () => void; onCancel: () => void; onDetail: () => void;
}) {
  const p = colors[0];
  const have = cell.have;
  const rep = cell.repeated > 0;
  const no = cell.displayNo ?? cell.number;
  const isPhotoCard = cell.kind === "PLAYER";
  const frame = have ? p : "#d9dde3";
  const labelBg = have ? p : "#eef0f3";
  const labelText = have ? idealText(p) : "#5a5a5a";
  const tag = cell.teamCode === "FWC" ? cell.code ?? "★" : `${cell.teamCode} ${no}`;
  const crestLabel = cell.kind === "BADGE" ? "Escudo" : cell.kind === "PHOTO" ? "Seleção" : "Especial";

  return (
    <button
      data-num={no}
      onPointerDown={onDown} onPointerUp={onUp} onPointerLeave={onCancel}
      onContextMenu={(e) => { e.preventDefault(); onDetail(); }}
      className="relative flex flex-col overflow-hidden rounded-xl text-left shadow-sm transition active:scale-[0.97]"
      style={{ background: frame, padding: 3 }}
    >
      <span className="absolute left-1.5 top-1.5 z-10 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-ink">{tag}</span>
      {rep ? (
        <span className="absolute right-1.5 top-1.5 z-10 rounded-md bg-rose-500 px-1.5 py-0.5 text-[9px] font-black text-white">×REP</span>
      ) : have ? (
        <span className="absolute right-1.5 top-1.5 z-10 grid h-5 w-5 place-items-center rounded-md bg-emerald-500 text-[11px] font-black text-white">✓</span>
      ) : null}

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
        {isPhotoCard ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fakePhoto(cell.number)} alt={cell.name} loading="lazy"
              className={`h-full w-full object-cover transition ${have ? "" : "opacity-60 grayscale"}`} />
            {!have && (
              <span className="absolute inset-0 grid place-items-center bg-black/30 text-3xl font-black text-white/90">{no}</span>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center"
            style={{ background: have ? `linear-gradient(135deg, ${p}, ${darken(p, 0.4)})` : "#f2f3f5" }}>
            <span className="text-4xl leading-none">{cell.kind === "SPECIAL" ? "🏆" : cell.kind === "PHOTO" ? "📸" : teamStyle(cell.teamCode).flag}</span>
            <span className="mt-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: have ? idealText(p) : "#9aa0a8" }}>{crestLabel}</span>
          </div>
        )}
      </div>

      <div className="truncate px-1.5 py-1 text-center text-[10px] font-bold" style={{ background: labelBg, color: labelText }}>{cell.name}</div>
    </button>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl border border-hairline bg-canvas p-6 shadow-[var(--shadow-airbnb-lg)]" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ScheduleModal({ match, onClose, onDone }: { match: Match; onClose: () => void; onDone: () => void }) {
  const [point, setPoint] = useState(TRADE_POINTS[0].nm);
  const [day, setDay] = useState(DAYS[0]);
  const [time, setTime] = useState(TIMES[0]);
  const [saving, setSaving] = useState(false);
  async function confirm() {
    setSaving(true);
    try {
      await fetch("/api/meetups", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ partnerId: match.userId, partnerName: match.name, point, day, time, give: match.theyWant, get: match.theyGive }),
      });
      onDone();
    } finally { setSaving(false); }
  }
  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold text-ink">Marcar troca com {match.name}</h2>
      <div className="mt-4">
        <label className="text-sm font-semibold text-ink">📍 Ponto de troca</label>
        <div className="mt-2 space-y-2">
          {TRADE_POINTS.map((p) => (
            <button key={p.nm} onClick={() => setPoint(p.nm)} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${point === p.nm ? "border-primary bg-primary-soft" : "border-hairline bg-canvas hover:bg-surface-soft"}`}>
              <span className="text-xl">{p.ic}</span><span><b className="text-ink">{p.nm}</b><div className="text-xs text-muted">{p.ds}</div></span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm font-semibold text-ink">🕐 Dia</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DAYS.map((d) => <button key={d} onClick={() => setDay(d)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${day === d ? "bg-ink text-white" : "bg-surface-soft text-body hover:bg-surface-strong"}`}>{d}</button>)}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {TIMES.map((t) => <button key={t} onClick={() => setTime(t)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${time === t ? "bg-ink text-white" : "bg-surface-soft text-body hover:bg-surface-strong"}`}>{t}</button>)}
        </div>
      </div>
      <button onClick={confirm} disabled={saving} className="mt-6 w-full rounded-lg bg-primary py-2.5 font-semibold text-on-primary transition hover:bg-primary-active disabled:bg-primary-disabled">{saving ? "Confirmando…" : "Confirmar encontro"}</button>
    </Modal>
  );
}
