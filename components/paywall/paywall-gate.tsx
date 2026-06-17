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
    <div className="mx-auto max-w-md rounded-2xl border border-hairline bg-canvas p-8 text-center shadow-[var(--shadow-airbnb)]">
      <div className="text-4xl">🔒</div>
      <h2 className="mt-3 text-2xl font-bold text-ink">Seu período grátis terminou</h2>
      <p className="mt-2 text-sm text-muted">
        Assine o PRO pra continuar montando seu álbum e fechando trocas na sua cidade.
      </p>
      <Link
        href="/settings/billing"
        className="mt-6 block rounded-lg bg-primary px-8 py-3.5 font-semibold text-on-primary transition hover:bg-primary-active"
      >
        Assinar o PRO
      </Link>
    </div>
  );
}
