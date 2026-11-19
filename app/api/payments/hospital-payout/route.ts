import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/neon-auth";
import { db } from "@/lib/db";
import { pagaTransactions } from "@/lib/db/schema";
import { getPagaCredentials, sendPagaBankTransfer, validatePagaBankAccount } from "@/lib/paga";
import { getTrustedPaymentOrigin } from "@/lib/payment-origin";

export const runtime = "nodejs";

async function isAuthorized(request: Request) {
  const { data: session } = await auth.getSession({ fetchOptions: { headers: request.headers } });
  const role = (session?.user as { role?: string } | undefined)?.role?.toLowerCase();
  return Boolean(session?.user && (role === "admin" || role === "owner"));
}

export async function POST(request: Request) {
  try {
    const publicOrigin = getTrustedPaymentOrigin(request);
    if (!publicOrigin) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
    if (!(await isAuthorized(request))) return NextResponse.json({ error: "Sign in with a fund administrator account to continue." }, { status: 403 });

    const body = await request.json();
    const amountNaira = Number(body.amountNaira);
    const hospitalName = typeof body.hospitalName === "string" ? body.hospitalName.trim().slice(0, 160) : "";
    const bankCode = typeof body.bankCode === "string" ? body.bankCode : "";
    const accountNumber = typeof body.accountNumber === "string" ? body.accountNumber : "";
    const fundRequestId = typeof body.fundRequestId === "string" ? body.fundRequestId.trim().slice(0, 80) : null;
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : "";
    const confirm = body.confirm === true;

    if (!Number.isInteger(amountNaira) || amountNaira < 100 || amountNaira > 5_000_000) {
      return NextResponse.json({ error: "Choose an amount between ₦100 and ₦5,000,000." }, { status: 400 });
    }
    if (!hospitalName || !/^[0-9a-f-]{36}$/i.test(bankCode) || !/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json({ error: "Check the hospital, bank identifier, and 10-digit account number." }, { status: 400 });
    }
    if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) {
      return NextResponse.json({ error: "A valid idempotency key is required." }, { status: 400 });
    }

    const reference = `MR-P-${randomUUID().replaceAll("-", "").slice(0, 24).toUpperCase()}`;
    const amount = amountNaira.toFixed(2);
    const account = await validatePagaBankAccount({ reference, amount, bankCode, accountNumber });
    if (!confirm) return NextResponse.json({ accountName: account.accountName, bankAccountLast4: accountNumber.slice(-4) });

    const [existing] = await db.select().from(pagaTransactions).where(and(
      eq(pagaTransactions.idempotencyKey, idempotencyKey),
      eq(pagaTransactions.transactionType, "hospital_payout"),
    )).limit(1);
    if (existing) {
      const sameRequest = existing.amountKobo === amountNaira * 100
        && existing.hospitalName === hospitalName
        && existing.fundRequestId === fundRequestId
        && existing.bankCode === bankCode
        && existing.bankAccountLast4 === accountNumber.slice(-4);
      if (!sameRequest) return NextResponse.json({ error: "This idempotency key is already attached to a different payout." }, { status: 409 });
      return NextResponse.json({ reference: existing.reference, status: existing.status, bankAccountLast4: existing.bankAccountLast4 });
    }

    const [transaction] = await db.insert(pagaTransactions).values({
      transactionType: "hospital_payout",
      reference,
      idempotencyKey,
      amountKobo: amountNaira * 100,
      status: "processing",
      fundRequestId,
      hospitalName,
      bankCode,
      bankAccountLast4: accountNumber.slice(-4),
    }).onConflictDoNothing().returning({ reference: pagaTransactions.reference, status: pagaTransactions.status });

    if (!transaction) {
      const [retry] = await db.select({ reference: pagaTransactions.reference, status: pagaTransactions.status }).from(pagaTransactions).where(and(eq(pagaTransactions.idempotencyKey, idempotencyKey), eq(pagaTransactions.transactionType, "hospital_payout"))).limit(1);
      if (!retry) throw new Error("Could not create a payout record.");
      return NextResponse.json({ ...retry, bankAccountLast4: accountNumber.slice(-4) });
    }

    try {
      const providerResult = await sendPagaBankTransfer({
        reference: transaction.reference,
        amount,
        bankCode,
        accountNumber,
        callbackUrl: new URL("/api/payments/paga-callback", publicOrigin).toString(),
      });
      const providerId = [providerResult.transactionId, providerResult.sessionId].find((value) => typeof value === "string");
      await db.update(pagaTransactions).set({ providerTransactionId: typeof providerId === "string" ? providerId : null, updatedAt: new Date() }).where(and(eq(pagaTransactions.reference, transaction.reference), eq(pagaTransactions.transactionType, "hospital_payout")));
    } catch (error) {
      const outcomeUnknown = error instanceof TypeError || (error instanceof Error && error.name === "TimeoutError");
      if (outcomeUnknown) {
        await db.update(pagaTransactions).set({ failureCode: "PAGA_TRANSFER_UNCONFIRMED", updatedAt: new Date() }).where(eq(pagaTransactions.reference, transaction.reference));
        return NextResponse.json({ reference: transaction.reference, status: "processing", bankAccountLast4: accountNumber.slice(-4) }, { status: 202 });
      }
      await db.update(pagaTransactions).set({ status: "failed", failureCode: "PAGA_TRANSFER_REJECTED", updatedAt: new Date() }).where(eq(pagaTransactions.reference, transaction.reference));
      return NextResponse.json({ error: "Paga rejected this sandbox transfer. Review the account details before creating a new request." }, { status: 502 });
    }

    return NextResponse.json({ reference: transaction.reference, status: "processing", bankAccountLast4: accountNumber.slice(-4) });
  } catch {
    return NextResponse.json({ error: "The sandbox payout could not be processed." }, { status: 500 });
  }
}
