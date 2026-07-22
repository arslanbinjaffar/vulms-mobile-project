# Free deploy: Vercel API + Android APK

Render often asks for a card. Use **Vercel Hobby** instead (no card for free hobby).

## 1. Deploy backend (Vercel — free, no card)

1. Push this repo to GitHub.
2. Sign up at [vercel.com](https://vercel.com) with GitHub (Hobby plan).
3. **Add New Project** → import `vu-lms`.
4. Framework Preset: **Other** (not Hono).
5. **Root Directory**: either leave blank (repo root) **or** set to `apps/api` — both are supported.
6. Deploy (build emits bundled `api/index.js` + `@vu-lms/shared` dist).
7. Open `https://YOUR-PROJECT.vercel.app/health`  
   Expected: `{ "ok": true, "service": "vu-lms-api" }`.

If the build fails looking for `apps/api/scripts/bundle-vercel-api.mjs`, pull latest (uses `../../scripts/...` when Root Directory is `apps/api`) and redeploy.

Copy your URL (example: `https://vu-lms-xxxx.vercel.app`).

Then update:

- [`apps/mobile/eas.json`](./apps/mobile/eas.json) → `env.EXPO_PUBLIC_API_URL` (preview + production)
- [`apps/mobile/.env`](./apps/mobile/.env) (from `.env.example`) for local Expo pointing at prod API

### GitHub Actions deploy

Workflows: [`.github/workflows/vercel-production.yml`](./.github/workflows/vercel-production.yml) (push to `main`) and [`vercel-preview.yml`](./.github/workflows/vercel-preview.yml).

Add these **GitHub repo secrets** (Settings → Secrets and variables → Actions):

| Secret | Where to get it |
|--------|-----------------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create |
| `VERCEL_ORG_ID` | After `vercel link`, from `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | Same file → `projectId` |

```bash
npm i -g vercel
cd /path/to/vu-lms
vercel login
vercel link   # pick existing vulms-mobile-project
# then open .vercel/project.json for orgId + projectId
```

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
- Local bundle check: `pnpm build:vercel-api` then `node -e "import('./api/index.js').then(m => console.log(!!m.GET))"`.
- In Vercel **Settings → General**: Framework = Other / None. Root Directory blank or `apps/api`.
- Clear **Output Directory** in Vercel (or leave empty) — this API has no static site; `vercel.json` sets `outputDirectory: null`.
- After changing root `package.json` deps, run `pnpm install` and commit `pnpm-lock.yaml` before redeploy (Vercel uses a frozen lockfile).

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
