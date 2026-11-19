import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/neon-auth";
import PagaPaymentCenter from "@/components/paga-payment-center";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pagaTransactions } from "@/lib/db/schema";
import "./payments.css";

export const metadata: Metadata = {
  title: "Emergency Fund Payments | Medrush",
  description: "Secure community fund contributions and hospital sandbox payouts for Medrush.",
};

export const dynamic = "force-dynamic";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  const [{ data: session }, params] = await Promise.all([
    auth.getSession({ fetchOptions: { headers: await headers() } }),
    searchParams,
  ]);

  const role = (session?.user as { role?: string } | undefined)?.role?.toLowerCase();
  const isPayoutAdmin = role === "admin" || role === "owner";
  const initialReference = params.reference ?? "";
  let initialPaymentStatus = "";

  if (/^MR-C-[A-Z0-9]{24}$/.test(initialReference)) {
    try {
      const [transaction] = await db.select({ status: pagaTransactions.status })
        .from(pagaTransactions)
        .where(and(
          eq(pagaTransactions.reference, initialReference),
          eq(pagaTransactions.transactionType, "community_contribution"),
        )).limit(1);
      initialPaymentStatus = transaction?.status ?? "";
    } catch {
      initialPaymentStatus = "";
    }
  }

  return <PagaPaymentCenter isSignedIn={Boolean(session?.user)} isPayoutAdmin={isPayoutAdmin} initialReference={initialReference} initialPaymentStatus={initialPaymentStatus} />;
}
