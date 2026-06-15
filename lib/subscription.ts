import type { Plan } from "@prisma/client";

// Subconjunto do User necessário para checar acesso (funciona com session ou DB)
export type SubscriptionUser = {
  plan: Plan;
  trialEndsAt?: Date | null;
  stripeCurrentPeriodEnd?: Date | null;
};

const DAY_MS = 1000 * 60 * 60 * 24;

/** Trial ativo: plano TRIAL e ainda dentro dos 14 dias */
export function isTrialActive(user: SubscriptionUser): boolean {
  return (
    user.plan === "TRIAL" &&
    !!user.trialEndsAt &&
    user.trialEndsAt.getTime() > Date.now()
  );
}

/** Assinante pagante: plano PRO e período vigente */
export function isSubscribed(user: SubscriptionUser): boolean {
  return (
    user.plan === "PRO" &&
    !!user.stripeCurrentPeriodEnd &&
    user.stripeCurrentPeriodEnd.getTime() > Date.now()
  );
}

/** Tem acesso ao produto: trial ativo OU assinante */
export function hasAccess(user: SubscriptionUser): boolean {
  return isTrialActive(user) || isSubscribed(user);
}

/** Dias restantes no trial (0 se expirado/sem trial) */
export function daysLeftInTrial(user: SubscriptionUser): number {
  if (user.plan !== "TRIAL" || !user.trialEndsAt) return 0;
  const diff = user.trialEndsAt.getTime() - Date.now();
  return diff > 0 ? Math.ceil(diff / DAY_MS) : 0;
}

/** Limites por plano. TRIAL e PRO = ilimitado; FREE = bloqueado/limitado. */
export const PLAN_LIMITS = {
  FREE: { collections: 1, dailyPacks: 0 },
  TRIAL: { collections: Infinity, dailyPacks: Infinity },
  PRO: { collections: Infinity, dailyPacks: Infinity },
} as const;
