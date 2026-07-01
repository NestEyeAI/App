# Nesteye API Reference

This document describes the HTTP API the Nesteye mobile app expects. It is
derived directly from the app's single data layer (`src/services/api.ts`) and
auth provider (`src/services/auth.ts`), plus the domain models in
`src/types/index.ts`.

> **Status:** The app currently runs against a seeded mock dataset
> (`USE_MOCK_DATA = true`). This spec defines the contract a real backend must
> implement so the flag can be flipped to `false` with **no UI changes**. Every
> response body below must serialize to the TypeScript types in
> `src/types/index.ts`.

---

## Base URL

```
https://api.nesteye.ai/v1
```

Configured as `API_BASE_URL` in `src/services/api.ts`.
For local/staging, override via `EXPO_PUBLIC_API_URL`.

## Authentication

All data endpoints require a **bearer token** obtained from the auth endpoints.

```
Authorization: Bearer <token>
Content-Type: application/json
```

The app stores the token in secure storage (Keychain/Keystore on native,
`localStorage` on web) and attaches it to every request via the `authedFetch`
wrapper. A `401` response should prompt the app to sign the user out.

## Conventions

- All requests and responses are JSON (`Content-Type: application/json`).
- Timestamps are ISO 8601 strings in UTC (e.g. `2026-06-30T14:00:00Z`).
- `date` fields (daily summaries) are ISO date strings (`YYYY-MM-DD`).
- Weights are in **grams**; temperature in **°C**; humidity in **%**;
  ammonia in **ppm**; activity index is **0–100**.
- List endpoints return a JSON array (not an envelope), ordered as noted.
- IDs are opaque strings.

## Error format

Any non-2xx status is treated as a failure. Recommended body:

```json
{
  "error": {
    "code": "not_found",
    "message": "Barn barn-9 not found"
  }
}
```

| Status | Meaning                                    |
| ------ | ------------------------------------------ |
| 400    | Invalid request / validation error         |
| 401    | Missing or invalid token (app signs out)    |
| 403    | Authenticated but not allowed               |
| 404    | Resource not found                          |
| 409    | Conflict                                    |
| 500    | Server error                                |

---

# Endpoints

## Auth

### POST /auth/login

Authenticate with email + password.

**Request**

```json
{ "email": "farmer@willowcreek.ag", "password": "••••••••" }
```

**Response `200`** — [`AuthSession`](#authsession)

```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "user-demo",
    "email": "farmer@willowcreek.ag",
    "name": "Farmer",
    "farmId": "farm-willow-creek"
  }
}
```

App source: `authProvider.signIn()`.

---

### POST /auth/register

Create an account.

**Request**

```json
{ "name": "Jordan Miller", "email": "jordan@farm.com", "password": "••••••••" }
```

**Response `200`** — [`AuthSession`](#authsession) (same shape as login).

App source: `authProvider.signUp()`.

---

### POST /auth/forgot-password

Trigger a password-reset email. Always returns `200` regardless of whether the
email exists (avoids account enumeration).

**Request**

```json
{ "email": "farmer@willowcreek.ag" }
```

**Response `204`** — no content.

App source: `authProvider.requestPasswordReset()`.

---

### POST /devices

Register the device push token so the backend can target it via FCM/APNs.

**Request**

```json
{ "expoPushToken": "ExponentPushToken[xxxxxxxx]", "platform": "ios" }
```

**Response `204`** — no content.

App source: `registerForPushNotifications()` in `src/services/notifications.ts`.

---

## Farm & Barns

### GET /farm

Return the authenticated user's farm, including its barns and cameras.

**Response `200`** — [`Farm`](#farm)

```json
{
  "id": "farm-willow-creek",
  "name": "Willow Creek Farms",
  "location": "Nacogdoches, TX",
  "subscriptionTier": "pro",
  "barns": [
    {
      "id": "barn-1",
      "name": "Barn 1",
      "birdCount": 24800,
      "flockAgeDays": 12,
      "status": "healthy",
      "targetCatchDay": 42,
      "cameras": [
        {
          "id": "barn-1-ir-1",
          "barnId": "barn-1",
          "type": "IR",
          "zone": "Zone A",
          "status": "online",
          "lastFrameUrl": null
        }
      ]
    }
  ]
}
```

App source: `getFarm()`.

---

### GET /barns/{barnId}

Return a single barn.

**Path params**

| Name     | Type   | Description   |
| -------- | ------ | ------------- |
| `barnId` | string | The barn ID   |

**Response `200`** — [`Barn`](#barn)
**Errors:** `404` if the barn does not exist.

App source: `getBarn(barnId)`.

---

## Metrics

### GET /barns/{barnId}/weight

Flock weight readings over the current cycle (one reading per day, oldest → newest).

**Response `200`** — [`WeightReading[]`](#weightreading)

```json
[
  {
    "barnId": "barn-1",
    "timestamp": "2026-06-19T14:00:00Z",
    "avgWeightG": 480,
    "minG": 402,
    "maxG": 558,
    "uniformityCV": 0.11,
    "birdsSampled": 142
  }
]
```

App source: `getWeightReadings(barnId)`.
**Backend note:** replaces the depth-camera volume→weight pipeline from the edge device.

---

### GET /barns/{barnId}/environment

Environmental readings (hourly, ~last 7 days, oldest → newest).

**Response `200`** — [`EnvReading[]`](#envreading)

```json
[
  {
    "barnId": "barn-1",
    "timestamp": "2026-06-30T13:00:00Z",
    "tempC": 23.4,
    "humidityPct": 62,
    "ammoniaPpm": 11.2
  }
]
```

App source: `getEnvReadings(barnId)`.

---

### GET /barns/{barnId}/activity

Flock activity index (hourly, ~last 7 days, oldest → newest, `0–100`).

**Response `200`** — [`ActivityReading[]`](#activityreading)

```json
[
  { "barnId": "barn-1", "timestamp": "2026-06-30T13:00:00Z", "activityIndex": 72 }
]
```

App source: `getActivityReadings(barnId)`.
**Backend note:** replaces IR behavior-tracking output from the edge device.

---

## Alerts

### GET /alerts

Return all alerts for the farm, **newest first**.

**Response `200`** — [`Alert[]`](#alert)

```json
[
  {
    "id": "alert-1",
    "barnId": "barn-1",
    "zone": "Zone C",
    "type": "piling",
    "severity": "danger",
    "message": "Piling event detected — birds crowding against wall. Intervention triggered.",
    "timestamp": "2026-06-30T09:00:00Z",
    "acknowledged": false,
    "snapshotUrl": null
  }
]
```

App source: `getAlerts()`.
**Backend notes:** `mortality` alerts come from the IR motion-delta model;
`low_activity`/anomaly alerts come from the activity/behavior anomaly model.

---

### POST /alerts/{alertId}/ack

Acknowledge an alert. Returns the updated alert.

**Path params**

| Name      | Type   | Description   |
| --------- | ------ | ------------- |
| `alertId` | string | The alert ID  |

**Request:** empty body.

**Response `200`** — [`Alert`](#alert) with `"acknowledged": true`.
**Errors:** `404` if the alert does not exist.

App source: `acknowledgeAlert(alertId)`.

---

## Insights / Reports

### GET /barns/{barnId}/summaries

Daily summaries for a barn (~last 14 days, oldest → newest).

**Response `200`** — [`DailySummary[]`](#dailysummary)

```json
[
  {
    "date": "2026-06-30",
    "barnId": "barn-1",
    "avgWeight": 480,
    "mortalityCount": 4,
    "alertsCount": 2,
    "activityTrend": -3.2
  }
]
```

App source: `getDailySummaries(barnId)`.

---

# Data Models

Source of truth: `src/types/index.ts`.

## Farm

| Field              | Type                                  | Notes                     |
| ------------------ | ------------------------------------- | ------------------------- |
| `id`               | string                                |                           |
| `name`             | string                                |                           |
| `location`         | string                                |                           |
| `subscriptionTier` | `"starter" \| "pro" \| "enterprise"`  |                           |
| `barns`            | [`Barn[]`](#barn)                     |                           |

## Barn

| Field            | Type                              | Notes                          |
| ---------------- | --------------------------------- | ------------------------------ |
| `id`             | string                            |                                |
| `name`           | string                            |                                |
| `birdCount`      | number                            |                                |
| `flockAgeDays`   | number                            | Current age of the flock       |
| `status`         | `"healthy" \| "watch" \| "alert"` | Roll-up health status          |
| `cameras`        | [`Camera[]`](#camera)             |                                |
| `targetCatchDay` | number                            | Planned catch/processing day   |

## Camera

| Field          | Type                    | Notes                                   |
| -------------- | ----------------------- | --------------------------------------- |
| `id`           | string                  |                                         |
| `barnId`       | string                  |                                         |
| `type`         | `"IR" \| "DEPTH"`       |                                         |
| `zone`         | string                  | e.g. `"Zone A"`                          |
| `status`       | `"online" \| "offline"` |                                         |
| `lastFrameUrl` | string \| null          | Signed snapshot URL, or `null`          |

## Alert

| Field          | Type                        | Notes                              |
| -------------- | --------------------------- | ---------------------------------- |
| `id`           | string                      |                                    |
| `barnId`       | string                      |                                    |
| `zone`         | string                      |                                    |
| `type`         | [`AlertType`](#alerttype)   |                                    |
| `severity`     | `"danger" \| "warning" \| "info"` |                              |
| `message`      | string                      | Human-readable description         |
| `timestamp`    | string (ISO)                |                                    |
| `acknowledged` | boolean                     |                                    |
| `snapshotUrl`  | string \| null              | Signed snapshot URL, or `null`     |

### AlertType

`"piling" | "mortality" | "high_temperature" | "low_activity" | "weight_anomaly" | "camera_offline" | "system_health"`

## WeightReading

| Field          | Type         | Notes                                 |
| -------------- | ------------ | ------------------------------------- |
| `barnId`       | string       |                                       |
| `timestamp`    | string (ISO) |                                       |
| `avgWeightG`   | number       | Flock average, grams                  |
| `minG`         | number       | Grams                                 |
| `maxG`         | number       | Grams                                 |
| `uniformityCV` | number       | Coefficient of variation (0.08–0.14)  |
| `birdsSampled` | number       |                                       |

## EnvReading

| Field         | Type         | Notes |
| ------------- | ------------ | ----- |
| `barnId`      | string       |       |
| `timestamp`   | string (ISO) |       |
| `tempC`       | number       | °C    |
| `humidityPct` | number       | %     |
| `ammoniaPpm`  | number       | ppm   |

## ActivityReading

| Field           | Type         | Notes         |
| --------------- | ------------ | ------------- |
| `barnId`        | string       |               |
| `timestamp`     | string (ISO) |               |
| `activityIndex` | number       | 0–100         |

## DailySummary

| Field            | Type         | Notes                         |
| ---------------- | ------------ | ----------------------------- |
| `date`           | string (ISO date) | `YYYY-MM-DD`             |
| `barnId`         | string       |                               |
| `avgWeight`      | number       | Grams                         |
| `mortalityCount` | number       |                               |
| `alertsCount`    | number       |                               |
| `activityTrend`  | number       | Delta vs previous day         |

## AuthUser

| Field    | Type   |
| -------- | ------ |
| `id`     | string |
| `email`  | string |
| `name`   | string |
| `farmId` | string |

## AuthSession

| Field   | Type                     |
| ------- | ------------------------ |
| `token` | string                   |
| `user`  | [`AuthUser`](#authuser)  |

## AlertPreferences

Client-side only (persisted locally via AsyncStorage; not currently synced to
the backend). Documented here for completeness — a future `GET/PUT
/preferences` could persist these server-side.

| Field                | Type    | Notes                 |
| -------------------- | ------- | --------------------- |
| `pilingEnabled`      | boolean |                       |
| `mortalityEnabled`   | boolean |                       |
| `environmentEnabled` | boolean |                       |
| `activityEnabled`    | boolean |                       |
| `systemEnabled`      | boolean |                       |
| `quietHoursEnabled`  | boolean |                       |
| `quietHoursStart`    | string  | `"22:00"`             |
| `quietHoursEnd`      | string  | `"06:00"`             |
| `tempHighC`          | number  | High-temp threshold   |
| `ammoniaHighPpm`     | number  | High-ammonia threshold|

---

# Endpoint Summary

| Method | Path                          | Returns             | App function            |
| ------ | ----------------------------- | ------------------- | ----------------------- |
| POST   | `/auth/login`                 | `AuthSession`       | `authProvider.signIn`   |
| POST   | `/auth/register`              | `AuthSession`       | `authProvider.signUp`   |
| POST   | `/auth/forgot-password`       | `204`               | `requestPasswordReset`  |
| POST   | `/devices`                    | `204`               | `registerForPushNotifications` |
| GET    | `/farm`                       | `Farm`              | `getFarm`               |
| GET    | `/barns/{barnId}`             | `Barn`              | `getBarn`               |
| GET    | `/barns/{barnId}/weight`      | `WeightReading[]`   | `getWeightReadings`     |
| GET    | `/barns/{barnId}/environment` | `EnvReading[]`      | `getEnvReadings`        |
| GET    | `/barns/{barnId}/activity`    | `ActivityReading[]` | `getActivityReadings`   |
| GET    | `/alerts`                     | `Alert[]`           | `getAlerts`             |
| POST   | `/alerts/{alertId}/ack`       | `Alert`             | `acknowledgeAlert`      |
| GET    | `/barns/{barnId}/summaries`   | `DailySummary[]`    | `getDailySummaries`     |

---

# Going Live

1. Set `USE_MOCK_DATA = false` in `src/services/api.ts`.
2. Set `API_BASE_URL` (or `EXPO_PUBLIC_API_URL`) to your backend.
3. Ensure every response matches the schemas above.
4. Replace `mockAuthProvider` in `src/services/auth.ts` with a real
   implementation of the `AuthProvider` interface (Firebase/Cognito).
5. Wire `authedFetch` to attach the stored bearer token.

No screen, component, hook, or store changes are required — they all read
through `src/services/api.ts`.
