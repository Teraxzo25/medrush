"use client";

import { useState, type FormEventHandler } from "react";
import {
  Activity,
  Ambulance,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  HeartPulse,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Siren,
  UserRound,
} from "lucide-react";

export type GuestEmergencyForm = {
  name: string;
  phone: string;
  relativeName: string;
  relativePhone: string;
  category: string;
  location: string;
  verified: boolean;
};

type GuestSOSFlowProps = {
  form: GuestEmergencyForm;
  onChange: (updates: Partial<GuestEmergencyForm>) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onStaffAccess: () => void;
  onLocationDetected: (latitude: number, longitude: number) => void;
};

const emergencyTypes = [
  { label: "Road traffic crash", detail: "A collision or road injury", icon: Ambulance },
  { label: "Pregnancy or childbirth", detail: "Urgent maternity support", icon: HeartPulse },
  { label: "Minor injury or illness", detail: "Sudden illness or injury", icon: Activity },
  { label: "Elderly patient", detail: "An older adult needs help", icon: UserRound },
];

const steps = ["Welcome", "What happened?", "Your details"];

export function GuestSOSFlow({ form, onChange, onSubmit, onStaffAccess, onLocationDetected }: GuestSOSFlowProps) {
  const [step, setStep] = useState(0);
  const [locationState, setLocationState] = useState<"idle" | "loading" | "error">("idle");
  const [locationError, setLocationError] = useState("");

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Your browser can’t access device location here. Open this page over HTTPS, or enter a nearby landmark.");
      setLocationState("error");
      return;
    }

    setLocationState("loading");
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latitude = `${Math.abs(coords.latitude).toFixed(5)}° ${coords.latitude >= 0 ? "N" : "S"}`;
        const longitude = `${Math.abs(coords.longitude).toFixed(5)}° ${coords.longitude >= 0 ? "E" : "W"}`;
        onChange({ location: `${latitude}, ${longitude}` });
        onLocationDetected(coords.latitude, coords.longitude);
        setLocationState("idle");
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? "Location permission is blocked. Allow location access for this site in your browser settings, then tap “Use my current location” again."
          : error.code === error.POSITION_UNAVAILABLE
            ? "Your device couldn’t determine its location. Turn on Location Services/GPS and try again, or enter a nearby landmark."
            : "Finding your location took too long. Check that Location Services/GPS is on and try again, or enter a nearby landmark.";
        setLocationError(message);
        setLocationState("error");
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
    );
  };

  return (
    <main className="guest-onboarding">
      <header className="guest-header">
        <a className="guest-brand" href="#welcome" aria-label="Medrush home">
          <span className="guest-brand-mark"><Activity size={21} /></span>
          <span><strong>medrush</strong><small>When every second matters.</small></span>
        </a>
        <button className="guest-staff-link" type="button" onClick={onStaffAccess}>Staff workspace <ArrowRight size={15} /></button>
      </header>

      <div className="guest-content" id="welcome">
        <nav className="guest-progress" aria-label="Emergency request progress">
          <ol>
            {steps.map((label, index) => (
              <li className={index === step ? "current" : index < step ? "complete" : ""} aria-current={index === step ? "step" : undefined} key={label}>
                <span className="guest-step-number">{index < step ? <Check size={13} /> : index + 1}</span>
                <span>{label}</span>
              </li>
            ))}
          </ol>
        </nav>

        <section className="guest-card" aria-labelledby="guest-step-title">
          <form className="guest-form" onSubmit={onSubmit}>
            {step === 0 && (
              <div className="guest-welcome-layout">
                <div className="guest-welcome-copy">
                  <span className="guest-eyebrow"><span className="guest-live-dot" /> AKWA IBOM · EMERGENCY SUPPORT</span>
                  <h1 id="guest-step-title">Help starts here.</h1>
                  <p>Tell us what&apos;s happening and where you are. You can ask for help without creating an account.</p>
                  <button className="guest-primary" type="button" onClick={() => setStep(1)}>Get emergency help <ArrowRight size={17} /></button>
                  <p className="guest-real-emergency">For a real emergency, call your local emergency number.</p>
                </div>
                <aside className="guest-welcome-aside" aria-label="How to request assistance">
                  <div className="guest-siren-icon"><Siren size={22} /></div>
                  <strong>A few details. No signup.</strong>
                  <span>Choose an issue, add a contact number and location to request assistance.</span>
                  <div className="guest-privacy-note"><ShieldCheck size={16} /><span>No password, profile or health history needed.</span></div>
                </aside>
              </div>
            )}

            {step === 1 && (
              <div className="guest-step-content">
                <div className="guest-step-heading">
                  <span className="guest-eyebrow">STEP 1 OF 2</span>
                  <h1 id="guest-step-title">What&apos;s happening?</h1>
                  <p>Choose the closest match. You can continue without explaining more.</p>
                </div>
                <fieldset className="guest-issue-fieldset">
                  <legend className="sr-only">Select an emergency type</legend>
                  <div className="guest-issue-grid">
                    {emergencyTypes.map(({ label, detail, icon: Icon }) => (
                      <button
                        className={`guest-issue-option ${form.category === label ? "selected" : ""}`}
                        type="button"
                        aria-pressed={form.category === label}
                        onClick={() => onChange({ category: label })}
                        key={label}
                      >
                        <span className="guest-issue-icon"><Icon size={19} /></span>
                        <span className="guest-issue-text"><strong>{label}</strong><small>{detail}</small></span>
                        <span className="guest-issue-check" aria-hidden="true">{form.category === label && <Check size={13} />}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="guest-step-actions">
                  <button className="guest-back" type="button" onClick={() => setStep(0)}><ArrowLeft size={15} /> Back</button>
                  <button className="guest-primary" type="button" disabled={!form.category} onClick={() => setStep(2)}>Continue <ArrowRight size={17} /></button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="guest-step-content">
                <div className="guest-step-heading">
                  <span className="guest-eyebrow">STEP 2 OF 2 · NO ACCOUNT NEEDED</span>
                  <h1 id="guest-step-title">Where should help go?</h1>
                  <p>Add a name, a number responders can reach and a nearby landmark or device location.</p>
                </div>
                <div className="guest-fields">
                  <label className="guest-field">Your name<input autoComplete="name" required value={form.name} onChange={(event) => onChange({ name: event.target.value })} placeholder="Full name" /></label>
                  <label className="guest-field">Phone number<input autoComplete="tel" inputMode="tel" type="tel" required value={form.phone} onChange={(event) => onChange({ phone: event.target.value, verified: false })} placeholder="e.g. 0803 123 4567" /></label>
                  <label className="guest-field guest-location-field">Pickup location<input autoComplete="street-address" required value={form.location} onChange={(event) => { onChange({ location: event.target.value }); setLocationState("idle"); setLocationError(""); }} placeholder="Road, landmark, or building" /></label>
                </div>
                <div className="guest-location-row">
                  <button className="guest-location-button" type="button" onClick={useCurrentLocation} disabled={locationState === "loading"}>
                    <Navigation size={15} /> {locationState === "loading" ? "Finding your location…" : "Use my current location"}
                  </button>
                  <span>Or enter a nearby landmark</span>
                </div>
                {locationState === "error" && <p className="guest-location-error" role="alert">{locationError}</p>}
                {form.location && locationState !== "error" && <p className="guest-location-success" aria-live="polite"><MapPin size={14} /> Location added to your request.</p>}

                <div className="guest-submit-area">
                  <button className="guest-back" type="button" onClick={() => setStep(1)}><ArrowLeft size={15} /> Back</button>
                  <button className="guest-sos-button" type="submit"><Siren size={19} /> Send SOS request</button>
                </div>
                <div className="guest-demo-disclaimer"><Phone size={15} /><p>This prototype only updates Medrush&apos;s demo views. It does not contact emergency services, drivers or hospitals.</p></div>
              </div>
            )}
          </form>
        </section>
        <footer className="guest-footer"><span><ShieldCheck size={14} /> No account or password required</span></footer>
      </div>
    </main>
  );
}

export function DemoSOSConfirmation({ requestId }: { requestId: string }) {
  return (
    <section className="guest-sos-confirmation" aria-labelledby="demo-sos-title" role="status" aria-live="polite">
      <div className="guest-confirmation-top">
        <span className="guest-confirmation-icon"><CheckCircle2 size={21} /></span>
        <div><span className="guest-eyebrow">REQUEST · {requestId}</span><h2 id="demo-sos-title">Your request has been recorded</h2></div>
      </div>
      <p>Your request has been added to the emergency response queue.</p>
      <div className="guest-demo-stages" aria-label="Demo request status">
        <span><CheckCircle2 size={15} /> Dispatch queue</span>
        <span><CheckCircle2 size={15} /> Responder board</span>
        <span><CheckCircle2 size={15} /> Hospital pre-alert</span>
      </div>
      <p className="guest-demo-warning">No real driver, hospital or emergency service has been contacted. For a real emergency, call your local emergency number.</p>
    </section>
  );
}
