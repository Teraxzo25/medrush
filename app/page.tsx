import MedrushDashboard, { type CommunityContribution } from "@/components/medrush-dashboard";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pagaTransactions } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function Page() {
  let communityContributions: CommunityContribution[] = [];

  try {
    const transactions = await db.select({
      reference: pagaTransactions.reference,
      amountKobo: pagaTransactions.amountKobo,
      status: pagaTransactions.status,
      createdAt: pagaTransactions.createdAt,
    }).from(pagaTransactions)
      .where(eq(pagaTransactions.transactionType, "community_contribution"))
      .orderBy(desc(pagaTransactions.createdAt))
      .limit(50);

    communityContributions = transactions.map((transaction) => ({
      reference: transaction.reference,
      amountNaira: transaction.amountKobo / 100,
      status: transaction.status,
      createdAt: transaction.createdAt.toISOString(),
    }));
  } catch {
    communityContributions = [];
  }

  return <MedrushDashboard communityContributions={communityContributions} />;
}
