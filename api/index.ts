import { handle } from "hono/vercel";
// Generated at build time by scripts/bundle-vercel-api.mjs
import app from "./_app.bundle.mjs";

export const config = {
  runtime: "nodejs",
  maxDuration: 60,
};

const handler = handle(app);

export default handler;
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
