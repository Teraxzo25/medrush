"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Emergency, RequestStatus } from "@/lib/medrush-data";
import {
  createInitialDemoWorkspaceState,
  DEMO_WORKSPACE_STORAGE_KEY,
  nextEmergencyId,
  parseDemoWorkspaceState,
  type CreateDemoEmergencyInput,
  type DemoWorkspaceState,
} from "@/lib/demo-workspace-state";

type DemoWorkspaceContextValue = {
  ready: boolean;
  state: DemoWorkspaceState;
  citizenRequests: Emergency[];
  createEmergency: (input: CreateDemoEmergencyInput) => string;
  updateEmergencyStatus: (id: string, status: RequestStatus) => void;
  resetDemo: () => void;
};

const DemoWorkspaceContext = createContext<DemoWorkspaceContextValue | null>(null);

export function DemoWorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoWorkspaceState>(createInitialDemoWorkspaceState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restored = parseDemoWorkspaceState(window.sessionStorage.getItem(DEMO_WORKSPACE_STORAGE_KEY));
    if (restored) setState(restored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.sessionStorage.setItem(DEMO_WORKSPACE_STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const citizenRequests = state.citizenRequestIds
    .map((id) => state.emergencies.find((emergency) => emergency.id === id))
    .filter((emergency): emergency is Emergency => Boolean(emergency));

  const createEmergency = (input: CreateDemoEmergencyInput) => {
    const id = nextEmergencyId(state.emergencies);
    const emergency: Emergency = {
      id,
      ...input,
      status: "Incoming",
      created: "Just now",
      verified: false,
    };

    setState((current) => ({
      ...current,
      emergencies: [emergency, ...current.emergencies],
      citizenRequestIds: [id, ...current.citizenRequestIds],
      activity: [{ id: `activity-${Date.now()}`, message: `Incoming emergency · ${id}`, role: "Dispatch Centre" as const, page: "Emergency queue", time: "Just now" }, ...current.activity].slice(0, 20),
    }));

    return id;
  };

  const updateEmergencyStatus = (id: string, status: RequestStatus) => {
    setState((current) => ({
      ...current,
      emergencies: current.emergencies.map((emergency) => emergency.id === id ? { ...emergency, status } : emergency),
    }));
  };

  const resetDemo = () => {
    window.sessionStorage.removeItem(DEMO_WORKSPACE_STORAGE_KEY);
    setState(createInitialDemoWorkspaceState());
  };

  return (
    <DemoWorkspaceContext.Provider value={{ ready, state, citizenRequests, createEmergency, updateEmergencyStatus, resetDemo }}>
      {children}
    </DemoWorkspaceContext.Provider>
  );
}

export function useDemoWorkspace() {
  const value = useContext(DemoWorkspaceContext);
  if (!value) throw new Error("useDemoWorkspace must be used inside DemoWorkspaceProvider.");
  return value;
}
