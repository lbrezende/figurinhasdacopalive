"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "live-reminder-proxima-live-dismissed";

const TOPICS = [
  {
    icon: "🤖",
    title: "API da OpenAI",
    desc: "Identificar figurinhas a partir de uma foto.",
  },
  {
    icon: "📍",
    title: "API do Google Maps",
    desc: "Autocomplete e validação de endereço.",
  },
  {
    icon: "🎨",
    title: "Design System & Storybook",
    desc: "Componentizar e documentar a UI.",
  },
];

export function LiveReminderModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY) !== "1") {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function close() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-reminder-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-hairline bg-canvas p-8 shadow-[var(--shadow-airbnb-lg)] sm:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fechar lembrete"
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-surface-soft hover:text-ink"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary">
          🔴 Lembrete da próxima live
        </span>

        <h2
          id="live-reminder-title"
          className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl"
        >
          Próxima live vamos falar sobre
        </h2>

        <ul className="mt-8 space-y-4">
          {TOPICS.map((t) => (
            <li key={t.title} className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-2xl">
                {t.icon}
              </span>
              <div>
                <p className="text-lg font-semibold text-ink">{t.title}</p>
                <p className="leading-relaxed text-muted">{t.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={close}
          className="mt-10 w-full rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-on-primary transition hover:bg-primary-active"
        >
          Já vi, pode fechar
        </button>
      </div>
    </div>
  );
}
