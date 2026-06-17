"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* ============================================================
   Modelo de dados — visualização 3D do banco (Prisma/Neon)
   ============================================================ */

type Field = {
  name: string;
  type: string;
  pk?: boolean;
  fk?: boolean;
  unique?: boolean;
};
type Table = {
  id: string;
  group: GroupKey;
  pos: [number, number, number];
  desc: string;
  fields: Field[];
};
type GroupKey = "core" | "auth" | "catalog" | "collection" | "trade";

const GROUPS: Record<GroupKey, { color: string; label: string }> = {
  core: { color: "#ff385c", label: "Núcleo / Conta" },
  auth: { color: "#22d3ee", label: "Autenticação (Auth.js)" },
  catalog: { color: "#34d399", label: "Catálogo (álbuns)" },
  collection: { color: "#c084fc", label: "Coleção do usuário" },
  trade: { color: "#ff8a00", label: "Trocas / Encontros" },
};

const TABLES: Table[] = [
  {
    id: "User",
    group: "core",
    pos: [0, 0, 0],
    desc: "Pessoa cadastrada. Guarda perfil, plano, trial e dados do Stripe.",
    fields: [
      { name: "id", type: "String", pk: true },
      { name: "name", type: "String?" },
      { name: "email", type: "String?", unique: true },
      { name: "image", type: "String?" },
      { name: "city", type: "String?" },
      { name: "phone", type: "String?" },
      { name: "plan", type: "Plan" },
      { name: "trialEndsAt", type: "DateTime?" },
      { name: "stripeCustomerId", type: "String?", unique: true },
      { name: "stripeSubscriptionId", type: "String?", unique: true },
      { name: "stripeCurrentPeriodEnd", type: "DateTime?" },
    ],
  },
  {
    id: "Account",
    group: "auth",
    pos: [-11, 4.5, -3],
    desc: "Provedor OAuth (Google) vinculado ao usuário.",
    fields: [
      { name: "id", type: "String", pk: true },
      { name: "userId", type: "String", fk: true },
      { name: "provider", type: "String" },
      { name: "providerAccountId", type: "String" },
      { name: "type", type: "String" },
      { name: "…tokens", type: "String?" },
    ],
  },
  {
    id: "Session",
    group: "auth",
    pos: [-11, -4.5, 1.5],
    desc: "Sessão de login ativa do usuário.",
    fields: [
      { name: "id", type: "String", pk: true },
      { name: "sessionToken", type: "String", unique: true },
      { name: "userId", type: "String", fk: true },
      { name: "expires", type: "DateTime" },
    ],
  },
  {
    id: "VerificationToken",
    group: "auth",
    pos: [-13.5, 0, 5.5],
    desc: "Token de verificação (magic link por e-mail).",
    fields: [
      { name: "identifier", type: "String" },
      { name: "token", type: "String", unique: true },
      { name: "expires", type: "DateTime" },
    ],
  },
  {
    id: "Album",
    group: "catalog",
    pos: [11, 5, -2.5],
    desc: "Catálogo de álbuns (Copa, Brasileirão, etc.). Seedado.",
    fields: [
      { name: "id", type: "String", pk: true },
      { name: "name", type: "String" },
      { name: "total", type: "Int" },
      { name: "emoji", type: "String" },
    ],
  },
  {
    id: "Sticker",
    group: "catalog",
    pos: [13.5, -1.5, 3.5],
    desc: "Figurinha do catálogo (número, nome, raridade). Seedada.",
    fields: [
      { name: "id", type: "String", pk: true },
      { name: "albumId", type: "String", fk: true },
      { name: "number", type: "Int" },
      { name: "name", type: "String" },
      { name: "rarity", type: "Rarity" },
    ],
  },
  {
    id: "Collection",
    group: "collection",
    pos: [3.5, -6.5, 4.5],
    desc: "O 'meu álbum' do usuário num álbum específico.",
    fields: [
      { name: "id", type: "String", pk: true },
      { name: "userId", type: "String", fk: true },
      { name: "albumId", type: "String", fk: true },
      { name: "lastPackAt", type: "DateTime?" },
      { name: "packsOpened", type: "Int" },
    ],
  },
  {
    id: "StickerOwnership",
    group: "collection",
    pos: [11.5, -6.5, 7.5],
    desc: "Estado de cada figurinha na coleção: tem? quantas repetidas?",
    fields: [
      { name: "id", type: "String", pk: true },
      { name: "collectionId", type: "String", fk: true },
      { name: "stickerId", type: "String", fk: true },
      { name: "number", type: "Int" },
      { name: "have", type: "Boolean" },
      { name: "repeated", type: "Int" },
    ],
  },
  {
    id: "Meetup",
    group: "trade",
    pos: [1.5, 7.5, 4.5],
    desc: "Encontro de troca marcado entre dois colecionadores.",
    fields: [
      { name: "id", type: "String", pk: true },
      { name: "ownerId", type: "String", fk: true },
      { name: "partnerId", type: "String?", fk: true },
      { name: "city", type: "String" },
      { name: "point", type: "String" },
      { name: "day", type: "String" },
      { name: "giveNumbers", type: "Int[]" },
      { name: "getNumbers", type: "Int[]" },
      { name: "status", type: "String" },
    ],
  },
];

type Relation = { from: string; to: string; label: string; optional?: boolean };
const RELATIONS: Relation[] = [
  { from: "Account", to: "User", label: "userId" },
  { from: "Session", to: "User", label: "userId" },
  { from: "Collection", to: "User", label: "userId" },
  { from: "Collection", to: "Album", label: "albumId" },
  { from: "Sticker", to: "Album", label: "albumId" },
  { from: "StickerOwnership", to: "Collection", label: "collectionId" },
  { from: "StickerOwnership", to: "Sticker", label: "stickerId" },
  { from: "Meetup", to: "User", label: "ownerId" },
  { from: "Meetup", to: "User", label: "partnerId", optional: true },
];

const byId = (id: string) => TABLES.find((t) => t.id === id)!;

/* Desenha o card da tabela num canvas → vira textura do sprite */
function makeTableTexture(table: Table) {
  const color = GROUPS[table.group].color;
  const S = 2; // supersampling
  const W = 320;
  const headerH = 46;
  const rowH = 26;
  const padB = 12;
  const H = headerH + table.fields.length * rowH + padB;

  const canvas = document.createElement("canvas");
  canvas.width = W * S;
  canvas.height = H * S;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(S, S);

  // fundo
  roundRect(ctx, 0, 0, W, H, 14);
  ctx.fillStyle = "rgba(13,18,33,0.96)";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.stroke();

  // header
  ctx.save();
  roundRect(ctx, 0, 0, W, headerH, 14);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, headerH);
  ctx.restore();
  ctx.fillStyle = "#0d1221";
  ctx.font = "700 22px Inter, system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(table.id, 16, headerH / 2 + 1);

  // rows
  table.fields.forEach((f, i) => {
    const y = headerH + i * rowH + rowH / 2;
    if (i % 2 === 1) {
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fillRect(0, headerH + i * rowH, W, rowH);
    }
    // badge
    let badge = "";
    let badgeColor = "";
    if (f.pk) { badge = "PK"; badgeColor = "#ff385c"; }
    else if (f.fk) { badge = "FK"; badgeColor = "#22d3ee"; }
    else if (f.unique) { badge = "U"; badgeColor = "#34d399"; }
    ctx.font = "600 14px Inter, system-ui, sans-serif";
    let x = 16;
    if (badge) {
      ctx.fillStyle = badgeColor;
      ctx.fillRect(x, y - 8, badge.length > 1 ? 22 : 14, 16);
      ctx.fillStyle = "#0d1221";
      ctx.font = "700 11px Inter, sans-serif";
      ctx.fillText(badge, x + 2, y + 1);
      x += badge.length > 1 ? 30 : 22;
    }
    ctx.fillStyle = "#e8eaf0";
    ctx.font = "600 15px Inter, sans-serif";
    ctx.fillText(f.name, x, y);
    ctx.fillStyle = "#7c8bb0";
    ctx.font = "500 14px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(f.type, W - 14, y);
    ctx.textAlign = "left";
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.minFilter = THREE.LinearFilter;
  return { tex, aspect: W / H };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function ModeloDeDados() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const apiRef = useRef<{ highlight: (id: string | null) => void; focus: (id: string | null) => void } | null>(null);
  const selectRef = useRef<(id: string | null) => void>(() => {});
  selectRef.current = (id) => setSelected(id);

  useEffect(() => {
    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070a13, 0.012);

    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 34);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 6;
    controls.maxDistance = 80;

    // luzes (sutil, sprites usam material básico)
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    // estrelas de fundo
    const starGeo = new THREE.BufferGeometry();
    const starCount = 600;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 160;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 160;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 160;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x3a4a6e, size: 0.18, transparent: true, opacity: 0.7 })));

    // nós (sprites)
    const sprites: THREE.Sprite[] = [];
    const spriteById = new Map<string, THREE.Sprite>();
    TABLES.forEach((t) => {
      const { tex, aspect } = makeTableTexture(t);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(mat);
      const w = 5.2;
      sprite.scale.set(w, w / aspect, 1);
      sprite.position.set(...t.pos);
      sprite.userData = { id: t.id, baseScale: new THREE.Vector2(w, w / aspect) };
      scene.add(sprite);
      sprites.push(sprite);
      spriteById.set(t.id, sprite);
    });

    // arestas (relações)
    type Edge = { line: THREE.Line; from: string; to: string };
    const edges: Edge[] = [];
    RELATIONS.forEach((r) => {
      const a = byId(r.from).pos;
      const b = byId(r.to).pos;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...a),
        new THREE.Vector3(...b),
      ]);
      const col = new THREE.Color(GROUPS[byId(r.from).group].color);
      const mat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.28 });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      edges.push({ line, from: r.from, to: r.to });
    });

    // raycaster
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered: THREE.Sprite | null = null;
    let downXY = { x: 0, y: 0 };

    function setPointer(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    function onMove(e: PointerEvent) {
      setPointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(sprites)[0];
      const s = (hit?.object as THREE.Sprite) || null;
      if (s !== hovered) {
        hovered = s;
        renderer.domElement.style.cursor = s ? "pointer" : "grab";
      }
    }
    function onDown(e: PointerEvent) { downXY = { x: e.clientX, y: e.clientY }; }
    function onUp(e: PointerEvent) {
      if (Math.abs(e.clientX - downXY.x) > 5 || Math.abs(e.clientY - downXY.y) > 5) return; // foi drag
      setPointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(sprites)[0];
      const id = hit ? (hit.object.userData.id as string) : null;
      selectRef.current(id);
    }
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    // foco de câmera
    let focusTarget: THREE.Vector3 | null = null;
    let focusCamPos: THREE.Vector3 | null = null;
    apiRef.current = {
      highlight(id) {
        const connected = new Set<string>();
        if (id) {
          connected.add(id);
          RELATIONS.forEach((r) => {
            if (r.from === id) connected.add(r.to);
            if (r.to === id) connected.add(r.from);
          });
        }
        sprites.forEach((s) => {
          const sid = s.userData.id as string;
          (s.material as THREE.SpriteMaterial).opacity = !id || connected.has(sid) ? 1 : 0.18;
        });
        edges.forEach((ed) => {
          const on = !id || ed.from === id || ed.to === id;
          const m = ed.line.material as THREE.LineBasicMaterial;
          m.opacity = id ? (on ? 0.95 : 0.05) : 0.28;
        });
      },
      focus(id) {
        if (!id) { focusTarget = null; focusCamPos = null; return; }
        const p = new THREE.Vector3(...byId(id).pos);
        focusTarget = p.clone();
        const dir = new THREE.Vector3().subVectors(camera.position, p).normalize();
        focusCamPos = p.clone().add(dir.multiplyScalar(13));
      },
    };

    function onResize() {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }
    window.addEventListener("resize", onResize);

    let raf = 0;
    const clock = new THREE.Clock();
    function animate() {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      // leve respiração nos nós (escala) + hover
      sprites.forEach((s) => {
        const base = s.userData.baseScale as THREE.Vector2;
        const k = (s === hovered ? 1.12 : 1) + Math.sin(t * 1.5 + s.position.x) * 0.012;
        s.scale.set(base.x * k, base.y * k, 1);
      });
      if (focusTarget && focusCamPos) {
        controls.target.lerp(focusTarget, 0.08);
        camera.position.lerp(focusCamPos, 0.08);
        if (camera.position.distanceTo(focusCamPos) < 0.15) { focusTarget = null; focusCamPos = null; }
      }
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  // aplica highlight + foco quando muda a seleção
  useEffect(() => {
    apiRef.current?.highlight(selected);
    apiRef.current?.focus(selected);
  }, [selected]);

  const sel = selected ? byId(selected) : null;
  const relOut = selected ? RELATIONS.filter((r) => r.from === selected) : [];
  const relIn = selected ? RELATIONS.filter((r) => r.to === selected) : [];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#070a13]">
      <div ref={mountRef} className="absolute inset-0" />

      {/* Cabeçalho */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between p-5">
        <div className="pointer-events-auto">
          <a href="/" className="font-display text-sm font-bold text-white/60 hover:text-white">← Figura Certa</a>
          <h1 className="mt-1 font-display text-2xl font-black text-white">
            Modelo de dados <span className="text-[#ff385c]">em 3D</span>
          </h1>
          <p className="mt-1 max-w-md text-xs text-white/50">
            Arraste pra girar · scroll pra zoom · clique numa tabela pra dar drill-down e ver os relacionamentos.
          </p>
        </div>
        {/* Legenda */}
        <div className="pointer-events-auto rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur">
          {Object.entries(GROUPS).map(([k, g]) => (
            <div key={k} className="flex items-center gap-2 py-0.5 text-xs text-white/70">
              <span className="h-3 w-3 rounded-full" style={{ background: g.color }} />
              {g.label}
            </div>
          ))}
          <div className="mt-2 flex flex-wrap gap-2 border-t border-white/10 pt-2 text-[10px] text-white/50">
            <span><b className="text-[#ff385c]">PK</b> chave</span>
            <span><b className="text-[#22d3ee]">FK</b> relação</span>
            <span><b className="text-[#34d399]">U</b> único</span>
          </div>
        </div>
      </div>

      {/* Painel de drill-down */}
      {sel && (
        <div className="absolute right-5 top-32 max-h-[70vh] w-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1221]/95 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: GROUPS[sel.group].color }} />
              <h2 className="font-display text-xl font-bold text-white">{sel.id}</h2>
            </div>
            <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white">✕</button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/50">{sel.desc}</p>

          <h3 className="mt-4 text-[11px] font-bold uppercase tracking-wider text-white/40">Campos</h3>
          <ul className="mt-2 space-y-1">
            {sel.fields.map((f) => (
              <li key={f.name} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-1.5">
                  {f.pk && <b className="rounded bg-[#ff385c] px-1 text-[10px] text-black">PK</b>}
                  {f.fk && <b className="rounded bg-[#22d3ee] px-1 text-[10px] text-black">FK</b>}
                  {f.unique && !f.pk && <b className="rounded bg-[#34d399] px-1 text-[10px] text-black">U</b>}
                  <span className="text-white/90">{f.name}</span>
                </span>
                <span className="text-xs text-white/40">{f.type}</span>
              </li>
            ))}
          </ul>

          {(relOut.length > 0 || relIn.length > 0) && (
            <>
              <h3 className="mt-4 text-[11px] font-bold uppercase tracking-wider text-white/40">Relacionamentos</h3>
              <div className="mt-2 space-y-1.5 text-xs">
                {relOut.map((r, i) => (
                  <button key={`o${i}`} onClick={() => setSelected(r.to)} className="block w-full rounded-lg bg-white/5 px-2.5 py-1.5 text-left text-white/80 hover:bg-white/10">
                    <span className="text-[#22d3ee]">{sel.id}.{r.label}</span> → <b>{r.to}</b>{r.optional ? " (opcional)" : ""}
                  </button>
                ))}
                {relIn.map((r, i) => (
                  <button key={`i${i}`} onClick={() => setSelected(r.from)} className="block w-full rounded-lg bg-white/5 px-2.5 py-1.5 text-left text-white/80 hover:bg-white/10">
                    <b>{r.from}</b>.<span className="text-[#22d3ee]">{r.label}</span> → {sel.id}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Rodapé */}
      <div className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-[11px] text-white/30">
        {TABLES.length} tabelas · {RELATIONS.length} relações · banco PostgreSQL (Neon)
      </div>
    </div>
  );
}
