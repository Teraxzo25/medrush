import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";
import { SOSForm } from "@/components/public/sos-form";

export const metadata: Metadata = {
  title: "Request Emergency Help | Medrush",
  description: "Create a demonstration emergency support request without an account.",
};

export default function SOSPage() {
  return <PublicShell><SOSForm /></PublicShell>;
}
