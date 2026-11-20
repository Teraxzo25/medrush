import {
  ambulances,
  initialActivity,
  initialEmergencies,
  initialFunds,
  initialFundSettings,
  initialPayments,
  type AmbulanceUnit,
  type DemoActivity,
  type Emergency,
  type FundRequest,
  type FundSettings,
  type Payment,
} from "@/lib/medrush-data";

export const DEMO_WORKSPACE_VERSION = 1 as const;
export const DEMO_WORKSPACE_STORAGE_KEY = "medrush.demo.v1";

export type DemoWorkspaceState = {
  version: typeof DEMO_WORKSPACE_VERSION;
  emergencies: Emergency[];
  citizenRequestIds: string[];
  ambulances: AmbulanceUnit[];
  funds: FundRequest[];
  payments: Payment[];
  activity: DemoActivity[];
  settings: FundSettings;
};

export type CreateDemoEmergencyInput = Pick<Emergency, "name" | "phone" | "category" | "location">;

export function createInitialDemoWorkspaceState(): DemoWorkspaceState {
  return {
    version: DEMO_WORKSPACE_VERSION,
    emergencies: initialEmergencies.map((item) => ({ ...item })),
    citizenRequestIds: [],
    ambulances: ambulances.map((item) => ({ ...item })),
    funds: initialFunds.map((item) => ({ ...item })),
    payments: initialPayments.map((item) => ({ ...item })),
    activity: initialActivity.map((item) => ({ ...item })),
    settings: { ...initialFundSettings },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEmergency(value: unknown): value is Emergency {
  if (!isRecord(value)) return false;
  return ["id", "name", "phone", "category", "location", "status", "created"]
    .every((key) => typeof value[key] === "string") && typeof value.verified === "boolean";
}

function isObjectArray(value: unknown) {
  return Array.isArray(value) && value.every(isRecord);
}

export function parseDemoWorkspaceState(value: string | null): DemoWorkspaceState | null {
  if (!value) return null;

  try {
    const candidate: unknown = JSON.parse(value);
    if (!isRecord(candidate) || candidate.version !== DEMO_WORKSPACE_VERSION) return null;
    if (!Array.isArray(candidate.emergencies) || !candidate.emergencies.every(isEmergency)) return null;
    if (!Array.isArray(candidate.citizenRequestIds) || !candidate.citizenRequestIds.every((id) => typeof id === "string")) return null;
    if (!isObjectArray(candidate.ambulances) || !isObjectArray(candidate.funds) || !isObjectArray(candidate.payments) || !isObjectArray(candidate.activity)) return null;
    if (!isRecord(candidate.settings)) return null;
    return candidate as DemoWorkspaceState;
  } catch {
    return null;
  }
}

export function nextEmergencyId(emergencies: Emergency[]) {
  const highestId = emergencies.reduce((highest, emergency) => {
    const value = Number.parseInt(emergency.id.replace(/^MR-/, ""), 10);
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 24081);

  return `MR-${highestId + 1}`;
}
