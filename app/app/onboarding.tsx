"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AlbumOpt = { id: string; name: string; emoji: string; total: number };

export function Onboarding({
  cities,
  albums,
  hasCity,
  defaultCity,
  userName,
}: {
  cities: string[];
  albums: AlbumOpt[];
  hasCity: boolean;
  defaultCity: string;
  userName: string;
}) {
  const router = useRouter();
  const [city, setCity] = useState(defaultCity || cities[0]);
  const [albumId, setAlbumId] = useState(albums[0].id);
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    try {
      if (!hasCity) {
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ city }),
        });
      }
      await fetch("/api/collection", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ albumId }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-canvas px-6 py-10">
      <div className="mb-6 flex items-center gap-2.5 text-lg font-bold text-ink">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-base">⚽</span>
        Figura Certa
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-ink">Bora montar seu álbum{userName ? `, ${userName.split(" ")[0]}` : ""}! 🚀</h1>
      <p className="mt-2 text-muted">Escolha sua cidade (pra achar trocas perto) e o álbum que você coleciona.</p>

      <div className="mt-6 space-y-4 rounded-2xl border border-hairline bg-canvas p-6 shadow-[var(--shadow-airbnb)]">
        {!hasCity && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Sua cidade</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg border border-hairline bg-canvas px-4 py-3 text-sm text-ink outline-none focus:border-ink">
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Álbum</label>
          <select value={albumId} onChange={(e) => setAlbumId(e.target.value)} className="w-full rounded-lg border border-hairline bg-canvas px-4 py-3 text-sm text-ink outline-none focus:border-ink">
            {albums.map((a) => <option key={a.id} value={a.id}>{a.emoji} {a.name} ({a.total})</option>)}
          </select>
        </div>
        <button onClick={start} disabled={loading} className="w-full rounded-lg bg-primary px-6 py-3.5 font-semibold text-on-primary transition hover:bg-primary-active disabled:bg-primary-disabled">
          {loading ? "Criando…" : "Criar meu álbum"}
        </button>
      </div>
    </main>
  );
}
