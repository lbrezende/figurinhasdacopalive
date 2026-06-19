"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

type Counts = { have: number; miss: number; rep: number; total: number; pct: number };
type Busy = null | "add" | "voice" | "photo" | "reextract";

/** Junta tokens existentes + novos, removendo duplicados (ARG 17 == arg17). */
function mergeCodes(existing: string, add: string[]): string {
  const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const out: string[] = [];
  const seen = new Set<string>();
  for (const tok of [...existing.split(/[\n,;]+/), ...add]) {
    const t = tok.trim();
    if (!t) continue;
    const k = norm(t);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out.join(", ");
}

export function AddStickersCard({ onAdded }: { onAdded?: (counts: Counts) => void }) {
  const [text, setText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ---------- adicionar ao álbum ---------- */
  async function add() {
    const value = text.trim();
    if (!value) {
      toast("Digite, dite ou fotografe as figurinhas primeiro");
      return;
    }
    setBusy("add");
    try {
      const r = await fetch("/api/stickers/add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: value }),
      }).then((res) => res.json());
      if (r.error) {
        toast(`Erro: ${r.error}`);
        return;
      }
      const a = r.added?.length ?? 0;
      const rep = r.repeated?.length ?? 0;
      const nf: string[] = r.notFound ?? [];
      const parts: string[] = [];
      if (a) parts.push(`${a} nova${a > 1 ? "s" : ""}`);
      if (rep) parts.push(`${rep} repetida${rep > 1 ? "s" : ""}`);
      toast(parts.length ? `Adicionado: ${parts.join(" · ")} ✅` : "Nada novo pra adicionar");
      if (nf.length) toast(`Não reconheci: ${nf.join(", ")}`);
      setText("");
      setTranscript("");
      if (r.counts) onAdded?.(r.counts);
    } catch {
      toast("Falha ao adicionar");
    } finally {
      setBusy(null);
    }
  }

  /* ---------- voz (microfone) ---------- */
  async function toggleRecord() {
    if (recording) {
      mediaRef.current?.stop();
      return;
    }
    if (busy) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        await sendAudio(blob);
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      toast("Não consegui acessar o microfone 🎤");
    }
  }

  async function sendAudio(blob: Blob) {
    setBusy("voice");
    try {
      const form = new FormData();
      form.append("kind", "audio");
      form.append("audio", blob, "audio.webm");
      const r = await fetch("/api/stickers/extract", { method: "POST", body: form }).then((res) => res.json());
      if (r.error) {
        toast(`Erro: ${r.error}`);
        return;
      }
      setTranscript(r.transcript ?? "");
      const codes: string[] = r.codes ?? [];
      setText((prev) => mergeCodes(prev, codes));
      if (!codes.length) toast("Transcrevi, mas não identifiquei figurinhas. Edite o texto e re-extraia. ✍️");
      else toast(`Identifiquei ${codes.length} figurinha${codes.length > 1 ? "s" : ""} 🎤`);
    } catch {
      toast("Falha ao processar o áudio");
    } finally {
      setBusy(null);
    }
  }

  /** Re-extrai os códigos a partir da transcrição editada (substitui a lista). */
  async function reextract() {
    const value = transcript.trim();
    if (!value) return;
    setBusy("reextract");
    try {
      const form = new FormData();
      form.append("kind", "text");
      form.append("transcript", value);
      const r = await fetch("/api/stickers/extract", { method: "POST", body: form }).then((res) => res.json());
      if (r.error) {
        toast(`Erro: ${r.error}`);
        return;
      }
      const codes: string[] = r.codes ?? [];
      setText(mergeCodes("", codes));
      toast(codes.length ? `Re-extraído: ${codes.join(", ")} ✅` : "Não identifiquei figurinhas no texto");
    } catch {
      toast("Falha ao re-extrair");
    } finally {
      setBusy(null);
    }
  }

  /* ---------- foto ---------- */
  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("photo");
    try {
      const form = new FormData();
      form.append("kind", "image");
      form.append("image", file);
      const r = await fetch("/api/stickers/extract", { method: "POST", body: form }).then((res) => res.json());
      if (r.error) {
        toast(`Erro: ${r.error}`);
        return;
      }
      const codes: string[] = r.codes ?? [];
      if (!codes.length) {
        toast("Não encontrei códigos na foto 📸");
        return;
      }
      setText((prev) => mergeCodes(prev, codes));
      toast(`Li ${codes.length} figurinha${codes.length > 1 ? "s" : ""} da foto 📸`);
    } catch {
      toast("Falha ao processar a foto");
    } finally {
      setBusy(null);
    }
  }

  const anyBusy = !!busy;

  return (
    <div className="rounded-2xl border border-hairline bg-canvas p-5">
      <div className="flex items-center gap-4">
        <div className="text-4xl">➕</div>
        <div className="flex-1">
          <h3 className="font-bold text-ink">Adicionar figurinhas</h3>
          <p className="text-xs text-muted">
            Dite por voz 🎤, envie uma foto 📸 ou digite os códigos (ex: <b className="text-body">ARG17, BRA10</b>).
          </p>
        </div>
      </div>

      {/* ---- Transcrição (aparece após gravar) ---- */}
      {transcript && (
        <div className="mt-4 rounded-xl border border-hairline bg-surface-soft p-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wide text-muted">🎤 Transcrição</label>
            <button
              type="button"
              onClick={() => setTranscript("")}
              className="text-xs text-muted underline hover:text-ink"
            >
              descartar
            </button>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={2}
            placeholder="O que você falou aparece aqui…"
            className="mt-2 w-full resize-none rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-ink"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[11px] text-muted">Corrigiu algum número? Re-extraia a lista do texto.</p>
            <button
              type="button"
              onClick={reextract}
              disabled={anyBusy}
              className="shrink-0 rounded-lg bg-surface-strong px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white disabled:opacity-50"
            >
              {busy === "reextract" ? "Re-extraindo…" : "↻ Re-extrair"}
            </button>
          </div>
        </div>
      )}

      {/* ---- Figurinhas identificadas (campo editável) + microfone ---- */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wide text-muted">Figurinhas identificadas</label>
          {text.trim() && (
            <button type="button" onClick={() => setText("")} className="text-xs text-muted underline hover:text-ink">
              limpar
            </button>
          )}
        </div>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="ARG17, BRA10, FWC2…"
            className="w-full resize-none rounded-xl border border-hairline bg-surface-soft px-3 py-2.5 pr-14 text-sm text-ink outline-none focus:border-ink placeholder:text-muted-soft"
          />
          <button
            type="button"
            onClick={toggleRecord}
            disabled={busy === "add" || busy === "photo" || busy === "reextract"}
            title={recording ? "Parar e processar" : "Ditar por voz"}
            aria-label={recording ? "Parar gravação" : "Ditar por voz"}
            className={`absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full transition disabled:opacity-40 ${
              recording
                ? "animate-pulse bg-primary text-on-primary"
                : "bg-surface-strong text-ink hover:bg-ink hover:text-white"
            }`}
          >
            {busy === "voice" ? <Spinner /> : <MicIcon />}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-muted">Edite aqui se a IA entendeu algum número errado.</p>
      </div>

      {/* ---- ações ---- */}
      <div className="mt-3 flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={anyBusy}
          className="flex items-center gap-1.5 rounded-lg border border-hairline bg-surface-soft px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface-strong disabled:opacity-50"
        >
          {busy === "photo" ? "Lendo foto…" : "📷 Enviar foto"}
        </button>
        <button
          type="button"
          onClick={add}
          disabled={anyBusy}
          className="ml-auto rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-active disabled:bg-primary-disabled"
        >
          {busy === "add" ? "Adicionando…" : "Adicionar ao álbum"}
        </button>
      </div>

      {recording && (
        <p className="mt-2 text-xs font-semibold text-primary">🎙️ Gravando… toque no microfone de novo para parar.</p>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
