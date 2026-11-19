import { bigint, check, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const pagaTransactions = pgTable(
  "paga_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    transactionType: text("transaction_type").notNull(),
    reference: text("reference").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    amountKobo: bigint("amount_kobo", { mode: "number" }).notNull(),
    currency: text("currency").notNull().default("NGN"),
    status: text("status").notNull().default("pending"),
    fundRequestId: text("fund_request_id"),
    hospitalName: text("hospital_name"),
    donorName: text("donor_name"),
    donorEmail: text("donor_email"),
    bankCode: text("bank_code"),
    bankAccountLast4: text("bank_account_last4"),
    providerTransactionId: text("provider_transaction_id"),
    checkoutUrl: text("checkout_url"),
    failureCode: text("failure_code"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("paga_transactions_reference_key").on(table.reference),
    uniqueIndex("paga_transactions_idempotency_key_key").on(table.idempotencyKey),
    index("paga_transactions_type_created_idx").on(table.transactionType, table.createdAt),
    index("paga_transactions_status_created_idx").on(table.status, table.createdAt),
    check("paga_transactions_type_check", sql`${table.transactionType} in ('community_contribution', 'hospital_payout')`),
    check("paga_transactions_amount_check", sql`${table.amountKobo} > 0`),
    check("paga_transactions_currency_check", sql`${table.currency} = 'NGN'`),
    check("paga_transactions_status_check", sql`${table.status} in ('pending', 'processing', 'successful', 'failed', 'reversed')`),
    check("paga_transaction_context_check", sql`(${table.transactionType} = 'community_contribution' and ${table.fundRequestId} is null and ${table.hospitalName} is null and ${table.bankCode} is null and ${table.bankAccountLast4} is null) or (${table.transactionType} = 'hospital_payout' and ${table.hospitalName} is not null and ${table.bankCode} is not null and ${table.bankAccountLast4} is not null)`),
  ],
);
