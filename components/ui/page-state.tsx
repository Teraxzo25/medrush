import { CircleAlert, Inbox, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageState({ state, title, description, action, className }: {
  state: "loading" | "empty" | "error";
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  if (state === "loading") {
    return (
      <section className={cn("rounded-med-md border border-med-border bg-med-surface p-6", className)} aria-busy="true" aria-label="Loading request">
        <div className="h-3 w-24 animate-pulse rounded-full bg-med-subtle motion-reduce:animate-none" />
        <div className="mt-4 h-8 w-3/4 animate-pulse rounded-med-sm bg-med-subtle motion-reduce:animate-none" />
        <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-med-subtle motion-reduce:animate-none" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-med-subtle motion-reduce:animate-none" />
      </section>
    );
  }

  const Icon = state === "error" ? CircleAlert : Inbox;
  return (
    <section className={cn("rounded-med-md border border-med-border bg-med-surface p-7 text-center", className)} role={state === "error" ? "alert" : "status"}>
      <span className={cn("mx-auto grid size-11 place-items-center rounded-full", state === "error" ? "bg-med-error-soft text-med-error" : "bg-med-subtle text-med-body")}>
        <Icon aria-hidden="true" size={20} />
      </span>
      <h2 className="mt-4 text-xl font-bold text-med-ink">{title ?? (state === "error" ? "Something went wrong" : "Nothing here yet")}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-med-body">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
      {state === "error" && !action && <RotateCcw className="sr-only" aria-hidden="true" />}
    </section>
  );
}
