import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { pagaTransactions } from "@/lib/db/schema";
import { isValidPagaSignature } from "@/lib/paga";

export const runtime = "nodejs";

function responseCodeIsSuccessful(value: unknown) {
  return String(value) === "0";
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const headers = request.headers;
    const payoutHash = headers.get("x-paga-hash");
    const reference = typeof payload.referenceNumber === "string" ? payload.referenceNumber : "";

    if (payoutHash) {
      const fields = ["referenceNumber", "transactionDate", "transactionId", "amount", "sessionId"]
        .map((key) => typeof payload[key] === "string" || typeof payload[key] === "number" ? String(payload[key]) : "");
      if (!reference || !isValidPagaSignature(fields, payoutHash)) return NextResponse.json({ error: "Invalid callback signature." }, { status: 401 });
      const [transaction] = await db.select({ amountKobo: pagaTransactions.amountKobo }).from(pagaTransactions)
        .where(and(eq(pagaTransactions.reference, reference), eq(pagaTransactions.transactionType, "hospital_payout"))).limit(1);
      if (!transaction) return NextResponse.json({ error: "Unknown payout reference." }, { status: 404 });
      const receivedKobo = Math.round(Number(payload.amount) * 100);
      if (!Number.isFinite(receivedKobo) || receivedKobo !== transaction.amountKobo) return NextResponse.json({ error: "Amount mismatch." }, { status: 400 });

      const status = responseCodeIsSuccessful(payload.responseCode) ? "successful" : "failed";
      await db.update(pagaTransactions).set({
        status,
        providerTransactionId: typeof payload.transactionId === "string" ? payload.transactionId.slice(0, 160) : null,
        failureCode: status === "failed" ? `PAGA_${String(payload.responseCode).slice(0, 48)}` : null,
        updatedAt: new Date(),
      }).where(and(eq(pagaTransactions.reference, reference), inArray(pagaTransactions.status, ["pending", "processing"])));
      return NextResponse.json({ received: true });
    }

    const paymentReference = typeof payload.paymentReference === "string" ? payload.paymentReference : "";
    const amount = typeof payload.amount === "string" || typeof payload.amount === "number" ? String(payload.amount) : "";
    const timestamp = typeof payload.timeStamp === "string" || typeof payload.timeStamp === "number" ? String(payload.timeStamp) : "";
    const callbackHash = typeof payload.hash === "string" ? payload.hash : null;
    if (!paymentReference || !amount || !timestamp || !isValidPagaSignature([amount, timestamp, paymentReference], callbackHash)) {
      return NextResponse.json({ error: "Invalid callback signature." }, { status: 401 });
    }

    const [transaction] = await db.select({ amountKobo: pagaTransactions.amountKobo }).from(pagaTransactions)
      .where(and(eq(pagaTransactions.reference, paymentReference), eq(pagaTransactions.transactionType, "community_contribution"))).limit(1);
    if (!transaction) return NextResponse.json({ error: "Unknown payment reference." }, { status: 404 });
    const receivedKobo = Math.round(Number(amount) * 100);
    if (!Number.isFinite(receivedKobo) || receivedKobo !== transaction.amountKobo) return NextResponse.json({ error: "Amount mismatch." }, { status: 400 });

    const rawStatus = String(payload.status ?? payload.paymentStatus ?? "").toLowerCase();
    if (!["successful", "success", "completed", "failed", "declined"].includes(rawStatus)) {
      return NextResponse.json({ received: true, status: "pending" });
    }
    const status = ["successful", "success", "completed"].includes(rawStatus) ? "successful" : "failed";
    await db.update(pagaTransactions).set({
      status,
      providerTransactionId: typeof payload.transactionId === "string" ? payload.transactionId.slice(0, 160) : null,
      failureCode: status === "failed" ? "PAGA_CHECKOUT_FAILED" : null,
      updatedAt: new Date(),
    }).where(and(eq(pagaTransactions.reference, paymentReference), inArray(pagaTransactions.status, ["pending", "processing"])));
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Callback could not be processed." }, { status: 500 });
  }
}
