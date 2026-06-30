/**
 * Core domain models for the Nesteye platform.
 * These shapes are the contract between the UI and the API/mock layer.
 * Real backend responses must serialize to these types so no UI change is
 * needed when USE_MOCK_DATA is switched off.
 */

export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';

export type BarnStatus = 'healthy' | 'watch' | 'alert';

export type CameraType = 'IR' | 'DEPTH';
export type CameraStatus = 'online' | 'offline';

export type AlertType =
  | 'piling'
  | 'mortality'
  | 'high_temperature'
  | 'low_activity'
  | 'weight_anomaly'
  | 'camera_offline'
  | 'system_health';

export type AlertSeverity = 'danger' | 'warning' | 'info';

export interface Camera {
  id: string;
  barnId: string;
  type: CameraType;
  zone: string;
  status: CameraStatus;
  lastFrameUrl: string | null;
}

export interface Barn {
  id: string;
  name: string;
  birdCount: number;
  flockAgeDays: number;
  status: BarnStatus;
  cameras: Camera[];
  targetCatchDay: number;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  subscriptionTier: SubscriptionTier;
  barns: Barn[];
}

export interface Alert {
  id: string;
  barnId: string;
  zone: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: string; // ISO
  acknowledged: boolean;
  snapshotUrl: string | null;
}

export interface WeightReading {
  barnId: string;
  timestamp: string; // ISO
  avgWeightG: number;
  minG: number;
  maxG: number;
  uniformityCV: number; // coefficient of variation, 0.08–0.14 typical
  birdsSampled: number;
}

export interface EnvReading {
  barnId: string;
  timestamp: string; // ISO
  tempC: number;
  humidityPct: number;
  ammoniaPpm: number;
}

export interface ActivityReading {
  barnId: string;
  timestamp: string; // ISO
  activityIndex: number; // 0–100
}

export interface DailySummary {
  date: string; // ISO date
  barnId: string;
  avgWeight: number;
  mortalityCount: number;
  alertsCount: number;
  activityTrend: number; // delta vs previous day
}

/** Authenticated user (mock auth; real provider returns same shape). */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  farmId: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

/** Per-user alert + notification preferences. */
export interface AlertPreferences {
  pilingEnabled: boolean;
  mortalityEnabled: boolean;
  environmentEnabled: boolean;
  activityEnabled: boolean;
  systemEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "06:00"
  tempHighC: number;
  ammoniaHighPpm: number;
}
