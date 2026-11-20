import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  incoming: "bg-med-warning-soft text-med-warning",
  offered: "bg-med-info-soft text-med-info",
  accepted: "bg-med-info-soft text-med-info",
  "en route": "bg-med-info-soft text-med-info",
  "at scene": "bg-med-success-soft text-med-success",
  completed: "bg-med-success-soft text-med-success",
  successful: "bg-med-success-soft text-med-success",
  approved: "bg-med-success-soft text-med-success",
  declined: "bg-med-error-soft text-med-error",
  failed: "bg-med-error-soft text-med-error",
  reversed: "bg-med-error-soft text-med-error",
  review: "bg-med-warning-soft text-med-warning",
  pending: "bg-med-warning-soft text-med-warning",
  processing: "bg-med-info-soft text-med-info",
};

export function StatusChip({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-xs font-bold", statusStyles[status.toLowerCase()] ?? "bg-med-subtle text-med-body", className)}>
      {status}
    </span>
  );
}
