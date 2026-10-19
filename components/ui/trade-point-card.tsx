import Link from "next/link";
import { traderInitials, type TradePoint } from "@/lib/map-points";

/**
 * TradePointCard — cartão (estilo Airbnb) do ponto de troca selecionado no mapa.
 * Lista colecionadores; contatos/WhatsApp só aparecem logado (gate de login).
 */
export function TradePointCard({
  point,
  isLoggedIn,
  wanted = [],
  onClose,
}: {
  point: TradePoint;
  isLoggedIn: boolean;
  wanted?: number[];
  onClose: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-hairline bg-canvas shadow-[var(--shadow-airbnb-lg)]">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-surface-soft text-lg">📍</span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold leading-tight text-ink">{point.name}</h3>
              <p className="truncate text-xs text-muted">{point.area}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-hairline bg-canvas text-muted transition hover:bg-surface-soft hover:text-ink"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 text-xs font-semibold text-body">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {point.traders.length} {point.traders.length === 1 ? "colecionador" : "colecionadores"} aqui
        </div>

        <div className="mt-4 max-h-48 space-y-2.5 overflow-y-auto pr-1">
          {point.traders.map((tr) => (
            <div key={tr.id} className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: tr.color }}>
                {traderInitials(tr)}
              </span>
              <div className="min-w-0 flex-1">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-ink">{tr.name}</span>
                    <a
                      href={`https://wa.me/${tr.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-full bg-[#e7f7ee] px-2.5 py-1 text-xs font-bold text-[#067647] transition hover:bg-[#d3efe0]"
                    >
                      WhatsApp
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="select-none rounded bg-surface-strong px-6 py-0.5 text-xs blur-[4px]" aria-hidden>
                      •••• ••••
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-soft">
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  </div>
                )}
                <div className="mt-0.5 truncate text-xs text-muted">
                  Oferece:{" "}
                  {tr.offers.map((o, i) => (
                    <span key={o} className={wanted.includes(o) ? "font-bold text-primary" : "text-body"}>
                      {o}
                      {i < tr.offers.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-hairline pt-4">
          {isLoggedIn ? (
            <Link href="/app" className="block rounded-xl bg-primary py-3 text-center text-sm font-semibold text-on-primary transition hover:bg-primary-active">
              Abrir meu álbum e marcar troca
            </Link>
          ) : (
            <>
              <Link href="/login?callbackUrl=/" className="block rounded-xl bg-primary py-3 text-center text-sm font-semibold text-on-primary transition hover:bg-primary-active">
                Entrar para ver os contatos
              </Link>
              <p className="mt-2 text-center text-xs text-muted">Grátis · nomes e WhatsApp liberam após o login</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
