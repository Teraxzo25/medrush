"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, MapPin, Phone, ShieldCheck, Siren } from "lucide-react";
import { PageState } from "@/components/ui/page-state";
import { StatusChip } from "@/components/ui/status-chip";
import { buttonVariants } from "@/components/ui/button";
import { useDemoWorkspace } from "@/lib/demo-workspace";
import type { RequestStatus } from "@/lib/medrush-data";
import { cn } from "@/lib/utils";

const stages: { label: string; statuses: RequestStatus[] }[] = [
  { label: "Request received", statuses: ["Incoming", "Offered"] },
  { label: "Responder assigned", statuses: ["Accepted"] },
  { label: "On the way", statuses: ["En route"] },
  { label: "At the scene", statuses: ["At scene"] },
  { label: "Completed", statuses: ["Completed"] },
];

function maskPhone(phone: string) {
  const digits = phone.replace(/\s/g, "");
  if (digits.length < 7) return phone;
  return `${digits.slice(0, 4)} ••• ${digits.slice(-4)}`;
}

export function RequestDetail({ requestId, created }: { requestId: string; created: boolean }) {
  const { ready, citizenRequests } = useDemoWorkspace();
  const request = citizenRequests.find((item) => item.id === requestId);

  if (!ready) {
    return <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-28 sm:px-6 lg:px-8"><PageState state="loading" /></div>;
  }

  if (!request) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <PageState
          state="empty"
          title="This request is not in this session"
          description="Demo requests stay in the browser tab where they were created. Start a new request if this tab was closed or reset."
          action={<Link className={buttonVariants()} href="/sos"><Siren aria-hidden="true" /> Start a request</Link>}
        />
      </div>
    );
  }

  const currentStage = request.status === "Declined" ? -1 : Math.max(0, stages.findIndex((stage) => stage.statuses.includes(request.status)));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-8">
      <Link className="inline-flex min-h-11 items-center gap-2 rounded-med-sm pr-3 text-sm font-bold text-med-body outline-none hover:text-med-ink focus-visible:ring-3 focus-visible:ring-med-accent/25" href="/">
        <ArrowLeft aria-hidden="true" size={17} /> Back home
      </Link>

      {created && (
        <section className="mt-5 flex items-start gap-4 rounded-med-md border border-med-border bg-med-success-soft p-5" role="status" aria-live="polite">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-med-success text-med-on-accent"><CheckCircle2 aria-hidden="true" size={20} /></span>
          <div><p className="font-bold text-med-ink">Your demonstration request was recorded.</p><p className="mt-1 text-sm leading-6 text-med-body">Keep this page open to follow its status in this browser tab.</p></div>
        </section>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
        <section className="rounded-med-md border border-med-border bg-med-surface p-6 sm:p-8" aria-labelledby="request-title">
          <div className="flex flex-col gap-4 border-b border-med-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-med-muted">Request {request.id}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-med-ink" id="request-title">{request.category}</h1>
              <p className="mt-2 text-sm text-med-body">Recorded {request.created.toLowerCase()}</p>
            </div>
            <StatusChip className="self-start" status={request.status} />
          </div>

          <div className="py-7">
            <h2 className="text-lg font-bold text-med-ink">Request progress</h2>
            {request.status === "Declined" ? (
              <p className="mt-4 rounded-med-sm bg-med-error-soft px-4 py-3 text-sm leading-6 text-med-error">This demonstration request was declined. Start a new request if assistance is still needed.</p>
            ) : (
              <ol className="mt-5 grid gap-0 sm:grid-cols-5" aria-label="Request stages">
                {stages.map((stage, index) => {
                  const complete = index < currentStage;
                  const current = index === currentStage;
                  return (
                    <li className="relative flex gap-3 pb-5 sm:block sm:pb-0 sm:text-center" key={stage.label} aria-current={current ? "step" : undefined}>
                      <span className={cn("relative z-10 grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold sm:mx-auto", complete || current ? "border-med-accent bg-med-accent text-med-on-accent" : "border-med-border bg-med-canvas text-med-muted")}>
                        {complete ? <Check aria-hidden="true" size={14} /> : index + 1}
                      </span>
                      {index < stages.length - 1 && <span className={cn("absolute left-4 top-8 h-[calc(100%-2rem)] w-px sm:left-1/2 sm:top-4 sm:h-px sm:w-full", index < currentStage ? "bg-med-accent" : "bg-med-border")} aria-hidden="true" />}
                      <span className={cn("pt-1 text-sm font-bold sm:mt-3 sm:block sm:px-1 sm:pt-0", complete || current ? "text-med-ink" : "text-med-muted")}>{stage.label}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <dl className="grid gap-0 overflow-hidden rounded-med-md border border-med-border sm:grid-cols-2">
            <div className="border-b border-med-border p-5 sm:border-r"><dt className="flex items-center gap-2 text-xs font-bold text-med-muted"><MapPin aria-hidden="true" size={15} /> Pickup location</dt><dd className="mt-2 text-sm font-bold leading-6 text-med-ink">{request.location}</dd></div>
            <div className="border-b border-med-border p-5"><dt className="flex items-center gap-2 text-xs font-bold text-med-muted"><Phone aria-hidden="true" size={15} /> Request contact</dt><dd className="mt-2 text-sm font-bold text-med-ink">{maskPhone(request.phone)}</dd></div>
            <div className="p-5 sm:col-span-2"><dt className="flex items-center gap-2 text-xs font-bold text-med-muted"><ShieldCheck aria-hidden="true" size={15} /> Privacy</dt><dd className="mt-2 text-sm leading-6 text-med-body">This request is stored only for this browser tab and is not a production emergency record.</dd></div>
          </dl>
        </section>

        <aside className="grid content-start gap-5">
          <section className="rounded-med-md border border-med-border bg-med-canvas p-6">
            <Clock3 aria-hidden="true" className="text-med-accent" size={22} />
            <h2 className="mt-5 text-xl font-bold tracking-[-0.025em] text-med-ink">What happens next</h2>
            <p className="mt-2 text-sm leading-6 text-med-body">A staff demonstration can advance this request through dispatch, responder, and hospital stages.</p>
          </section>
          <section className="rounded-med-md border border-med-error/30 bg-med-error-soft p-6">
            <Siren aria-hidden="true" className="text-med-error" size={22} />
            <h2 className="mt-5 text-xl font-bold tracking-[-0.025em] text-med-ink">Need real assistance?</h2>
            <p className="mt-2 text-sm leading-6 text-med-body">Medrush is a demonstration and has not contacted a real responder. Call your local emergency number now.</p>
          </section>
          <Link className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center border-med-control-border bg-med-surface text-med-ink hover:bg-med-subtle")} href="/sos">
            Start another request <ArrowRight aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
