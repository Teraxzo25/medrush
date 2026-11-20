import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FormField({ id, label, hint, error, className, children }: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  const descriptionId = hint || error ? `${id}-description` : undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <label className="text-sm font-bold text-med-ink" htmlFor={id}>{label}</label>
      {children}
      {(hint || error) && (
        <p className={cn("text-sm leading-5", error ? "text-med-error" : "text-med-muted")} id={descriptionId} role={error ? "alert" : undefined}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export const fieldClassName = "min-h-12 w-full rounded-med-sm border border-med-control-border bg-med-surface px-3.5 text-base text-med-ink outline-none transition-[border-color,box-shadow] duration-[var(--med-motion-base)] placeholder:text-med-muted focus-visible:border-med-accent focus-visible:ring-3 focus-visible:ring-med-accent/20 disabled:cursor-not-allowed disabled:bg-med-subtle disabled:text-med-muted";
