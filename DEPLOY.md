# Free deploy: Vercel API + Android APK

Render often asks for a card. Use **Vercel Hobby** instead (no card for free hobby).

## 1. Deploy backend (Vercel — free, no card)

1. Push this repo to GitHub.
2. Sign up at [vercel.com](https://vercel.com) with GitHub (Hobby plan).
3. **Add New Project** → import `vu-lms`.
4. Leave **Root Directory** as the repo root (uses [`vercel.json`](./vercel.json) + [`api/index.ts`](./api/index.ts)).
5. Framework Preset: **Other** (or leave default).
6. Deploy.
7. Open `https://YOUR-PROJECT.vercel.app/health`  
   Expected: `{ "ok": true, "service": "vu-lms-api" }`.

Copy your URL (example: `https://vu-lms-xxxx.vercel.app`).

Then update:

- [`apps/mobile/eas.json`](./apps/mobile/eas.json) → `env.EXPO_PUBLIC_API_URL` (preview + production)
- [`apps/mobile/.env`](./apps/mobile/.env) (from `.env.example`) for local Expo pointing at prod API

### CLI alternative

```bash
npm i -g vercel
cd /path/to/vu-lms
vercel login
vercel
# production:
vercel --prod
```

### Notes

- Serverless: in-memory seed data resets on cold starts (fine for demos).
- First request after idle can be a bit slow; usually faster than Render free sleep.

### If Vercel is blocked

- **Cloudflare Workers** (free) — Hono-compatible; can be added later.
- Keep local API + Expo Go for development (`pnpm dev:api`).

## 2. Point the app at the API

```bash
cd apps/mobile
cp .env.example .env
# Edit .env:
# EXPO_PUBLIC_API_URL=https://YOUR-PROJECT.vercel.app
```

Also set the same URL in `eas.json` under `build.preview.env` and `build.production.env` before building the APK.

## 3. Build Android APK (Expo EAS — free tier)

```bash
cd apps/mobile
npx eas login
npx eas build:configure   # once, if prompted
npx eas build -p android --profile preview
```

- Profile `preview` builds an **APK**.
- Download from the Expo dashboard → install on Android (allow unknown sources).

Demo login: `bc230201247` / `password123`

## 4. Local check before APK

```bash
pnpm dev:api      # http://localhost:8788
pnpm dev:mobile
```
