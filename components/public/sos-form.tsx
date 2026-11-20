"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Activity, Ambulance, ArrowLeft, ArrowRight, Check, HeartPulse, MapPin, Navigation, Phone, ShieldCheck, Siren, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { useDemoWorkspace } from "@/lib/demo-workspace";
import { cn } from "@/lib/utils";

const emergencyTypes = [
  { label: "Road traffic crash", detail: "A collision or road injury", icon: Ambulance },
  { label: "Pregnancy or childbirth", detail: "Urgent maternity support", icon: HeartPulse },
  { label: "Minor injury or illness", detail: "Sudden illness or injury", icon: Activity },
  { label: "Elderly patient", detail: "An older adult needs help", icon: UserRound },
];

type LocationState = "idle" | "loading" | "error" | "success";

export function SOSForm() {
  const router = useRouter();
  const { createEmergency } = useDemoWorkspace();
  const [isNavigating, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ category: "", name: "", phone: "", location: "" });
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [locationError, setLocationError] = useState("");

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationState("error");
      setLocationError("This browser cannot access device location. Enter a nearby road, landmark, or building instead.");
      return;
    }

    setLocationState("loading");
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latitude = `${Math.abs(coords.latitude).toFixed(5)}° ${coords.latitude >= 0 ? "N" : "S"}`;
        const longitude = `${Math.abs(coords.longitude).toFixed(5)}° ${coords.longitude >= 0 ? "E" : "W"}`;
        setForm((current) => ({ ...current, location: `${latitude}, ${longitude}` }));
        setLocationState("success");
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? "Location access is blocked for this site. Check the browser permission, or enter a nearby landmark."
          : error.code === error.POSITION_UNAVAILABLE
            ? "Your device could not find a location. Turn on Location Services, or enter a nearby landmark."
            : error.code === error.TIMEOUT
              ? "Finding your location took too long. Try again, or enter a nearby landmark."
              : "Your location is unavailable right now. Enter a nearby landmark to continue.";
        setLocationState("error");
        setLocationError(message);
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 30000 },
    );
  };

  const submitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = createEmergency({
      name: form.name.trim(),
      phone: form.phone.trim(),
      category: form.category,
      location: form.location.trim(),
    });
    startTransition(() => router.push(`/requests/${id}?created=1`));
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-8">
      <Link className="inline-flex min-h-11 items-center gap-2 rounded-med-sm pr-3 text-sm font-bold text-med-body outline-none hover:text-med-ink focus-visible:ring-3 focus-visible:ring-med-accent/25" href="/">
        <ArrowLeft aria-hidden="true" size={17} /> Back home
      </Link>

      <div className="mt-5 grid overflow-hidden rounded-med-md border border-med-border bg-med-surface lg:grid-cols-[minmax(280px,.72fr)_minmax(0,1.28fr)]">
        <aside className="flex flex-col justify-between bg-med-accent p-7 text-med-on-accent sm:p-9 lg:p-11">
          <div>
            <span className="grid size-12 place-items-center rounded-med-md bg-med-on-accent/12"><Siren aria-hidden="true" size={23} /></span>
            <h1 className="mt-8 max-w-sm text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl">Tell us where help should begin.</h1>
            <p className="mt-4 max-w-sm leading-7 text-med-on-accent/80">Two short steps collect the issue, a contact number, and a location. No account or password is needed.</p>
          </div>
          <div className="mt-10 grid gap-4 border-t border-med-on-accent/20 pt-7 text-sm">
            <p className="flex items-start gap-3"><ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0" size={17} /><span>Details stay in this browser tab for the demonstration.</span></p>
            <p className="flex items-start gap-3"><Phone aria-hidden="true" className="mt-0.5 shrink-0" size={17} /><span>For a real emergency, call your local emergency number.</span></p>
          </div>
        </aside>

        <section className="p-6 sm:p-9 lg:p-11" aria-labelledby="sos-step-title">
          <div className="flex items-center gap-3" aria-label={`Step ${step} of 2`}>
            {[1, 2].map((item) => (
              <div className="flex flex-1 items-center gap-3" key={item}>
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold", item <= step ? "bg-med-accent text-med-on-accent" : "border border-med-border bg-med-canvas text-med-muted")}>
                  {item < step ? <Check aria-hidden="true" size={14} /> : item}
                </span>
                <span className={cn("hidden text-xs font-bold sm:block", item <= step ? "text-med-ink" : "text-med-muted")}>{item === 1 ? "What happened" : "Contact and location"}</span>
                {item === 1 && <span className="h-px flex-1 bg-med-border" />}
              </div>
            ))}
          </div>

          <form className="mt-9" onSubmit={submitRequest}>
            {step === 1 ? (
              <fieldset>
                <legend className="sr-only">Choose an emergency type</legend>
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.035em] text-med-ink" id="sos-step-title">What is happening?</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-med-body">Choose the closest match. You can continue without writing a detailed explanation.</p>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {emergencyTypes.map(({ label, detail, icon: Icon }) => {
                    const selected = form.category === label;
                    return (
                      <button className={cn("group flex min-h-24 items-center gap-4 rounded-med-md border p-4 text-left outline-none transition-[background-color,border-color,transform] duration-[var(--med-motion-base)] active:scale-[0.99] focus-visible:ring-3 focus-visible:ring-med-accent/25", selected ? "border-med-accent bg-med-success-soft" : "border-med-border bg-med-canvas hover:border-med-control-border hover:bg-med-subtle")} type="button" aria-pressed={selected} onClick={() => setForm((current) => ({ ...current, category: label }))} key={label}>
                        <span className={cn("grid size-10 shrink-0 place-items-center rounded-med-sm", selected ? "bg-med-accent text-med-on-accent" : "bg-med-surface text-med-accent")}><Icon aria-hidden="true" size={19} /></span>
                        <span className="min-w-0 flex-1"><strong className="block text-sm text-med-ink">{label}</strong><small className="mt-1 block leading-5 text-med-body">{detail}</small></span>
                        <span className={cn("grid size-6 place-items-center rounded-full border", selected ? "border-med-accent bg-med-accent text-med-on-accent" : "border-med-control-border text-transparent")}><Check aria-hidden="true" size={13} /></span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-8 flex justify-end">
                  <Button type="button" disabled={!form.category} onClick={() => setStep(2)}>Continue <ArrowRight aria-hidden="true" /></Button>
                </div>
              </fieldset>
            ) : (
              <div>
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.035em] text-med-ink" id="sos-step-title">Where should help go?</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-med-body">Add a reachable number and a nearby road, landmark, building, or device location.</p>
                </div>
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <FormField id="guest-name" label="Your name">
                    <input className={fieldClassName} id="guest-name" autoComplete="name" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" />
                  </FormField>
                  <FormField id="guest-phone" label="Phone number" hint="Use a number that can receive a call.">
                    <input className={fieldClassName} id="guest-phone" autoComplete="tel" inputMode="tel" type="tel" required value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="e.g. 0803 123 4567" aria-describedby="guest-phone-description" />
                  </FormField>
                  <FormField className="sm:col-span-2" id="guest-location" label="Pickup location" hint="A nearby landmark works if GPS is unavailable.">
                    <input className={fieldClassName} id="guest-location" autoComplete="street-address" required value={form.location} onChange={(event) => { setForm((current) => ({ ...current, location: event.target.value })); setLocationState("idle"); setLocationError(""); }} placeholder="Road, landmark, or building" aria-describedby="guest-location-description" />
                  </FormField>
                </div>
                <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <Button className="border-med-control-border bg-med-surface text-med-ink hover:bg-med-subtle" type="button" variant="outline" onClick={useCurrentLocation} disabled={locationState === "loading"}>
                    <Navigation aria-hidden="true" /> {locationState === "loading" ? "Finding location" : "Use current location"}
                  </Button>
                  {locationState === "success" && <p className="flex items-center gap-2 text-sm font-bold text-med-success" role="status"><MapPin aria-hidden="true" size={16} /> Location added</p>}
                </div>
                {locationState === "error" && <p className="mt-3 rounded-med-sm bg-med-error-soft px-4 py-3 text-sm leading-6 text-med-error" role="alert">{locationError}</p>}

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-med-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Button className="justify-center text-med-body hover:bg-med-subtle hover:text-med-ink" type="button" variant="ghost" onClick={() => setStep(1)}><ArrowLeft aria-hidden="true" /> Back</Button>
                  <Button className="min-h-13 justify-center bg-med-emergency px-5 text-med-on-accent hover:bg-med-emergency-hover focus-visible:border-med-emergency focus-visible:ring-med-emergency/25" type="submit" disabled={isNavigating}>
                    <Siren aria-hidden="true" /> {isNavigating ? "Recording request" : "Send SOS request"}
                  </Button>
                </div>
                <p className="mt-5 text-xs leading-5 text-med-muted">Submitting updates only the Medrush demonstration. It does not contact a driver, hospital, or emergency service.</p>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
