import Link from "next/link";
import { hasAccess, type SubscriptionUser } from "@/lib/subscription";

// Bloqueia o conteúdo quando o usuário não tem acesso (trial expirado e sem PRO).
export function PaywallGate({
  user,
  children,
}: {
  user: SubscriptionUser;
  children: React.ReactNode;
}) {
  if (hasAccess(user)) return <>{children}</>;

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-[#ffd23f]/25 bg-gradient-to-b from-[#ffd23f]/10 to-transparent p-8 text-center">
      <div className="text-4xl">🔒</div>
      <h2 className="mt-3 font-display text-2xl font-bold">Seu período grátis terminou</h2>
      <p className="mt-2 text-sm text-muted">
        Assine o PRO pra continuar montando seu álbum e fechando trocas na sua cidade.
      </p>
      <Link
        href="/settings/billing"
        className="mt-6 block rounded-xl bg-gradient-to-br from-[#ffd23f] to-[#ff8a00] px-8 py-4 font-display font-bold text-[#0d0903] transition hover:-translate-y-0.5"
      >
        Assinar o PRO
      </Link>
    </div>
  );
}
