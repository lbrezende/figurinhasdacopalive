"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

type Counts = { have: number; miss: number; rep: number; total: number; pct: number };
type Busy = null | "add" | "voice" | "photo";

export function AddStickersCard({ onAdded }: { onAdded?: (counts: Counts) => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function appendCodes(codes: string[]) {
    const joined = codes.join(", ");
    setText((prev) => (prev.trim() ? `${prev.trim()}, ${joined}` : joined));
  }

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
      const codes: string[] = r.codes ?? [];
      if (!codes.length) {
        toast("Não identifiquei figurinhas na fala");
        return;
      }
      appendCodes(codes);
      toast(`Ouvi: ${codes.join(", ")} 🎤`);
    } catch {
      toast("Falha ao processar o áudio");
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
      appendCodes(codes);
      toast(`Li ${codes.length} figurinha${codes.length > 1 ? "s" : ""} da foto 📸`);
    } catch {
      toast("Falha ao processar a foto");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-hairline bg-canvas p-5">
      <div className="flex items-center gap-4">
        <div className="text-4xl">➕</div>
        <div className="flex-1">
          <h3 className="font-bold text-ink">Adicionar figurinhas</h3>
          <p className="text-xs text-muted">
            Digite os códigos (ex: <b className="text-body">ARG17, BRA10</b>), dite por voz 🎤 ou envie uma foto 📸.
          </p>
        </div>
      </div>

      {/* campo de texto + microfone */}
      <div className="relative mt-3">
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
          disabled={busy === "add" || busy === "photo"}
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

      {/* ações */}
      <div className="mt-3 flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={!!busy}
          className="flex items-center gap-1.5 rounded-lg border border-hairline bg-surface-soft px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface-strong disabled:opacity-50"
        >
          {busy === "photo" ? "Lendo foto…" : "📷 Enviar foto"}
        </button>
        <button
          type="button"
          onClick={add}
          disabled={!!busy}
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
