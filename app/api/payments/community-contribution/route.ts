import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pagaTransactions } from "@/lib/db/schema";
import { getPagaCredentials } from "@/lib/paga";
import { getTrustedPaymentOrigin } from "@/lib/payment-origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const publicOrigin = getTrustedPaymentOrigin(request);
    if (!publicOrigin) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
    const body = await request.json();
    const amountNaira = Number(body.amountNaira);
    const donorName = typeof body.donorName === "string" ? body.donorName.trim().slice(0, 120) : "";
    const donorEmail = typeof body.donorEmail === "string" ? body.donorEmail.trim().toLowerCase().slice(0, 254) : "";
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : "";

    if (!Number.isInteger(amountNaira) || amountNaira < 100 || amountNaira > 5_000_000) {
      return NextResponse.json({ error: "Choose an amount between ₦100 and ₦5,000,000." }, { status: 400 });
    }
    if (!donorName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      return NextResponse.json({ error: "Enter your name and a valid email address." }, { status: 400 });
    }
    if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) {
      return NextResponse.json({ error: "A valid idempotency key is required." }, { status: 400 });
    }

    const credentials = getPagaCredentials();
    const reference = `MR-C-${randomUUID().replaceAll("-", "").slice(0, 24).toUpperCase()}`;
    const checkout = new URL("https://beta-checkout.paga.com/checkout/params");
    checkout.searchParams.set("public_key", credentials.publicKey);
    checkout.searchParams.set("amount", amountNaira.toFixed(2));
    checkout.searchParams.set("currency", "NGN");
    checkout.searchParams.set("payment_reference", reference);
    checkout.searchParams.set("email", donorEmail);
    checkout.searchParams.set("charge_url", new URL(`/payments?reference=${encodeURIComponent(reference)}`, publicOrigin).toString());
    checkout.searchParams.set("callback_url", new URL("/api/payments/paga-callback", request.url).toString());

    const [existing] = await db.select().from(pagaTransactions).where(and(
      eq(pagaTransactions.idempotencyKey, idempotencyKey),
      eq(pagaTransactions.transactionType, "community_contribution"),
    )).limit(1);
    if (existing) {
      checkout.searchParams.set("amount", (existing.amountKobo / 100).toFixed(2));
      checkout.searchParams.set("email", existing.donorEmail ?? donorEmail);
      checkout.searchParams.set("payment_reference", existing.reference);
      checkout.searchParams.set("charge_url", new URL(`/payments?reference=${encodeURIComponent(existing.reference)}`, publicOrigin).toString());
      return NextResponse.json({ reference: existing.reference, status: existing.status, checkoutUrl: checkout.toString() });
    }

    const [transaction] = await db.insert(pagaTransactions).values({
      transactionType: "community_contribution",
      reference,
      idempotencyKey,
      amountKobo: amountNaira * 100,
      donorName,
      donorEmail,
      checkoutUrl: checkout.toString(),
    }).onConflictDoNothing().returning({ reference: pagaTransactions.reference, status: pagaTransactions.status });

    if (!transaction) {
      const [retry] = await db.select().from(pagaTransactions).where(and(
        eq(pagaTransactions.idempotencyKey, idempotencyKey),
        eq(pagaTransactions.transactionType, "community_contribution"),
      )).limit(1);
      if (!retry) throw new Error("Could not create a payment record.");
      checkout.searchParams.set("amount", (retry.amountKobo / 100).toFixed(2));
      checkout.searchParams.set("email", retry.donorEmail ?? donorEmail);
      checkout.searchParams.set("payment_reference", retry.reference);
      checkout.searchParams.set("charge_url", new URL(`/payments?reference=${encodeURIComponent(retry.reference)}`, publicOrigin).toString());
      return NextResponse.json({ ...retry, checkoutUrl: checkout.toString() });
    }

    return NextResponse.json({ ...transaction, checkoutUrl: checkout.toString() });
  } catch {
    return NextResponse.json({ error: "We could not start the Paga sandbox checkout. Try again." }, { status: 500 });
  }
}
