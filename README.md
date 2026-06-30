# Nesteye Mobile App

> "AI + Hardware for Smarter Poultry Health"

## Overview

Nesteye is an edge-AI hardware + software system that watches commercial broiler
barns 24/7 via overhead IR and depth cameras — detecting piling, estimating
flock weight, monitoring the environment, and flagging mortality and disease.

This mobile app is the **farmer's window into their barns** and the primary
alert channel. It surfaces flock health at a glance, streams live camera views,
tracks weight and uniformity, monitors environment and activity, and pushes
real-time alerts the moment something needs attention.

Built for commercial broiler farmers and farm operators.

## Tech Stack

- **React Native (Expo, managed workflow) + TypeScript**
- **React Navigation** — bottom tabs + native stack
- **Zustand** — global state (auth, preferences)
- **TanStack Query (React Query)** — all data fetching/caching
- **Single API service layer** (`services/api.ts`) backed by a mock adapter
  (`services/mockData.ts`); one flag `USE_MOCK_DATA` swaps mock → real
- **Expo Notifications** — push registration + handler (mock triggering)
- **react-native-gifted-charts** — trend charts & sparklines
- **Mock auth** — email/password, token in **SecureStore** (Firebase/Cognito-ready)
- **AsyncStorage / SecureStore** — local persistence

## Project Structure

```
App.tsx                      App entry: providers (QueryClient, SafeArea) + push init
src/
├── screens/                 One file per screen
│   ├── auth/                Login, SignUp, ForgotPassword (mock auth)
│   ├── HomeScreen.tsx       Dashboard: flock health, stat tiles, per-barn cards
│   ├── AlertsScreen.tsx     Newest-first alert feed + type/barn filter chips
│   ├── AlertDetailScreen.tsx Snapshot placeholder, acknowledge + view-live
│   ├── BarnDetailScreen.tsx Camera grid + Overview/Weight/Environment/Activity
│   ├── InsightsScreen.tsx   Daily summary, weight growth, mortality, share
│   └── SettingsScreen.tsx   Farm profile, barns, alert prefs, thresholds, account
├── components/              Reusable UI: Card, StatTile, AlertBadge, PrimaryButton,
│                            SectionHeader, TrendChart, Sparkline, EmptyState,
│                            LoadingState, ErrorState, StatusDot, SeverityPill, Screen
├── services/
│   ├── api.ts               THE single data layer. Mock + real-endpoint stubs.
│   ├── mockData.ts          Seeded, story-consistent operating-farm dataset
│   ├── auth.ts              Swappable auth provider (mock now)
│   ├── secureStorage.ts     Platform-aware secure storage (native + web)
│   └── notifications.ts     Expo push registration + mock alert trigger
├── theme/                   colors.ts, typography.ts, index (spacing/radius/shadow)
├── types/                   All domain models (Farm, Barn, Alert, readings, …)
├── navigation/              RootNavigator, TabNavigator, AuthNavigator, types
├── store/                   authStore.ts, preferencesStore.ts (Zustand)
└── hooks/                   queries.ts (React Query hooks), format.ts, confirm.ts
```

## Getting Started

**Prerequisites:** Node 20+ (required — the SDK 57 tooling does not support
Node 18), npm, and the Expo tooling (`npx expo` — no global install required).
For device testing, install **Expo Go** on your phone, or use an iOS Simulator /
Android Emulator. `engine-strict` is on, so `npm install` will fail fast on an
unsupported Node version.

```bash
npm install
npx expo start          # then press i / a, scan the QR in Expo Go, or press w for web
```

```bash
npm run typecheck       # tsc --noEmit
```

When the app opens, the login screen is pre-filled — just tap **Sign In**.

## Mock vs Real Data (IMPORTANT)

Every screen reads data through React Query hooks (`src/hooks/queries.ts`), which
call functions in **`src/services/api.ts`**. That file has a single master switch:

```ts
// src/services/api.ts
export const USE_MOCK_DATA = true;
```

- `true` → the app runs entirely on the seeded mock dataset (great for demos and
  offline use). The dataset is **internally consistent**: the alert feed matches
  barn states, environment/activity spikes line up with the alerts they trigger.
- `false` → the app calls the real backend.

### Pointing the app at the real backend

1. Set `USE_MOCK_DATA = false` in `src/services/api.ts`.
2. Set `API_BASE_URL` (top of `api.ts`) to your backend URL.
3. Each `api.ts` function already has the real `authedFetch(...)` call wired next
   to its mock branch — fill in / adjust the endpoint paths to match your API.
4. Swap the auth provider: in `src/services/auth.ts`, replace `mockAuthProvider`
   with a Firebase/Cognito implementation of the `AuthProvider` interface.
5. Register the device push token returned by `registerForPushNotifications()`
   with your backend so FCM/APNs can target it.

**No UI changes are required.** Screens, components, hooks, and stores never
import the mock layer directly — only `api.ts` does.

## Where Unfinished Models Plug In

Several capabilities are scaffolded with realistic mock data and a clearly marked
`// TODO[BACKEND]` so the real source drops in without touching the UI:

| Scaffolded feature  | api.ts function            | Real data source that replaces the mock        |
| ------------------- | -------------------------- | ----------------------------------------------- |
| Weight estimation   | `getWeightReadings()`      | depth-camera volume→weight pipeline             |
| Disease detection   | `getAlerts()` (anomaly)    | activity/behavior anomaly model                 |
| Gait / lameness     | _(future)_                 | depth pose model                                |
| Mortality           | `getAlerts()` (mortality)  | IR motion-delta model                           |
| Push notifications  | `services/notifications`   | FCM payload from backend                        |
| Auth                | `services/auth` provider   | Firebase Auth / Cognito                         |

Search the codebase for `TODO[BACKEND]` to find every plug-in point.

## Design System

Earthy, agricultural-tech, premium, calm — a trusted farm tool. (`src/theme/`)

**Colors**

| Token            | Hex       |
| ---------------- | --------- |
| background       | `#F5F0E8` |
| surface          | `#FFFFFF` |
| text primary     | `#3D4A35` |
| text secondary   | `#5C6B4F` |
| text muted       | `#7A8A6B` |
| accent (gold)    | `#8B7D5C` |
| success          | `#2E6B3E` |
| warning          | `#C99A2E` |
| danger           | `#8B2E2E` |
| border           | `#E8E4D9` |

**Typography:** one clean sans-serif (system; Inter-ready), two weights, large
bold numbers for key stats, generous whitespace, 12–16px rounded corners, soft
shadows.

## Roadmap

- **V1 (shipping):** piling alerts, mortality, environment, activity (IR-based).
- **V2:** depth-camera weight estimation, uniformity, catch-day prediction.
- **V3:** disease / gait diagnostics.

## License

Proprietary — Nesteye Inc. All rights reserved.
