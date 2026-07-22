import { serve } from "@hono/node-server";
import app from "./app.js";

const port = Number(process.env.PORT ?? 8788);
const hostname = process.env.HOST ?? "0.0.0.0";

serve({ fetch: app.fetch, port, hostname }, () => {
  console.log(`VU LMS API listening on http://${hostname}:${port}`);
});
