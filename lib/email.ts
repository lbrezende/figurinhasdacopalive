import { Resend } from "resend";

// Lazy init — não instancia no topo pra não quebrar o build sem a chave.
let _resend: Resend | null = null;

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY || process.env.AUTH_RESEND_KEY;
  if (!key) throw new Error("RESEND_API_KEY não configurada");
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

const FROM = "Figura Certa <onboarding@resend.dev>";

export async function sendEmail(to: string, subject: string, html: string) {
  return getResend().emails.send({ from: FROM, to, subject, html });
}
