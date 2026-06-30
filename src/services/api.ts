/**
 * Single API service layer.
 *
 * ALL data in the app flows through this module. Each function has:
 *   1. A real-endpoint stub (commented) showing the eventual HTTP call.
 *   2. A mock implementation backed by services/mockData.ts.
 *
 * Flip USE_MOCK_DATA to `false` and fill in API_BASE_URL + the fetch stubs to
 * point at the real backend. NO UI CHANGES are required — screens and hooks
 * only ever import from here.
 */

import {
  ActivityReading,
  Alert,
  Barn,
  DailySummary,
  EnvReading,
  Farm,
  WeightReading,
} from '@/types';
import {
  acknowledgeMockAlert,
  getMockActivityReadings,
  getMockAlerts,
  getMockBarn,
  getMockDailySummaries,
  getMockEnvReadings,
  getMockFarm,
  getMockWeightReadings,
} from './mockData';

/**
 * MASTER SWITCH.
 * true  -> app runs entirely on the seeded mock dataset (demo / offline).
 * false -> app calls the real backend defined by API_BASE_URL below.
 */
export const USE_MOCK_DATA = true;

// TODO[BACKEND]: set from app config / env (e.g. process.env.EXPO_PUBLIC_API_URL)
export const API_BASE_URL = 'https://api.nesteye.ai/v1';

/** Simulated network latency so loading states are visible in the demo. */
const MOCK_LATENCY_MS = 350;

function delay<T>(value: T, ms: number = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * Thin authenticated fetch wrapper used by the real implementations.
 * TODO[BACKEND]: inject the auth token from the auth provider / SecureStore.
 */
async function authedFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${await getToken()}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Farm + barns
// ---------------------------------------------------------------------------
export async function getFarm(): Promise<Farm> {
  if (USE_MOCK_DATA) return delay(getMockFarm());
  // return authedFetch<Farm>('/farm');
  return authedFetch<Farm>('/farm');
}

export async function getBarn(barnId: string): Promise<Barn> {
  if (USE_MOCK_DATA) {
    const barn = getMockBarn(barnId);
    if (!barn) throw new Error(`Barn ${barnId} not found`);
    return delay(barn);
  }
  // return authedFetch<Barn>(`/barns/${barnId}`);
  return authedFetch<Barn>(`/barns/${barnId}`);
}

// ---------------------------------------------------------------------------
// Weight
// TODO[BACKEND]: replace with depth-camera volume->weight pipeline from edge device
// ---------------------------------------------------------------------------
export async function getWeightReadings(barnId: string): Promise<WeightReading[]> {
  if (USE_MOCK_DATA) return delay(getMockWeightReadings(barnId));
  // return authedFetch<WeightReading[]>(`/barns/${barnId}/weight`);
  return authedFetch<WeightReading[]>(`/barns/${barnId}/weight`);
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------
export async function getEnvReadings(barnId: string): Promise<EnvReading[]> {
  if (USE_MOCK_DATA) return delay(getMockEnvReadings(barnId));
  // return authedFetch<EnvReading[]>(`/barns/${barnId}/environment`);
  return authedFetch<EnvReading[]>(`/barns/${barnId}/environment`);
}

// ---------------------------------------------------------------------------
// Activity
// TODO[BACKEND]: replace with IR behavior-tracking output from edge device
// ---------------------------------------------------------------------------
export async function getActivityReadings(barnId: string): Promise<ActivityReading[]> {
  if (USE_MOCK_DATA) return delay(getMockActivityReadings(barnId));
  // return authedFetch<ActivityReading[]>(`/barns/${barnId}/activity`);
  return authedFetch<ActivityReading[]>(`/barns/${barnId}/activity`);
}

// ---------------------------------------------------------------------------
// Alerts
// TODO[BACKEND]: 'mortality' alerts <- IR motion-delta model
// TODO[BACKEND]: 'low_activity'/anomaly alerts <- activity/behavior anomaly model
// ---------------------------------------------------------------------------
export async function getAlerts(): Promise<Alert[]> {
  if (USE_MOCK_DATA) return delay(getMockAlerts());
  // return authedFetch<Alert[]>('/alerts');
  return authedFetch<Alert[]>('/alerts');
}

export async function acknowledgeAlert(alertId: string): Promise<Alert> {
  if (USE_MOCK_DATA) {
    const updated = acknowledgeMockAlert(alertId);
    if (!updated) throw new Error(`Alert ${alertId} not found`);
    return delay(updated, 150);
  }
  // return authedFetch<Alert>(`/alerts/${alertId}/ack`, { method: 'POST' });
  return authedFetch<Alert>(`/alerts/${alertId}/ack`, { method: 'POST' });
}

// ---------------------------------------------------------------------------
// Insights / reports
// ---------------------------------------------------------------------------
export async function getDailySummaries(barnId: string): Promise<DailySummary[]> {
  if (USE_MOCK_DATA) return delay(getMockDailySummaries(barnId));
  // return authedFetch<DailySummary[]>(`/barns/${barnId}/summaries`);
  return authedFetch<DailySummary[]>(`/barns/${barnId}/summaries`);
}
