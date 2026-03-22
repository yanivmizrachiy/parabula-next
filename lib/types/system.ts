export type VerificationStatus = "מאומת" | "משוער" | "חסר" | "לא אומת" | "מיושן";
export type ReadinessState = "מוכן" | "חסום" | "אזהרה" | "תקין" | "דורש טיפול" | "מוכן לבדיקה";
export type ConnectivityState = "מחובר" | "לא מחובר" | "מחובר חלקית" | "חסר מידע";

export interface FactMeta {
  sourceType: "manual" | "repo" | "log" | "system";
  sourceName: string;
  collectedAt: string;
  verificationStatus: VerificationStatus;
  confidenceLevel: "high" | "medium" | "low";
}

export interface Device {
  id: string;
  displayName: string;
  role: string;
  operatingSystem: string;
  environmentType: string;
  knownNetworkEndpoints: string[];
  preferredConnectionMethod: string;
  agentStatus: ConnectivityState;
  apiStatus: ConnectivityState;
  sshStatus: ConnectivityState;
  healthSummary: string;
  blockers: string[];
  relatedRepositories: string[];
  relatedIntegrations: string[];
  notes: string[];
  lastSeen: string | null;
  lastVerifiedAt: string | null;
  readinessState: ReadinessState;
  verificationStatus: VerificationStatus;
  provenance: FactMeta;
}

export interface RepositoryState {
  id: string;
  name: string;
  priority: "high" | "support";
  role: string;
  verificationStatus: VerificationStatus;
  lastSyncAt: string | null;
  notes: string[];
}

export interface IntegrationState {
  id: string;
  name: string;
  connectionStatus: ConnectivityState;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string | null;
  blocker: string | null;
  notes: string[];
}

export interface SystemState {
  generatedAt: string;
  overallStatus: ReadinessState;
  mainBlockers: string[];
  devices: Device[];
  repositories: RepositoryState[];
  integrations: IntegrationState[];
}
