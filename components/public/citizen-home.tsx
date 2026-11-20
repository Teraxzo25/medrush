"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Activity, Ambulance, ArrowRight, Check, Clock3, HeartHandshake, HeartPulse, Hospital, MapPin, Navigation, Phone, ShieldCheck, SignalLow, Siren } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { buttonVariants } from "@/components/ui/button";
import { ambulances, hospitals } from "@/lib/medrush-data";
import { useDemoWorkspace } from "@/lib/demo-workspace";
import { cn } from "@/lib/utils";

const formatNaira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

const orbitNodes: { icon: LucideIcon; label: string; className: string; iconClassName: string }[] = [
  { icon: Ambulance, label: "Ambulance response", className: "left-[8%] top-[35%]", iconClassName: "text-med-success" },
  { icon: HeartPulse, label: "Clinical support", className: "left-[20%] top-[17%]", iconClassName: "text-med-emergency" },
  { icon: MapPin, label: "Location support", className: "left-[24%] top-[64%]", iconClassName: "text-landing-blue" },
  { icon: Hospital, label: "Hospital network", className: "right-[20%] top-[18%]", iconClassName: "text-med-info" },
  { icon: Navigation, label: "Dispatch route", className: "right-[9%] top-[37%]", iconClassName: "text-landing-blue" },
  { icon: HeartHandshake, label: "Community fund", className: "right-[20%] top-[65%]", iconClassName: "text-med-warning" },
  { icon: Phone, label: "Contact support", className: "left-[4%] top-[58%] hidden lg:grid", iconClassName: "text-med-info" },
  { icon: ShieldCheck, label: "Session privacy", className: "right-[4%] top-[57%] hidden lg:grid", iconClassName: "text-med-success" },
];

function OrbitField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-[49%] size-[clamp(18rem,34vw,30rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-landing-line" />
      <div className="absolute left-1/2 top-[49%] size-[clamp(28rem,48vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-landing-line" />
      <div className="absolute left-1/2 top-[49%] size-[clamp(38rem,62vw,54rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-landing-line" />
      <div className="absolute left-1/2 top-[49%] size-[clamp(48rem,78vw,68rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-landing-line" />
      <div className="absolute left-1/2 top-[49%] size-[clamp(59rem,94vw,82rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-landing-line" />
      <div className="absolute left-1/2 top-[49%] size-[clamp(28rem,48vw,42rem)] -translate-x-1/2 -translate-y-1/2 rotate-[24deg] rounded-full border border-transparent border-r-landing-blue" />
      <div className="absolute left-1/2 top-[49%] size-[clamp(48rem,78vw,68rem)] -translate-x-1/2 -translate-y-1/2 -rotate-[31deg] rounded-full border border-transparent border-l-landing-blue" />
      {orbitNodes.map(({ icon: Icon, label, className, iconClassName }) => (
        <span className={cn("absolute hidden size-11 place-items-center rounded-full border border-landing-line bg-landing-surface shadow-landing sm:grid", className)} title={label} key={label}>
          <Icon className={iconClassName} size={19} strokeWidth={2.1} />
        </span>
      ))}
    </div>
  );
}

function StatusStack() {
  const { ready, citizenRequests } = useDemoWorkspace();
  const request = citizenRequests[0];

  const cards = request ? [
    { icon: Siren, tone: "text-med-emergency", dot: "bg-med-success", title: `${request.id} was recorded`, detail: request.category },
    { icon: MapPin, tone: "text-landing-blue", dot: "bg-med-success", title: "Pickup location saved", detail: request.location },
    { icon: Clock3, tone: "text-med-info", dot: "bg-med-info", title: request.status, detail: "Current demonstration stage" },
  ] : [
    { icon: Ambulance, tone: "text-med-success", dot: "bg-med-success", title: "Response units ready", detail: `${ambulances.filter((item) => item.status === "Available").length} demo ambulances available` },
    { icon: MapPin, tone: "text-landing-blue", dot: "bg-med-success", title: "Location stays flexible", detail: "Use GPS or type a nearby landmark" },
    { icon: ShieldCheck, tone: "text-med-info", dot: "bg-med-info", title: "Session only privacy", detail: "Details clear when this tab closes" },
  ];

  return (
    <div className="relative mx-auto mt-8 h-32 w-full max-w-[23rem]" aria-live="polite" aria-busy={!ready}>
      <span className="absolute left-1/2 top-1/2 h-28 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-landing-blue-soft/80 blur-3xl" aria-hidden="true" />
      {cards.map(({ icon: Icon, tone, dot, title, detail }, index) => (
        <div
          className={cn(
            "absolute left-1/2 flex h-[3.25rem] w-[min(19rem,88vw)] -translate-x-1/2 items-center gap-3 rounded-[10px] border border-landing-line bg-landing-surface px-3 shadow-landing-card transition-opacity duration-[var(--med-motion-base)]",
            index === 0 && "top-0 z-30 -ml-4",
            index === 1 && "top-9 z-20 ml-3",
            index === 2 && "top-[4.5rem] z-10 ml-8 opacity-90",
            !ready && "animate-pulse motion-reduce:animate-none",
          )}
          key={title}
        >
          <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-landing-canvas">
            <Icon className={tone} aria-hidden="true" size={15} />
            <span className={cn("absolute -right-0.5 -top-0.5 size-2 rounded-full ring-2 ring-landing-surface", dot)} />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <strong className="block truncate text-[0.72rem] font-bold text-landing-ink">{ready ? title : "Loading session status"}</strong>
            <small className="mt-0.5 block truncate text-[0.62rem] text-landing-muted">{ready ? detail : "Checking this browser tab"}</small>
          </span>
          <span className="text-[0.56rem] font-medium text-landing-muted">Now</span>
        </div>
      ))}
    </div>
  );
}

function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-landing-line bg-landing-canvas pt-16 sm:pt-20">
      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-2.5 text-landing-ink">
            <span className="grid size-8 place-items-center rounded-[9px] bg-landing-ink text-landing-surface"><Activity aria-hidden="true" size={17} /></span>
            <strong className="text-lg tracking-[-0.04em]">Medrush</strong>
          </div>
          <h2 className="mt-7 max-w-lg text-3xl font-bold leading-tight tracking-[-0.045em] text-landing-ink sm:text-4xl">Clear support for urgent moments.</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-landing-body">A demonstration of simpler emergency coordination, community funding, and visible response status for Akwa Ibom.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:justify-self-end">
          <div>
            <p className="text-xs font-bold text-landing-muted">Explore</p>
            <nav className="mt-4 grid gap-3 text-sm font-bold text-landing-ink" aria-label="Footer navigation">
              <Link className="w-fit outline-none hover:text-landing-blue focus-visible:ring-3 focus-visible:ring-landing-blue/25" href="/sos">Request help now</Link>
              <Link className="w-fit outline-none hover:text-landing-blue focus-visible:ring-3 focus-visible:ring-landing-blue/25" href="/fund/contribute">Community fund</Link>
              <Link className="w-fit outline-none hover:text-landing-blue focus-visible:ring-3 focus-visible:ring-landing-blue/25" href="/payments">Payment center</Link>
            </nav>
          </div>
          <div>
            <p className="text-xs font-bold text-landing-muted">Prototype</p>
            <p className="mt-4 max-w-48 text-sm leading-6 text-landing-body">Uyo, Akwa Ibom<br />Session only demo<br />Not a live emergency service</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-14 flex w-full max-w-7xl flex-col gap-3 border-t border-landing-line px-4 py-5 text-[0.68rem] text-landing-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© 2026 Medrush demonstration</p>
        <p>For a real emergency, call your local emergency number.</p>
      </div>

      <div className="pointer-events-none relative h-[clamp(7rem,18vw,15rem)] select-none overflow-hidden" aria-hidden="true">
        <p className="absolute inset-x-0 bottom-[-0.13em] whitespace-nowrap text-center text-[clamp(7rem,20vw,18rem)] font-bold leading-none tracking-[-0.075em] text-landing-line">MEDRUSH</p>
      </div>
    </footer>
  );
}

export function CitizenHome({ communityFundTotal, confirmedContributionCount }: { communityFundTotal: number; confirmedContributionCount: number }) {
  const { citizenRequests } = useDemoWorkspace();
  const latestRequest = citizenRequests[0];
  const fundLabel = confirmedContributionCount > 0 ? `${formatNaira.format(communityFundTotal)} confirmed` : "Community fund";

  return (
    <PublicShell showFooter={false} customFooter={<LandingFooter />}>
      <section className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-landing-surface" aria-labelledby="landing-title">
        <OrbitField />

        <div className="relative z-10 flex min-h-dvh flex-col px-4 pb-6 pt-24 sm:px-8 sm:pb-7 sm:pt-28">
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center pb-4 pt-7 text-center sm:pt-10">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.68rem] font-medium text-landing-body">
                <span className="flex items-center gap-1.5"><ShieldCheck aria-hidden="true" className="text-med-success" size={14} /> No account needed</span>
                <span className="size-1 rounded-full bg-landing-line" aria-hidden="true" />
                <span className="flex items-center gap-1.5"><Activity aria-hidden="true" className="text-landing-blue" size={14} /> Session only privacy</span>
              </div>

              <h1 className="mt-5 max-w-[13ch] text-[clamp(2.7rem,6vw,4.4rem)] font-bold leading-[0.94] tracking-[-0.065em] text-landing-ink" id="landing-title">
                Emergency support, clearly coordinated
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-landing-body sm:text-[0.95rem]">Request help, share a location, and follow each response stage from one calm place.</p>

              <div className="mt-6 flex flex-col items-stretch justify-center gap-2.5 min-[380px]:flex-row min-[380px]:items-center">
                <Link className={cn(buttonVariants(), "min-h-11 justify-center rounded-[9px] bg-med-emergency px-5 text-xs font-bold text-med-on-accent shadow-none hover:bg-med-emergency-hover focus-visible:ring-med-emergency/25")} href="/sos">
                  <Siren aria-hidden="true" size={15} /> Request help now
                </Link>
                <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] border border-landing-line bg-landing-surface px-5 text-xs font-bold text-landing-ink outline-none transition-colors duration-[var(--med-motion-base)] hover:bg-landing-canvas focus-visible:ring-3 focus-visible:ring-landing-blue/25" href={latestRequest ? `/requests/${latestRequest.id}` : "/fund/contribute"}>
                  {latestRequest ? "Track request" : "Community fund"} <ArrowRight aria-hidden="true" size={14} />
                </Link>
              </div>

              <StatusStack />
            </div>

            <div className="mx-auto w-full max-w-5xl shrink-0">
              <p className="text-center text-[0.63rem] font-medium text-landing-muted">One clear path from request to response</p>
              <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[0.7rem] font-bold text-landing-body sm:gap-x-10">
                <li className="flex items-center gap-2"><Siren aria-hidden="true" size={14} /> Request without signup</li>
                <li className="flex items-center gap-2"><MapPin aria-hidden="true" size={14} /> GPS or landmark</li>
                <li className="flex items-center gap-2"><Hospital aria-hidden="true" size={14} /> {hospitals.length} hospitals listed</li>
                <li className="flex items-center gap-2"><HeartHandshake aria-hidden="true" size={14} /> {fundLabel}</li>
              </ul>
            </div>

            <p className="mx-auto mt-4 max-w-2xl shrink-0 text-center text-[0.62rem] leading-4 text-landing-muted">
              This prototype does not contact a real emergency service. For a real emergency, call your local emergency number.
            </p>
        </div>
      </section>

      <section className="border-y border-landing-line bg-landing-canvas" id="how-it-works">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[.8fr_1.2fr] lg:gap-24 lg:px-8">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-bold text-landing-blue">One visible response path</p>
            <h2 className="mt-4 max-w-md text-4xl font-bold leading-[1.02] tracking-[-0.055em] text-landing-ink sm:text-5xl">Know what happened, and what comes next.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-landing-body">The request reference stays constant while each operational stage becomes a plain language update.</p>
          </div>

          <ol className="border-y border-landing-line">
            <li className="grid gap-4 border-b border-landing-line py-7 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center">
              <span className="text-2xl font-bold tabular-nums text-landing-blue">01</span>
              <span><strong className="block text-lg text-landing-ink">Share the urgent need</strong><small className="mt-1 block text-sm leading-6 text-landing-body">Choose the closest issue and add a reachable number.</small></span>
              <Siren className="hidden text-med-emergency sm:block" aria-hidden="true" size={21} />
            </li>
            <li className="grid gap-4 border-b border-landing-line py-7 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center">
              <span className="text-2xl font-bold tabular-nums text-landing-blue">02</span>
              <span><strong className="block text-lg text-landing-ink">Pin the pickup point</strong><small className="mt-1 block text-sm leading-6 text-landing-body">Use device location or enter a road, building, or landmark.</small></span>
              <MapPin className="hidden text-landing-blue sm:block" aria-hidden="true" size={21} />
            </li>
            <li className="grid gap-4 py-7 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center">
              <span className="text-2xl font-bold tabular-nums text-landing-blue">03</span>
              <span><strong className="block text-lg text-landing-ink">Follow every handoff</strong><small className="mt-1 block text-sm leading-6 text-landing-body">See the dispatch, responder, arrival, and completion stage.</small></span>
              <Activity className="hidden text-med-success sm:block" aria-hidden="true" size={21} />
            </li>
          </ol>
        </div>
      </section>

      <section className="bg-landing-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid overflow-hidden rounded-[24px] border border-landing-line lg:grid-cols-2">
            <div className="flex min-h-[28rem] flex-col justify-between bg-landing-ink p-7 text-landing-surface sm:p-10 lg:p-12">
              <div>
                <span className="grid size-11 place-items-center rounded-[12px] bg-landing-surface/10"><HeartHandshake aria-hidden="true" size={21} /></span>
                <h2 className="mt-8 max-w-lg text-3xl font-bold leading-tight tracking-[-0.045em] sm:text-4xl">Community support can move with the emergency.</h2>
                <p className="mt-4 max-w-lg text-sm leading-7 text-landing-surface/65">Confirmed Paga sandbox contributions remain visible to the fund workflow without mixing public support and protected payout actions.</p>
              </div>
              <div className="mt-12 border-t border-landing-surface/15 pt-7">
                <p className="text-xs font-bold text-landing-surface/50">Confirmed community support</p>
                <p className="mt-2 text-4xl font-bold tracking-[-0.045em] tabular-nums">{communityFundTotal > 0 ? formatNaira.format(communityFundTotal) : "Open for support"}</p>
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-landing-surface/55">{confirmedContributionCount > 0 ? `${confirmedContributionCount} confirmed sandbox ${confirmedContributionCount === 1 ? "payment" : "payments"}` : "No confirmed sandbox payments yet"}</p>
                  <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] bg-landing-surface px-4 text-xs font-bold text-landing-ink outline-none transition-transform active:scale-[0.98] focus-visible:ring-3 focus-visible:ring-landing-blue/40" href="/fund/contribute">Contribute <ArrowRight aria-hidden="true" size={14} /></Link>
                </div>
              </div>
            </div>

            <div className="flex min-h-[28rem] flex-col justify-between bg-landing-surface p-7 sm:p-10 lg:p-12">
              <div>
                <span className="grid size-11 place-items-center rounded-[12px] bg-landing-blue-soft text-landing-blue"><SignalLow aria-hidden="true" size={21} /></span>
                <h2 className="mt-8 max-w-lg text-3xl font-bold leading-tight tracking-[-0.045em] text-landing-ink sm:text-4xl">Useful before the map ever loads.</h2>
                <p className="mt-4 max-w-lg text-sm leading-7 text-landing-body">The essential request and status path stays text first, so slower connections still reach the important information.</p>
              </div>
              <ul className="mt-12 divide-y divide-landing-line border-y border-landing-line text-sm font-bold text-landing-ink">
                <li className="flex items-center gap-3 py-4"><span className="grid size-7 place-items-center rounded-full bg-med-success-soft text-med-success"><Check aria-hidden="true" size={14} /></span> Manual landmark entry always remains available</li>
                <li className="flex items-center gap-3 py-4"><span className="grid size-7 place-items-center rounded-full bg-med-success-soft text-med-success"><Check aria-hidden="true" size={14} /></span> Request status does not depend on a map</li>
                <li className="flex items-center gap-3 py-4"><span className="grid size-7 place-items-center rounded-full bg-med-success-soft text-med-success"><Check aria-hidden="true" size={14} /></span> Location failures include a clear recovery path</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
