import { getRequestListener } from "@hono/node-server";
import app from "../apps/api/src/app";

// Node.js Vercel functions receive IncomingMessage/ServerResponse, not Web Request.
// hono/vercel's handle() hangs in that mode; getRequestListener bridges correctly.
export default getRequestListener(app.fetch);
