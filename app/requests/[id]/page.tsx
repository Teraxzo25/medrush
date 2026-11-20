import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";
import { RequestDetail } from "@/components/public/request-detail";

export const metadata: Metadata = {
  title: "Request Status | Medrush",
  description: "Review the current status of a Medrush demonstration emergency request.",
};

export default async function RequestPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return <PublicShell><RequestDetail requestId={id} created={query.created === "1"} /></PublicShell>;
}
