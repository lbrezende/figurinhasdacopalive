import { NextResponse } from "next/server";

// Proxy para a Google Places API (New). Mantém a chave secreta no servidor.
// - GET /api/places?q=texto[&session=token]  → lista de sugestões de endereço
// - GET /api/places?id=placeId[&session=token] → coordenadas (lat/lng) do lugar
//
// Requer a env var GOOGLE_MAPS_API_KEY (server-only, sem prefixo NEXT_PUBLIC).

export const runtime = "nodejs";

const KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(req: Request) {
  if (!KEY) {
    return NextResponse.json(
      { error: "GOOGLE_MAPS_API_KEY não configurada" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const id = searchParams.get("id");
  const session = searchParams.get("session") ?? undefined;

  try {
    // --- Detalhes do lugar: resolve placeId → coordenadas ---
    if (id) {
      const r = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`,
        {
          headers: {
            "X-Goog-Api-Key": KEY,
            "X-Goog-FieldMask": "location,formattedAddress",
            ...(session ? { "X-Goog-Session-Token": session } : {}),
          },
        },
      );
      const j = await r.json();
      if (!r.ok || !j.location) {
        return NextResponse.json({ error: "Lugar não encontrado" }, { status: 404 });
      }
      return NextResponse.json({
        lat: j.location.latitude,
        lng: j.location.longitude,
        address: j.formattedAddress ?? null,
      });
    }

    // --- Autocomplete: texto → sugestões ---
    if (q && q.trim().length >= 3) {
      const r = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": KEY,
        },
        body: JSON.stringify({
          input: q,
          languageCode: "pt-BR",
          regionCode: "BR",
          ...(session ? { sessionToken: session } : {}),
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        return NextResponse.json({ error: j.error?.message ?? "Erro" }, { status: r.status });
      }
      const suggestions = (j.suggestions ?? [])
        .filter((s: { placePrediction?: unknown }) => s.placePrediction)
        .map((s: { placePrediction: { placeId: string; text: { text: string } } }) => ({
          placeId: s.placePrediction.placeId,
          description: s.placePrediction.text.text,
        }));
      return NextResponse.json({ suggestions });
    }

    return NextResponse.json({ suggestions: [] });
  } catch {
    return NextResponse.json({ error: "Falha ao consultar o Google" }, { status: 502 });
  }
}
