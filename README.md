# VU VULMS Mobile App

Expo + React Native mobile client and own Hono backend for Virtual University LMS.

## Quick start

```bash
pnpm install
pnpm dev:api      # http://localhost:8788
pnpm dev:mobile  # Expo
```

Demo login: **bc230201247** / **password123**

## Structure

- `apps/mobile` — Expo Router app
- `apps/api` — Hono REST API + seed data + VULMS bridge stub
- `packages/shared` — Zod schemas and shared types
- `api/` — Vercel serverless entry (free deploy)

## Free deploy (API + APK)

**Backend:** [Vercel Hobby](https://vercel.com) (no card) — see **[DEPLOY.md](./DEPLOY.md)**  
**APK:** `eas build -p android --profile preview`

Render is optional (often requires a card). Prefer Vercel.
