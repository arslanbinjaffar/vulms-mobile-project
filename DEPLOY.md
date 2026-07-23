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

Standalone APK (no Metro). API URL is baked in via `eas.json` → `EXPO_PUBLIC_API_URL=https://vulms-mobile-project-api.vercel.app`.

```bash
cd apps/mobile
# set EXPO_TOKEN (or eas login)
npx eas build -p android --profile preview --non-interactive
```

- Profile `preview` builds an **APK** (not a dev client).
- Latest build page: https://expo.dev/accounts/arslanjaffarpixelpks-team/projects/vu-lms/builds
- Install on Android (allow unknown sources).

Demo login: `bc230201247` / `password123`

## 4. Admin panel (Next.js on Vercel)

**Live admin:** https://vu-lms-admin.vercel.app  

Admin UI lives in [`apps/admin`](./apps/admin). It talks to:

`NEXT_PUBLIC_API_URL=https://vulms-mobile-project-api.vercel.app`

### Admin login

- Username: `admin`
- Password: `admin123`

### What admin manages

Admin is the source of truth for all student-facing LMS data: students, teachers, courses (+ details), announcements, assignments, quizzes, GDBs, lessons, activities, grade book, progress, mail, challans, lectures, todos, study scheme, course selection, student services, teacher evaluation, notes moderation, contact, notice count.

**Tracking:** activity feed, quiz attempts, login history, evaluation responses (written when students use the mobile app).

UI colors match the mobile app (`navy` / `purple` / `blue` from `apps/mobile/src/theme.ts`).

### Local

```bash
pnpm dev:api      # http://localhost:8788
pnpm dev:admin    # http://localhost:3001
```

Copy [`apps/admin/.env.example`](./apps/admin/.env.example) → `.env.local` and point at local or prod API.

### Redeploy admin

Vercel project: `vu-lms-admin` (Root Directory `apps/admin`).

```bash
# from repo root, with VERCEL_ORG_ID + VERCEL_PROJECT_ID for vu-lms-admin
vercel --prod
```

Or: **Add New Project** → import repo → Root `apps/admin` → Framework Next.js → env `NEXT_PUBLIC_API_URL` as above.

### API + database

- Current production API runs in **memory** mode until `DATABASE_URL` is set (seed data; cold starts can reset in-memory CRUD).
- With Neon Postgres: set `DATABASE_URL` on the **API** Vercel project (`vulms-mobile-project-api`), then once:

```bash
cd apps/api
pnpm db:push
pnpm seed-db
```

Redeploy the API after setting `DATABASE_URL` so admin CRUD and student GETs persist.

Demo student (mobile): `bc230201247` / `password123`

## 5. Local check before APK

```bash
pnpm dev:api      # http://localhost:8788
pnpm dev:mobile
```
