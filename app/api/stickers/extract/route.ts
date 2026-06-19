import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth-helpers";
import { transcribe, chatJSON, VISION_MODEL, TEXT_MODEL, type ChatMessage } from "@/lib/openai";
import { TEAMS } from "@/lib/teams";

// Vision + transcrição podem passar dos 10s default da Vercel.
export const maxDuration = 60;

function teamList(): string {
  return Object.entries(TEAMS)
    .map(([code, t]) => `${code}=${t.name}`)
    .join(", ");
}

const SYSTEM = `Você identifica figurinhas do álbum da Copa do Mundo 2026 (Panini).
Cada figurinha tem um CÓDIGO = sigla de 3 letras da seleção + número (ex: ARG17, BRA10).
As figurinhas especiais/do torneio usam a sigla FWC (ex: FWC2); a logo da Panini é "00".
Seleções válidas (SIGLA=Nome, aceite nomes em português, inglês ou espanhol): ${teamList()}.
Responda SOMENTE com JSON no formato {"codes":["ARG17","BRA10"]}. Sem texto extra.
Se nada for identificável, responda {"codes":[]}.`;

function codesFrom(out: Record<string, unknown>): string[] {
  const raw = out.codes;
  if (!Array.isArray(raw)) return [];
  return raw.map((c) => String(c).trim()).filter(Boolean);
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "esperado multipart/form-data" }, { status: 400 });
  }
  const kind = form.get("kind");

  try {
    if (kind === "audio") {
      const file = form.get("audio");
      if (!(file instanceof File)) return NextResponse.json({ error: "áudio ausente" }, { status: 400 });
      const buf = Buffer.from(await file.arrayBuffer());
      const transcript = await transcribe(buf, file.name || "audio.webm", file.type || "audio/webm");
      const messages: ChatMessage[] = [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `O usuário ditou as figurinhas que possui. Transcrição: "${transcript}". Extraia os códigos.`,
        },
      ];
      const out = await chatJSON(TEXT_MODEL, messages);
      return NextResponse.json({ codes: codesFrom(out), transcript });
    }

    if (kind === "image") {
      const file = form.get("image");
      if (!(file instanceof File)) return NextResponse.json({ error: "imagem ausente" }, { status: 400 });
      const buf = Buffer.from(await file.arrayBuffer());
      const dataUrl = `data:${file.type || "image/jpeg"};base64,${buf.toString("base64")}`;
      const messages: ChatMessage[] = [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identifique todas as figurinhas visíveis nesta foto. Para cada uma, leia a sigla de 3 letras (país) e o número, e gere o código.",
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ];
      const out = await chatJSON(VISION_MODEL, messages);
      return NextResponse.json({ codes: codesFrom(out) });
    }

    return NextResponse.json({ error: "kind inválido (use audio|image)" }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "falha ao processar";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
