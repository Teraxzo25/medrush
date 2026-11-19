import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pagaTransactions } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const reference = new URL(request.url).searchParams.get("reference")?.trim() ?? "";
  if (!/^MR-[CP]-[A-Z0-9]{24}$/.test(reference)) return NextResponse.json({ error: "Invalid payment reference." }, { status: 400 });

  try {
    const [transaction] = await db.select({ reference: pagaTransactions.reference, status: pagaTransactions.status, amountKobo: pagaTransactions.amountKobo, createdAt: pagaTransactions.createdAt })
      .from(pagaTransactions).where(eq(pagaTransactions.reference, reference)).limit(1);
    if (!transaction) return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    return NextResponse.json({ ...transaction, amountNaira: transaction.amountKobo / 100 });
  } catch {
    return NextResponse.json({ error: "Payment status is temporarily unavailable." }, { status: 503 });
  }
}
