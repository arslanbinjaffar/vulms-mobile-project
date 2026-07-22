FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

ENV NODE_ENV=production
ENV HOST=0.0.0.0
EXPOSE 8788

CMD ["pnpm", "--filter", "@vu-lms/api", "start"]
