# Free deploy: Render API + Android APK

## 1. Deploy backend (Render — free)

1. Push this repo to GitHub.
2. Sign up at [render.com](https://render.com) and connect GitHub.
3. **New → Blueprint** and select this repo (uses [`render.yaml`](./render.yaml)),  
   **or** **New → Web Service** → Docker → root [`Dockerfile`](./Dockerfile).
4. Plan: **Free**.
5. After deploy, open `https://YOUR-SERVICE.onrender.com/health`  
   Expected: `{ "ok": true, "service": "vu-lms-api" }`.

Notes:

- Free tier sleeps when idle; first request can take 30–60s.
- Service listens on `0.0.0.0` and `PORT` (set by Render).

Default service name in blueprint: `vu-lms-api` → URL like `https://vu-lms-api.onrender.com`.

If your URL differs, update:

- [`apps/mobile/eas.json`](./apps/mobile/eas.json) `preview` / `production` → `env.EXPO_PUBLIC_API_URL`
- [`apps/mobile/.env`](./apps/mobile/.env) for local Expo (copy from `.env.example`)

## 2. Point the app at the API

```bash
cd apps/mobile
cp .env.example .env
# Edit .env:
# EXPO_PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com
```

## 3. Build Android APK (Expo EAS — free tier)

```bash
cd apps/mobile
npx eas login
npx eas build:configure   # once, if prompted
npx eas build -p android --profile preview
```

- Profile `preview` builds an **APK** (`buildType: "apk"`).
- Download the APK from the Expo dashboard when the build finishes.
- On the phone: allow install from unknown sources → open the APK.

Demo login after install: `bc230201247` / `password123`

## 4. Local check before APK

```bash
# Terminal 1 — API
pnpm dev:api

# Terminal 2 — Expo (uses localhost / 10.0.2.2 unless .env is set)
pnpm dev:mobile
```
