import { createHash, timingSafeEqual } from "node:crypto";

const pagaSandboxBaseUrl = "https://beta.mypaga.com/paga-webservices/business-rest/secured";

export function getPagaCredentials() {
  const publicKey = process.env.PAGA_SANDBOX_PUBLIC_KEY;
  const secretKey = process.env.PAGA_SANDBOX_SECRET_KEY;
  const hashKey = process.env.PAGA_SANDBOX_HASH_KEY;

  if (!publicKey || !secretKey || !hashKey) throw new Error("Paga sandbox credentials are not configured.");
  return { publicKey, secretKey, hashKey };
}

export function signPagaFields(fields: string[], hashKey: string) {
  return createHash("sha512").update(`${fields.join("")}${hashKey}`).digest("hex");
}

export function isValidPagaSignature(fields: string[], hash: string | null) {
  if (!hash) return false;
  const { hashKey } = getPagaCredentials();
  const expected = Buffer.from(signPagaFields(fields, hashKey), "hex");
  const received = Buffer.from(hash, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function validatePagaBankAccount(input: {
  reference: string;
  amount: string;
  bankCode: string;
  accountNumber: string;
}) {
  const credentials = getPagaCredentials();
  const body = {
    referenceNumber: input.reference,
    amount: input.amount,
    currency: "NGN",
    destinationBankUUID: input.bankCode,
    destinationBankAccountNumber: input.accountNumber,
  };
  const response = await fetch(`${pagaSandboxBaseUrl}/validateDepositToBank`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      principal: credentials.publicKey,
      credentials: credentials.secretKey,
      hash: signPagaFields([body.referenceNumber, body.amount, body.destinationBankUUID, body.destinationBankAccountNumber], credentials.hashKey),
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const result = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok || !result || String(result.responseCode) !== "0") {
    throw new Error("Paga could not validate this bank account.");
  }

  const accountName = [result.accountName, result.destinationBankAccountName, result.recipientName]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0);
  if (!accountName) throw new Error("Paga did not return a verified account name.");
  return { accountName, providerResult: result };
}

export async function sendPagaBankTransfer(input: {
  reference: string;
  amount: string;
  bankCode: string;
  accountNumber: string;
  callbackUrl: string;
}) {
  const credentials = getPagaCredentials();
  const body = {
    referenceNumber: input.reference,
    amount: input.amount,
    currency: "NGN",
    destinationBankUUID: input.bankCode,
    destinationBankAccountNumber: input.accountNumber,
    statusCallbackUrl: input.callbackUrl,
  };
  const response = await fetch(`${pagaSandboxBaseUrl}/depositToBank`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      principal: credentials.publicKey,
      credentials: credentials.secretKey,
      hash: signPagaFields([body.referenceNumber, body.amount, body.destinationBankUUID, body.destinationBankAccountNumber], credentials.hashKey),
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const result = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok || !result || String(result.responseCode) !== "0") {
    throw new Error("Paga did not accept the sandbox transfer.");
  }
  return result;
}
