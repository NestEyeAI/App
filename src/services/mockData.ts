/**
 * Mock data generator for Nesteye.
 *
 * Goal: a realistic, internally-consistent, operating-farm dataset so the app
 * demos convincingly. The alert feed matches barn states; environment/activity
 * spikes line up with the alerts they would trigger.
 *
 * Everything is seeded so demos are reproducible while still looking organic.
 *
 * TODO[BACKEND]: this entire module is replaced by live endpoints. The API
 * layer (services/api.ts) is the only consumer — see USE_MOCK_DATA there.
 */

import {
  ActivityReading,
  Alert,
  AlertSeverity,
  AlertType,
  Barn,
  Camera,
  DailySummary,
  EnvReading,
  Farm,
  WeightReading,
} from '@/types';

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32) — deterministic but organic-looking.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 20260630;
const rand = mulberry32(SEED);

/** Random float in [min, max]. */
function rng(min: number, max: number): number {
  return min + rand() * (max - min);
}
/** Random int in [min, max] inclusive. */
function rngInt(min: number, max: number): number {
  return Math.floor(rng(min, max + 1));
}
function pick<T>(arr: T[]): T {
  return arr[rngInt(0, arr.length - 1)];
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
// Fixed "now" so the dataset is reproducible across runs.
const NOW = new Date('2026-06-30T14:00:00Z').getTime();

const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F'];

// ---------------------------------------------------------------------------
// Cobb 500 broiler growth curve.
// ---------------------------------------------------------------------------
const COBB_ANCHORS: { day: number; g: number }[] = [
  { day: 0, g: 42 },
  { day: 7, g: 170 },
  { day: 14, g: 480 },
  { day: 21, g: 920 },
  { day: 28, g: 1450 },
  { day: 35, g: 2050 },
  { day: 42, g: 2700 },
];

/** Linearly interpolate the Cobb 500 target weight (grams) for a given day. */
export function cobbWeightForDay(day: number): number {
  if (day <= COBB_ANCHORS[0].day) return COBB_ANCHORS[0].g;
  const last = COBB_ANCHORS[COBB_ANCHORS.length - 1];
  if (day >= last.day) return last.g;
  for (let i = 0; i < COBB_ANCHORS.length - 1; i++) {
    const a = COBB_ANCHORS[i];
    const b = COBB_ANCHORS[i + 1];
    if (day >= a.day && day <= b.day) {
      const t = (day - a.day) / (b.day - a.day);
      return a.g + t * (b.g - a.g);
    }
  }
  return last.g;
}

// ---------------------------------------------------------------------------
// Barn definitions — different flock ages drive screen variety.
// One barn (barn-3) is intentionally "watch": sustained low activity + temp
// breach, so the disease-signal / environment demos light up.
// ---------------------------------------------------------------------------
interface BarnSeed {
  id: string;
  name: string;
  birdCount: number;
  flockAgeDays: number;
  scenario: 'healthy' | 'tempSpike' | 'lowActivity';
}

const BARN_SEEDS: BarnSeed[] = [
  { id: 'barn-1', name: 'Barn 1', birdCount: 24800, flockAgeDays: 12, scenario: 'healthy' },
  { id: 'barn-2', name: 'Barn 2', birdCount: 28200, flockAgeDays: 21, scenario: 'tempSpike' },
  { id: 'barn-3', name: 'Barn 3', birdCount: 21500, flockAgeDays: 33, scenario: 'lowActivity' },
  { id: 'barn-4', name: 'Barn 4', birdCount: 26900, flockAgeDays: 40, scenario: 'healthy' },
];

const TARGET_CATCH_DAY = 42;

function buildCameras(barnId: string, barnIndex: number): Camera[] {
  const irCount = rngInt(6, 8);
  const cams: Camera[] = [];
  for (let i = 0; i < irCount; i++) {
    cams.push({
      id: `${barnId}-ir-${i + 1}`,
      barnId,
      type: 'IR',
      zone: ZONES[i % ZONES.length],
      status: 'online',
      lastFrameUrl: null, // TODO[BACKEND]: signed snapshot URL from edge device
    });
  }
  for (let i = 0; i < 2; i++) {
    cams.push({
      id: `${barnId}-depth-${i + 1}`,
      barnId,
      type: 'DEPTH',
      zone: ZONES[i % ZONES.length],
      status: 'online',
      lastFrameUrl: null,
    });
  }
  // Exactly one offline camera in barn-2 to power the Camera Offline alert.
  if (barnIndex === 1) {
    cams[3].status = 'offline';
  }
  return cams;
}

function statusForScenario(scenario: BarnSeed['scenario']): Barn['status'] {
  if (scenario === 'lowActivity') return 'watch';
  if (scenario === 'tempSpike') return 'watch';
  return 'healthy';
}

// ---------------------------------------------------------------------------
// Build the farm.
// ---------------------------------------------------------------------------
function buildFarm(): Farm {
  const barns: Barn[] = BARN_SEEDS.map((seed, idx) => ({
    id: seed.id,
    name: seed.name,
    birdCount: seed.birdCount,
    flockAgeDays: seed.flockAgeDays,
    status: statusForScenario(seed.scenario),
    cameras: buildCameras(seed.id, idx),
    targetCatchDay: TARGET_CATCH_DAY,
  }));

  return {
    id: 'farm-willow-creek',
    name: 'Willow Creek Farms',
    location: 'Nacogdoches, TX',
    subscriptionTier: 'pro',
    barns,
  };
}

const FARM = buildFarm();

// ---------------------------------------------------------------------------
// WEIGHT — one reading/day over the flock's life, following Cobb 500 with
// small daily noise (+/- 2%).
// ---------------------------------------------------------------------------
function buildWeightReadings(): Record<string, WeightReading[]> {
  const byBarn: Record<string, WeightReading[]> = {};
  for (const seed of BARN_SEEDS) {
    const readings: WeightReading[] = [];
    for (let day = 0; day <= seed.flockAgeDays; day++) {
      const target = cobbWeightForDay(day);
      const noise = 1 + rng(-0.02, 0.02);
      const avg = Math.round(target * noise);
      const cv = rng(0.08, 0.14);
      const spread = avg * cv;
      readings.push({
        barnId: seed.id,
        // backfill from "now" so the latest reading is the current age
        timestamp: new Date(NOW - (seed.flockAgeDays - day) * DAY).toISOString(),
        avgWeightG: avg,
        minG: Math.round(avg - spread * 1.5),
        maxG: Math.round(avg + spread * 1.5),
        uniformityCV: Number(cv.toFixed(3)),
        birdsSampled: rngInt(80, 200),
      });
    }
    byBarn[seed.id] = readings;
  }
  return byBarn;
}

// ---------------------------------------------------------------------------
// ENVIRONMENT — hourly readings for the last 7 days.
// barn-2 gets a temperature spike (>30C) that triggers a High Temperature
// alert; occasional ammonia breaches (>25ppm) sprinkled in.
// ---------------------------------------------------------------------------
function buildEnvReadings(): Record<string, EnvReading[]> {
  const byBarn: Record<string, EnvReading[]> = {};
  const hours = 7 * 24;
  for (const seed of BARN_SEEDS) {
    const readings: EnvReading[] = [];
    for (let h = hours; h >= 0; h--) {
      const ts = NOW - h * HOUR;
      const hourOfDay = new Date(ts).getHours();
      // base temp follows a mild diurnal pattern
      const diurnal = Math.sin(((hourOfDay - 6) / 24) * Math.PI * 2);
      let temp = 23 + diurnal * 2 + rng(-1, 1);

      // tempSpike scenario: a clear breach ~30h ago
      if (seed.scenario === 'tempSpike' && h <= 32 && h >= 28) {
        temp = rng(30.5, 32.5);
      }

      let ammonia = rng(5, 20);
      // occasional ammonia breach in the oldest barn (more litter load)
      if (seed.flockAgeDays >= 38 && rand() < 0.03) {
        ammonia = rng(25, 30);
      }

      readings.push({
        barnId: seed.id,
        timestamp: new Date(ts).toISOString(),
        tempC: Number(temp.toFixed(1)),
        humidityPct: Number(rng(50, 70).toFixed(0)),
        ammoniaPpm: Number(ammonia.toFixed(1)),
      });
    }
    byBarn[seed.id] = readings;
  }
  return byBarn;
}

// ---------------------------------------------------------------------------
// ACTIVITY — hourly, diurnal (high in lit hours, low at night).
// barn-3 shows a sustained dip over the last ~36h -> Low Activity / disease.
// ---------------------------------------------------------------------------
function buildActivityReadings(): Record<string, ActivityReading[]> {
  const byBarn: Record<string, ActivityReading[]> = {};
  const hours = 7 * 24;
  for (const seed of BARN_SEEDS) {
    const readings: ActivityReading[] = [];
    for (let h = hours; h >= 0; h--) {
      const ts = NOW - h * HOUR;
      const hourOfDay = new Date(ts).getHours();
      // lit hours ~05:00–21:00 are higher
      const lit = hourOfDay >= 5 && hourOfDay <= 21;
      let base = lit ? rng(55, 85) : rng(15, 35);

      // sustained dip in barn-3 for the last 36h
      if (seed.scenario === 'lowActivity' && h <= 36) {
        base *= 0.55;
      }

      readings.push({
        barnId: seed.id,
        timestamp: new Date(ts).toISOString(),
        activityIndex: Number(Math.max(0, Math.min(100, base)).toFixed(0)),
      });
    }
    byBarn[seed.id] = readings;
  }
  return byBarn;
}

// ---------------------------------------------------------------------------
// ALERTS — ~15 across barns over the last 3 days, mixed severity & ack state,
// consistent with the scenarios above.
// ---------------------------------------------------------------------------
const ALERT_MESSAGES: Record<AlertType, string> = {
  piling: 'Piling event detected — birds crowding against wall. Intervention triggered.',
  mortality: 'Possible mortality detected — stationary bird flagged by IR motion-delta.',
  high_temperature: 'Temperature exceeded threshold (30°C+). Check ventilation.',
  low_activity: 'Sustained low activity detected — possible early disease signal.',
  weight_anomaly: 'Flock weight tracking below Cobb 500 target band.',
  camera_offline: 'Camera went offline — no frames received in last 10 min.',
  system_health: 'Edge device health check completed — all systems nominal.',
};

const SEVERITY_BY_TYPE: Record<AlertType, AlertSeverity> = {
  piling: 'danger',
  mortality: 'danger',
  high_temperature: 'warning',
  low_activity: 'warning',
  weight_anomaly: 'warning',
  camera_offline: 'info',
  system_health: 'info',
};

function buildAlerts(): Alert[] {
  // Curated, scenario-consistent spine of alerts.
  const spine: Array<{
    barnId: string;
    type: AlertType;
    hoursAgo: number;
    zone: string;
    acknowledged: boolean;
  }> = [
    { barnId: 'barn-1', type: 'piling', hoursAgo: 5, zone: 'Zone C', acknowledged: false },
    { barnId: 'barn-4', type: 'piling', hoursAgo: 20, zone: 'Zone B', acknowledged: true },
    { barnId: 'barn-3', type: 'mortality', hoursAgo: 9, zone: 'Zone E', acknowledged: false },
    { barnId: 'barn-2', type: 'high_temperature', hoursAgo: 30, zone: 'Zone A', acknowledged: true },
    { barnId: 'barn-2', type: 'high_temperature', hoursAgo: 31, zone: 'Zone D', acknowledged: false },
    { barnId: 'barn-3', type: 'low_activity', hoursAgo: 12, zone: 'Zone F', acknowledged: false },
    { barnId: 'barn-2', type: 'camera_offline', hoursAgo: 2, zone: 'Zone B', acknowledged: false },
    { barnId: 'barn-4', type: 'weight_anomaly', hoursAgo: 26, zone: 'Zone C', acknowledged: true },
    { barnId: 'barn-1', type: 'system_health', hoursAgo: 1, zone: 'Zone A', acknowledged: true },
    { barnId: 'barn-2', type: 'system_health', hoursAgo: 14, zone: 'Zone A', acknowledged: true },
    { barnId: 'barn-3', type: 'system_health', hoursAgo: 38, zone: 'Zone A', acknowledged: true },
    { barnId: 'barn-4', type: 'piling', hoursAgo: 48, zone: 'Zone D', acknowledged: true },
    { barnId: 'barn-1', type: 'low_activity', hoursAgo: 52, zone: 'Zone B', acknowledged: true },
    { barnId: 'barn-3', type: 'high_temperature', hoursAgo: 60, zone: 'Zone E', acknowledged: true },
    { barnId: 'barn-2', type: 'system_health', hoursAgo: 66, zone: 'Zone A', acknowledged: true },
  ];

  return spine
    .map((s, i) => {
      const ts = NOW - s.hoursAgo * HOUR;
      const alert: Alert = {
        id: `alert-${i + 1}`,
        barnId: s.barnId,
        zone: s.zone,
        type: s.type,
        severity: SEVERITY_BY_TYPE[s.type],
        message: ALERT_MESSAGES[s.type],
        timestamp: new Date(ts).toISOString(),
        acknowledged: s.acknowledged,
        snapshotUrl: null, // TODO[BACKEND]: signed snapshot URL from edge device
      };
      return alert;
    })
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

// ---------------------------------------------------------------------------
// DAILY SUMMARIES — last 14 days per barn, consistent with weight/alerts.
// ---------------------------------------------------------------------------
function buildDailySummaries(
  weights: Record<string, WeightReading[]>,
  alerts: Alert[]
): Record<string, DailySummary[]> {
  const byBarn: Record<string, DailySummary[]> = {};
  for (const seed of BARN_SEEDS) {
    const summaries: DailySummary[] = [];
    const days = Math.min(14, seed.flockAgeDays);
    for (let d = days; d >= 0; d--) {
      const date = new Date(NOW - d * DAY);
      const dayIso = date.toISOString().slice(0, 10);
      const flockDay = seed.flockAgeDays - d;
      const target = cobbWeightForDay(flockDay);
      const alertsCount = alerts.filter(
        (a) =>
          a.barnId === seed.id &&
          a.timestamp.slice(0, 10) === dayIso
      ).length;
      // small daily mortality, slightly higher for the watch barn
      const baseMortality = seed.scenario === 'lowActivity' ? rngInt(6, 18) : rngInt(1, 7);
      summaries.push({
        date: dayIso,
        barnId: seed.id,
        avgWeight: Math.round(target * (1 + rng(-0.02, 0.02))),
        mortalityCount: baseMortality,
        alertsCount,
        activityTrend: Number(rng(-8, 8).toFixed(1)),
      });
    }
    byBarn[seed.id] = summaries;
  }
  return byBarn;
}

// ---------------------------------------------------------------------------
// Assemble + freeze the dataset once.
// ---------------------------------------------------------------------------
const WEIGHTS = buildWeightReadings();
const ENV = buildEnvReadings();
const ACTIVITY = buildActivityReadings();
const ALERTS = buildAlerts();
const SUMMARIES = buildDailySummaries(WEIGHTS, ALERTS);

// Mutable copy of alerts so acknowledge() can flip state during a session.
let alertsState: Alert[] = ALERTS.map((a) => ({ ...a }));

// ---------------------------------------------------------------------------
// Public getters — consumed only by services/api.ts.
// ---------------------------------------------------------------------------
export function getMockFarm(): Farm {
  return FARM;
}

export function getMockBarn(barnId: string): Barn | undefined {
  return FARM.barns.find((b) => b.id === barnId);
}

export function getMockWeightReadings(barnId: string): WeightReading[] {
  return WEIGHTS[barnId] ?? [];
}

export function getMockEnvReadings(barnId: string): EnvReading[] {
  return ENV[barnId] ?? [];
}

export function getMockActivityReadings(barnId: string): ActivityReading[] {
  return ACTIVITY[barnId] ?? [];
}

export function getMockAlerts(): Alert[] {
  return alertsState.slice();
}

export function acknowledgeMockAlert(alertId: string): Alert | undefined {
  alertsState = alertsState.map((a) =>
    a.id === alertId ? { ...a, acknowledged: true } : a
  );
  return alertsState.find((a) => a.id === alertId);
}

export function getMockDailySummaries(barnId: string): DailySummary[] {
  return SUMMARIES[barnId] ?? [];
}

export { pick, ZONES };
