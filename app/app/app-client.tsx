"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { CITIES, TRADE_POINTS, DAYS, TIMES } from "@/lib/cities";

type Cell = { number: number; name: string; rarity: "COMUM" | "RARO" | "LENDARIO"; have: boolean; repeated: number };
type Counts = { have: number; miss: number; rep: number; total: number; pct: number };
type Album = { id: string; name: string; emoji: string; total: number };
type UserT = { name: string | null; email: string | null; city: string | null; plan: string; trialEndsAt: string | null };
type Match = { userId: string; name: string; score: number; theyGive: number[]; theyWant: number[] };
type Meetup = { id: string; partnerName: string | null; point: string; day: string; time: string; giveNumbers: number[]; getNumbers: number[]; status: string };

type Tab = "album" | "trade" | "meets" | "profile";
const RARITY_LABEL = { COMUM: "Comum", RARO: "Rara ✦", LENDARIO: "Lendária ★" } as const;

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

  /* ---------- busca ---------- */
  const [search, setSearch] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);
  function jumpTo(n: number) {
    const el = gridRef.current?.querySelector(`[data-num="${n}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    (el as HTMLElement)?.classList.add("ring-2", "ring-[#ffd23f]");
    setTimeout(() => (el as HTMLElement)?.classList.remove("ring-2", "ring-[#ffd23f]"), 1600);
  }

  const visible = grid.filter((c) => {
    if (filter === "miss") return !c.have;
    if (filter === "have") return c.have;
    if (filter === "rep") return c.repeated > 0;
    return true;
  });

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
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070a13]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] text-base">{album.emoji}</span>
            <div>
              <div className="font-display text-sm font-extrabold leading-tight">Figura Certa</div>
              <div className="text-xs text-muted">{album.name}</div>
            </div>
          </div>
          <div className="text-right text-xs">
            <b>{user.name?.split(" ")[0]}</b>
            <div className="text-muted">📍 {user.city}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5">
        {trialDays > 0 && (
          <div className="mb-4 rounded-xl border border-[#ffd23f]/25 bg-[#ffd23f]/10 px-4 py-2.5 text-sm">
            🎁 Período grátis — <b>{trialDays}</b> {trialDays === 1 ? "dia" : "dias"}.
          </div>
        )}

        {/* ===== ÁLBUM ===== */}
        {tab === "album" && (
          <div className="space-y-4">
            {/* stats */}
            <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-[#151d33]/60 p-5">
              <div className="relative h-[86px] w-[86px] shrink-0">
                <svg width="86" height="86" className="-rotate-90">
                  <circle stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="transparent" r="38" cx="43" cy="43" />
                  <circle stroke="#34d399" strokeWidth="6" fill="transparent" r="38" cx="43" cy="43"
                    strokeDasharray="238.76" strokeDashoffset={238.76 - (counts.pct / 100) * 238.76} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 grid place-items-center font-display text-lg font-bold">{counts.pct}%</div>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-bold">Meu Álbum</h2>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <Stat n={counts.have} l="Tenho" c="text-emerald-400" />
                  <Stat n={counts.miss} l="Faltam" c="text-rose-400" />
                  <Stat n={counts.rep} l="Repetidas" c="text-purple-400" />
                </div>
              </div>
            </div>

            {/* pacote */}
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#151d33]/60 p-5">
              <div className="text-4xl">🎁</div>
              <div className="flex-1">
                <h3 className="font-bold">Pacote diário grátis</h3>
                <p className="text-xs text-muted">5 figurinhas pra acelerar o álbum.</p>
                <div className="mt-2 flex items-center gap-3">
                  <button onClick={() => openPack(false)} disabled={packLoading} className="rounded-lg bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] px-4 py-2 text-sm font-bold text-[#0d0903] disabled:opacity-60">
                    {packLoading ? "Abrindo…" : "Abrir pacote"}
                  </button>
                  <button onClick={() => openPack(true)} className="text-xs text-muted underline">Pular cooldown (demo)</button>
                </div>
              </div>
            </div>

            {/* busca + filtros */}
            <div className="rounded-2xl border border-white/10 bg-[#151d33]/60 p-4">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0a0f1e] px-3 py-2">
                <span>🔎</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && search) jumpTo(Number(search)); }}
                  inputMode="numeric" placeholder="Ir para o número… (Enter)" className="w-full bg-transparent text-sm outline-none" />
              </div>
              <div className="mt-3 flex gap-2">
                {(["all", "miss", "have", "rep"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === f ? "bg-[#ffd23f] text-black" : "bg-white/5 text-white/70"}`}>
                    {f === "all" ? "Todas" : f === "miss" ? "Faltam" : f === "have" ? "Tenho" : "Repetidas"}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-white/15" /> Falta</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Tenho</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Repetida</span>
              </div>

              <div ref={gridRef} className="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-8">
                {visible.map((c) => {
                  const st = cellState(c);
                  return (
                    <button key={c.number} data-num={c.number}
                      onPointerDown={() => onCellDown(c)} onPointerUp={() => onCellUp(c)} onPointerLeave={() => pressTimer.current && clearTimeout(pressTimer.current)}
                      onContextMenu={(e) => { e.preventDefault(); setDetail(c); }}
                      className={`relative aspect-square rounded-md text-xs font-bold transition ${st === "rep" ? "bg-purple-500 text-white" : st === "have" ? "bg-emerald-500 text-black" : "bg-white/5 text-white/40"}`}>
                      {c.number}
                      {c.rarity === "LENDARIO" && <span className="absolute -right-0.5 -top-0.5 text-[8px]">⭐</span>}
                      {c.repeated > 1 && <span className="absolute bottom-0 right-0.5 text-[8px]">×{c.repeated}</span>}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-xs text-muted">Toque: Falta ⇄ Tenho ⇄ Repetida · Segure: detalhes</p>
            </div>
          </div>
        )}

        {/* ===== TROCAS ===== */}
        {tab === "trade" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-[#151d33]/60 p-5">
              <h2 className="font-display text-lg font-bold">🤝 Trocas em {matchCity || "—"}</h2>
              <p className="mt-1 text-sm text-muted">Quem tem o que você precisa e quer suas repetidas. Maior score = melhor troca.</p>
              <button onClick={loadMatches} className="mt-3 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold">Atualizar</button>
            </div>
            {matches === null && <p className="text-center text-sm text-muted">Carregando…</p>}
            {matches?.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#151d33]/60 p-5 text-center text-sm text-muted">
                Ninguém na sua cidade ainda. Crie <b>vizinhos de demonstração</b> no Perfil pra ver como funciona. 👥
              </div>
            )}
            {matches?.map((m) => (
              <div key={m.userId} className="rounded-2xl border border-white/10 bg-[#151d33]/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <b>{m.name}</b>
                    <div className="text-xs text-muted">Te dá <b className="text-emerald-400">{m.theyGive.length}</b> · quer <b className="text-purple-400">{m.theyWant.length}</b> suas</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-black text-[#ffd23f]">{m.score}</div>
                    <div className="text-[10px] text-muted">score</div>
                  </div>
                </div>
                <button onClick={() => setScheduling(m)} className="mt-3 w-full rounded-lg bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] py-2 text-sm font-bold text-[#0d0903]">Marcar troca</button>
              </div>
            ))}
          </div>
        )}

        {/* ===== ENCONTROS ===== */}
        {tab === "meets" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-[#151d33]/60 p-5">
              <h2 className="font-display text-lg font-bold">📅 Minhas trocas marcadas</h2>
            </div>
            {meetups === null && <p className="text-center text-sm text-muted">Carregando…</p>}
            {meetups?.length === 0 && <p className="rounded-2xl border border-white/10 bg-[#151d33]/60 p-5 text-center text-sm text-muted">Nenhum encontro marcado ainda. Vá em Trocas e marque um! 🤝</p>}
            {meetups?.map((m) => (
              <div key={m.id} className="rounded-2xl border border-white/10 bg-[#151d33]/60 p-4">
                <b>{m.partnerName}</b>
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
            <div className="rounded-2xl border border-white/10 bg-[#151d33]/60 p-5">
              <h2 className="font-display text-lg font-bold">👤 Meu perfil</h2>
              <label className="mt-3 block text-sm font-semibold">Nome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0f1e] px-4 py-2.5 text-sm" />
              <label className="mt-3 block text-sm font-semibold">Cidade</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0f1e] px-4 py-2.5 text-sm">
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <button onClick={saveProfile} className="mt-4 w-full rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] py-2.5 font-bold text-[#0d0903]">Salvar alterações</button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#151d33]/60 p-5">
              <h2 className="font-display text-lg font-bold">📋 Exportar p/ WhatsApp</h2>
              <p className="mt-1 text-sm text-muted">Gera a lista de faltantes e repetidas pra compartilhar.</p>
              <button onClick={exportText} className="mt-3 w-full rounded-xl bg-white/5 py-2.5 text-sm font-bold">💬 Copiar lista</button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#151d33]/60 p-5">
              <h2 className="font-display text-lg font-bold">⚡ Atalhos e testes</h2>
              <div className="mt-3 space-y-2">
                <button onClick={() => demo("fill")} className="w-full rounded-xl bg-white/5 py-2.5 text-sm font-semibold">🎲 Preencher álbum de exemplo</button>
                <button onClick={() => demo("neighbors")} className="w-full rounded-xl bg-white/5 py-2.5 text-sm font-semibold">👥 Criar vizinhos de demonstração</button>
                <button onClick={() => demo("reset")} className="w-full rounded-xl border border-rose-500/30 py-2.5 text-sm font-semibold text-rose-400">Apagar coleção</button>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full rounded-xl border border-white/10 py-2.5 text-sm font-semibold">Sair</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Nav inferior */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#0d1221]/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl">
          {([["album", "📒", "Álbum"], ["trade", "🔁", "Trocas"], ["meets", "📅", "Encontros"], ["profile", "👤", "Perfil"]] as const).map(([t, ic, lb]) => (
            <button key={t} onClick={() => setTab(t)} className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-semibold ${tab === t ? "text-[#ffd23f]" : "text-white/50"}`}>
              <span className="text-lg">{ic}</span>{lb}
            </button>
          ))}
        </div>
      </nav>

      {/* Modal detalhe */}
      {detail && (
        <Modal onClose={() => setDetail(null)}>
          <div className="text-center">
            <div className={`mx-auto flex h-44 w-32 flex-col items-center justify-center rounded-2xl ${detail.rarity === "LENDARIO" ? "bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] text-black" : detail.rarity === "RARO" ? "bg-gradient-to-br from-purple-400 to-purple-700" : "bg-gradient-to-br from-cyan-400 to-cyan-700"}`}>
              <div className="text-xs font-bold opacity-70">{RARITY_LABEL[detail.rarity]}</div>
              <div className="font-display text-4xl font-black">{detail.number}</div>
              <div className="px-2 text-center text-sm font-bold">{detail.name}</div>
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">Figurinha #{detail.number}</h2>
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold">Estado</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={() => setState(detail.number, true, detail.repeated)} className={`rounded-xl py-2.5 text-sm font-bold ${detail.have ? "bg-emerald-500 text-black" : "bg-white/5"}`}>Tenho</button>
              <button onClick={() => setState(detail.number, false, 0)} className={`rounded-xl py-2.5 text-sm font-bold ${!detail.have ? "bg-rose-500 text-white" : "bg-white/5"}`}>Falta</button>
            </div>
          </div>
          {detail.have && (
            <div className="mt-4">
              <label className="text-sm font-semibold">Repetidas para troca</label>
              <div className="mt-2 flex items-center justify-center gap-4">
                <button onClick={() => setState(detail.number, true, Math.max(0, detail.repeated - 1))} className="h-10 w-10 rounded-xl bg-white/5 text-lg font-bold">—</button>
                <span className="font-display text-2xl font-black">{detail.repeated}</span>
                <button onClick={() => setState(detail.number, true, detail.repeated + 1)} className="h-10 w-10 rounded-xl bg-white/5 text-lg font-bold">+</button>
              </div>
            </div>
          )}
          <button onClick={() => setDetail(null)} className="mt-6 w-full rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] py-2.5 font-bold text-[#0d0903]">Confirmar e fechar</button>
        </Modal>
      )}

      {/* Modal pacote aberto */}
      {packCards && (
        <Modal onClose={() => setPackCards(null)}>
          <h2 className="text-center font-display text-xl font-bold">🎁 Você abriu um pacote!</h2>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {packCards.map((c, i) => (
              <div key={i} className={`flex aspect-[3/4] flex-col items-center justify-center rounded-lg text-center ${c.rarity === "LENDARIO" ? "bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] text-black" : c.rarity === "RARO" ? "bg-gradient-to-br from-purple-400 to-purple-700" : "bg-gradient-to-br from-cyan-500 to-cyan-800"}`}>
                <div className="font-display text-lg font-black">{c.number}</div>
                <div className="text-[9px] font-bold">{c.isNew ? "NOVA!" : "repetida"}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setPackCards(null)} className="mt-5 w-full rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] py-2.5 font-bold text-[#0d0903]">Boa!</button>
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
    <div className="rounded-xl bg-white/5 py-2">
      <div className={`font-display text-xl font-black ${c}`}>{n}</div>
      <div className="text-[10px] text-muted">{l}</div>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur sm:items-center" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1221] p-6" onClick={(e) => e.stopPropagation()}>
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
      <h2 className="font-display text-xl font-bold">Marcar troca com {match.name}</h2>
      <div className="mt-4">
        <label className="text-sm font-semibold">📍 Ponto de troca</label>
        <div className="mt-2 space-y-2">
          {TRADE_POINTS.map((p) => (
            <button key={p.nm} onClick={() => setPoint(p.nm)} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm ${point === p.nm ? "border-[#ffd23f] bg-[#ffd23f]/10" : "border-white/10 bg-white/5"}`}>
              <span className="text-xl">{p.ic}</span><span><b>{p.nm}</b><div className="text-xs text-muted">{p.ds}</div></span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm font-semibold">🕐 Dia</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DAYS.map((d) => <button key={d} onClick={() => setDay(d)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${day === d ? "bg-[#ffd23f] text-black" : "bg-white/5"}`}>{d}</button>)}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {TIMES.map((t) => <button key={t} onClick={() => setTime(t)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${time === t ? "bg-[#ffd23f] text-black" : "bg-white/5"}`}>{t}</button>)}
        </div>
      </div>
      <button onClick={confirm} disabled={saving} className="mt-6 w-full rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] py-2.5 font-bold text-[#0d0903] disabled:opacity-60">{saving ? "Confirmando…" : "Confirmar encontro"}</button>
    </Modal>
  );
}
