"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, CheckCircle2, CircleAlert, Heart, LockKeyhole, ShieldCheck } from "lucide-react";

type ApiResult = { error?: string; reference?: string; status?: string; checkoutUrl?: string; accountName?: string; bankAccountLast4?: string };

const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

export default function PagaPaymentCenter({ isSignedIn, isPayoutAdmin, initialReference, initialPaymentStatus }: { isSignedIn: boolean; isPayoutAdmin: boolean; initialReference: string; initialPaymentStatus: string }) {
  const [contribution, setContribution] = useState({ name: "", email: "", amount: "5000" });
  const [payout, setPayout] = useState({ hospital: "", fundRequestId: "", amount: "25000", bankCode: "", accountNumber: "" });
  const [payoutConfirmation, setPayoutConfirmation] = useState<ApiResult | null>(null);
  const [contributionReference, setContributionReference] = useState(initialReference);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [payoutReference, setPayoutReference] = useState("");
  const [payoutStatus, setPayoutStatus] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const contributionKey = useRef(crypto.randomUUID());
  const payoutKey = useRef(crypto.randomUUID());

  async function startContribution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setBusy(true);
    try {
      const response = await fetch("/api/payments/community-contribution", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...contribution, amountNaira: contribution.amount, donorName: contribution.name, donorEmail: contribution.email, idempotencyKey: contributionKey.current }),
      });
      const result = await response.json() as ApiResult;
      if (!response.ok || !result.reference || !result.checkoutUrl) throw new Error(result.error ?? "Checkout could not be started.");
      setContributionReference(result.reference);
      setPaymentStatus("pending");
      contributionKey.current = crypto.randomUUID();
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Checkout could not be started.");
    } finally {
      setBusy(false);
    }
  }

  async function checkStatus() {
    if (!contributionReference) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/payments/status?reference=${encodeURIComponent(contributionReference)}`, { cache: "no-store" });
      const result = await response.json() as ApiResult;
      if (!response.ok) throw new Error(result.error ?? "Could not check payment status.");
      setPaymentStatus(result.status ?? "pending");
      setNotice(`Payment status: ${result.status ?? "pending"}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not check payment status.");
    } finally {
      setBusy(false);
    }
  }

  async function checkPayoutStatus() {
    if (!payoutReference) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/payments/status?reference=${encodeURIComponent(payoutReference)}`, { cache: "no-store" });
      const result = await response.json() as ApiResult;
      if (!response.ok) throw new Error(result.error ?? "Could not check payout status.");
      setPayoutStatus(result.status ?? "processing");
      setNotice(`Payout status: ${result.status ?? "processing"}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not check payout status.");
    } finally {
      setBusy(false);
    }
  }

  async function submitPayout(event: FormEvent<HTMLFormElement> | undefined, confirm: boolean) {
    event?.preventDefault();
    setNotice("");
    setBusy(true);
    try {
      const response = await fetch("/api/payments/hospital-payout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          hospitalName: payout.hospital,
          fundRequestId: payout.fundRequestId,
          amountNaira: payout.amount,
          bankCode: payout.bankCode,
          accountNumber: payout.accountNumber,
          idempotencyKey: payoutKey.current,
          confirm,
        }),
      });
      const result = await response.json() as ApiResult;
      if (!response.ok) throw new Error(result.error ?? "Payout could not be processed.");
      if (!confirm) {
        setPayoutConfirmation(result);
      } else {
        setPayoutConfirmation(null);
        setPayoutReference(result.reference ?? "");
        setPayoutStatus(result.status ?? "processing");
        setPayout((current) => ({ ...current, accountNumber: "" }));
        payoutKey.current = crypto.randomUUID();
        setNotice(`Sandbox transfer ${result.reference} is ${result.status}.`);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Payout could not be processed.");
    } finally {
      setBusy(false);
    }
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      if (!response.ok) throw new Error("Sign-in failed. Check your credentials and try again.");
      window.location.reload();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <main className="paga-page">
      <header className="paga-page-header">
        <a className="paga-back-link" href="/"><ArrowLeft size={16} /> Back to Medrush</a>
        <span className="paga-mode"><span /> PAGA SANDBOX</span>
      </header>
      <section className="paga-intro">
        <span className="paga-kicker"><Heart size={14} /> TRANSPARENT EMERGENCY SUPPORT</span>
        <h1>Emergency Fund payments</h1>
        <p>Contribute to verified care and review hospital disbursements. Paga sandbox transactions do not move real money.</p>
      </section>
      {notice && <p className="paga-notice" role="status"><CircleAlert size={16} />{notice}</p>}
      <div className="paga-grid">
        <section className="paga-card">
          <div className="paga-card-title"><span className="paga-icon"><Heart size={18} /></span><div><h2>Support the community fund</h2><p>Secure Paga-hosted sandbox checkout</p></div></div>
          <form className="paga-form" onSubmit={startContribution}>
            <label>Full name<input required maxLength={120} autoComplete="name" value={contribution.name} onChange={(event) => setContribution({ ...contribution, name: event.target.value })} /></label>
            <label>Email address<input required type="email" maxLength={254} autoComplete="email" value={contribution.email} onChange={(event) => setContribution({ ...contribution, email: event.target.value })} /></label>
            <label>Contribution amount (NGN)<span className="paga-input-prefix">₦<input required type="number" min="100" max="5000000" step="1" inputMode="numeric" value={contribution.amount} onChange={(event) => setContribution({ ...contribution, amount: event.target.value })} /></span></label>
            <button className="paga-primary" type="submit" disabled={busy}>{busy ? "Starting checkout…" : "Continue to Paga checkout"}<ArrowUpRight size={16} /></button>
          </form>
          {contributionReference && <div className="paga-status-card"><div><strong>Payment reference</strong><span>{contributionReference}</span></div><span className={`paga-status ${paymentStatus}`}>{paymentStatus || "Awaiting payment"}</span><button className="paga-secondary" type="button" onClick={checkStatus} disabled={busy}>Check status</button></div>}
          {paymentStatus === "successful" && <a className="paga-community-return" href="/">View the community fund and confirmed payment</a>}
          <p className="paga-footnote"><LockKeyhole size={14} /> Your account details are entered only on Paga. Payment status is confirmed from the signed provider callback.</p>
        </section>

        <section className="paga-card payout-card">
          <div className="paga-card-title"><span className="paga-icon"><ShieldCheck size={18} /></span><div><h2>Hospital sandbox payout</h2><p>Account validation and explicit confirmation required</p></div></div>
          {!isSignedIn ? <form className="paga-form" onSubmit={signIn}>
            <p className="paga-auth-copy">Sign in with a Medrush fund administrator account to validate or send a hospital payout.</p>
            <label>Email address<input required type="email" name="email" autoComplete="username" /></label>
            <label>Password<input required type="password" name="password" autoComplete="current-password" /></label>
            <button className="paga-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          </form> : !isPayoutAdmin ? <div className="paga-access-note" role="note"><ShieldCheck size={17} /><p>Your account is signed in but does not have the fund administrator role required to send hospital payouts.</p></div> : <form className="paga-form" onSubmit={(event) => submitPayout(event, false)}>
            <label>Hospital name<input required maxLength={160} autoComplete="organization" value={payout.hospital} onChange={(event) => setPayout({ ...payout, hospital: event.target.value })} /></label>
            <label>Fund request reference <span className="paga-optional">Optional</span><input maxLength={80} value={payout.fundRequestId} onChange={(event) => setPayout({ ...payout, fundRequestId: event.target.value })} placeholder="EF-1093" /></label>
            <label>Amount (NGN)<span className="paga-input-prefix">₦<input required type="number" min="100" max="5000000" step="1" inputMode="numeric" value={payout.amount} onChange={(event) => setPayout({ ...payout, amount: event.target.value, bankCode: payout.bankCode, accountNumber: payout.accountNumber })} /></span></label>
            <label>Paga destination bank UUID<input required maxLength={36} minLength={36} value={payout.bankCode} onChange={(event) => setPayout({ ...payout, bankCode: event.target.value })} placeholder="Bank identifier from Paga" /></label>
            <label>Hospital account number<input required type="password" inputMode="numeric" autoComplete="off" maxLength={10} minLength={10} value={payout.accountNumber} onChange={(event) => { setPayout({ ...payout, accountNumber: event.target.value.replace(/\D/g, "") }); setPayoutConfirmation(null); }} /></label>
            <button className="paga-primary" type="submit" disabled={busy}>{busy ? "Validating account…" : "Validate bank account"}</button>
          </form>}
          {payoutReference && <div className="paga-status-card"><div><strong>Hospital payout reference</strong><span>{payoutReference}</span></div><span className={`paga-status ${payoutStatus}`}>{payoutStatus}</span><button className="paga-secondary" type="button" onClick={checkPayoutStatus} disabled={busy}>Refresh payout status</button></div>}
          {payoutConfirmation?.accountName && <div className="paga-confirm-card"><div className="paga-confirm-heading"><CheckCircle2 size={17} /><span>Account name verified by Paga</span></div><strong>{payoutConfirmation.accountName}</strong><span>{payout.hospital} · account ending {payoutConfirmation.bankAccountLast4}</span><span>{formatNaira(Number(payout.amount))} NGN</span><button className="paga-primary" type="button" disabled={busy} onClick={() => submitPayout(undefined, true)}>{busy ? "Sending sandbox transfer…" : "Confirm sandbox payout"}</button></div>}
          <p className="paga-footnote"><LockKeyhole size={14} /> Only the final four account digits are stored. Payout APIs require an authenticated administrator role.</p>
        </section>
      </div>
      <footer className="paga-footer">Medrush · Emergency Fund <span>Sandbox environment · No real funds are transferred</span></footer>
    </main>
  </>;
}
