import Link from "next/link";
import { Activity, HeartHandshake } from "lucide-react";
import type { ReactNode } from "react";

export function PublicShell({ children, showFooter = true, customFooter }: { children: ReactNode; showFooter?: boolean; customFooter?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-landing-canvas text-med-ink">
      <a className="sr-only rounded-med-sm bg-med-accent px-4 py-3 text-med-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50" href="#main-content">
        Skip to main content
      </a>
      <header className="fixed inset-x-0 top-5 z-30 px-4">
        <div className="mx-auto flex h-12 w-full max-w-3xl items-center justify-between gap-5 rounded-[15px] border border-landing-line bg-landing-surface/95 px-3 shadow-landing-nav backdrop-blur-md sm:px-4">
          <Link className="flex min-h-11 items-center gap-2.5 rounded-med-sm text-med-ink outline-none focus-visible:ring-3 focus-visible:ring-med-accent/25" href="/" aria-label="Medrush home">
            <span className="grid size-7 place-items-center rounded-[8px] bg-landing-ink text-landing-surface">
              <Activity aria-hidden="true" size={16} strokeWidth={2.5} />
            </span>
            <strong className="text-base tracking-[-0.04em] text-landing-ink">Medrush</strong>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Public navigation">
            <Link className="hidden min-h-9 items-center rounded-[9px] px-3 text-xs font-medium text-landing-body transition-colors duration-[var(--med-motion-base)] hover:bg-landing-canvas hover:text-landing-ink focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-landing-blue/25 sm:inline-flex" href="/#how-it-works">
              How it works
            </Link>
            <Link className="inline-flex min-h-9 items-center gap-2 rounded-[9px] bg-landing-ink px-3.5 text-xs font-bold text-landing-surface transition-transform duration-[var(--med-motion-base)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-landing-blue/30" href="/fund/contribute">
              <HeartHandshake aria-hidden="true" className="hidden sm:block" size={14} /> Community fund
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1" id="main-content">{children}</main>

      {customFooter ?? (showFooter && <footer className="border-t border-med-border bg-med-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8 text-sm text-med-body sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-med-ink"><Activity aria-hidden="true" size={17} /> medrush</div>
            <p className="mt-2 max-w-xl leading-6">This demonstration does not contact emergency services, ambulance drivers, or hospitals. For a real emergency, call your local emergency number.</p>
          </div>
          <p className="text-med-muted">Akwa Ibom emergency support concept</p>
        </div>
      </footer>)}
    </div>
  );
}
