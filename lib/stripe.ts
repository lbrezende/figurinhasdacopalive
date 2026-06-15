import Stripe from "stripe";

// Lazy init via Proxy: o client só é criado no primeiro uso em runtime.
// Evita quebrar o build quando STRIPE_SECRET_KEY ainda não está configurada.
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY não configurada");
    // apiVersion omitido de propósito: usa o default do SDK instalado.
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
