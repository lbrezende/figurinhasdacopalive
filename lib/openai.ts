// Integração com a OpenAI via REST (fetch) — sem SDK pra não inchar o bundle.
// Lazy: a chave só é lida em runtime (não quebra o build sem OPENAI_API_KEY).

const API = "https://api.openai.com/v1";

// Modelos configuráveis por env, com defaults sensatos.
export const VISION_MODEL = process.env.OPENAI_VISION_MODEL || "gpt-4o";
export const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini";
export const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1";

function apiKey(): string {
  const k = process.env.OPENAI_API_KEY;
  if (!k) throw new Error("OPENAI_API_KEY não configurada");
  return k;
}

/** Transcreve áudio (pt-BR) → texto. */
export async function transcribe(buffer: Buffer, filename: string, mimetype: string): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mimetype }), filename);
  form.append("model", TRANSCRIBE_MODEL);
  form.append("language", "pt");
  const res = await fetch(`${API}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}` },
    body: form,
  });
  if (!res.ok) throw new Error(`OpenAI transcrição ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { text?: string };
  return json.text ?? "";
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | Array<Record<string, unknown>>;
};

/** Chat completions forçando saída JSON. Retorna o objeto já parseado. */
export async function chatJSON(model: string, messages: ChatMessage[]): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature: 0,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI chat ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return {};
  }
}
