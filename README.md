# Announcements — Mobile

React Native mobile app (Expo) for **Announcements**.

Part of [Chaowalit Greepoke](https://bookchaowalit.com)'s 101 Portfolio Projects.

## Tech Stack

- **Framework:** Expo SDK 53 + Expo Router
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based)
- **UI:** React Native + Ionicons

## Features

- **Announcement feed** (home tab): pinned items first, then by priority
  (urgent/normal/info) and newest; expired announcements are hidden.
- **Read tracking**: unread badge count, tap to open (marks read), "Mark all
  read", and an unread-only filter.
- **Category filter** chips.
- Announcements are bundled sample data (`lib/announcements.ts`); fetching
  from the web frontend's API is on the backlog.

## Getting Started

```bash
npm ci
npx expo start
```

## Validation

```bash
npm run validate   # expo lint + tsc --noEmit + vitest
npx expo export --platform android --output-dir dist   # bundle smoke check
```

Pure logic lives in `lib/` and is unit-tested with Vitest (`lib/*.test.ts`).
CI (`.github/workflows/build.yml`) runs all of the above and fails on errors;
the EAS preview build is owner-triggered (`workflow_dispatch`) and needs the
`EXPO_TOKEN` secret plus the committed `eas.json`.

## Build

```bash
# Android
npx eas build --platform android --profile preview

# iOS
npx eas build --platform ios --profile preview
```

## Related

- **Frontend:** [bookchaowalit-website/announcements-frontend](https://github.com/bookchaowalit-website/announcements-frontend)
- **Portfolio:** [bookchaowalit.com](https://bookchaowalit.com)

## License

MIT
