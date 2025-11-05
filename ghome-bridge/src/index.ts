import fs from "fs";
import https from "https";
import express from "express";
import bodyParser from "body-parser";
import { createOauthRouter } from "./oauth";
import { createFulfillmentRouter } from "./fulfillment";
import { registry } from "./registry";
import { requestLogger, errorHandler } from "./logger";

const PORT = parseInt(process.env.PORT || "443", 10);
const PORTS = (process.env.PORTS || "")
  .split(",")
  .map(p => p.trim())
  .filter(p => p.length > 0)
  .map(p => parseInt(p, 10))
  .filter(n => Number.isFinite(n) && n > 0);
const HOST = process.env.HOST || "0.0.0.0";
const CERT_PATH = process.env.CERT_PATH || "/etc/letsencrypt/live/ocvpn.no3.co.uk/fullchain.pem";
const KEY_PATH = process.env.KEY_PATH || "/etc/letsencrypt/live/ocvpn.no3.co.uk/privkey.pem";

// Basic sanity checks
if (!fs.existsSync(CERT_PATH) || !fs.existsSync(KEY_PATH)) {
  console.error("Certificate or key not found. Set CERT_PATH and KEY_PATH env vars.");
  process.exit(1);
}

const app = express();
app.set("trust proxy", true);
process.on("uncaughtException", (e) => { try { console.error("uncaughtException", e); } catch {} });
process.on("unhandledRejection", (e) => { try { console.error("unhandledRejection", e); } catch {} });
app.disable("x-powered-by");
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(requestLogger);

// Health
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// Root footprint for quick diagnostics
app.get("/", (_req, res) => {
  res.status(200).json({
    name: "ghome-bridge",
    routes: ["/", "/healthz", "/oauth/authorize", "/oauth/token", "/fulfillment"],
    time: new Date().toISOString(),
  });
});

// OAuth
app.use("/oauth", createOauthRouter());

// Fulfillment
app.use("/fulfillment", createFulfillmentRouter());

// Warm up the in-memory registry with demo devices
registry.bootstrapDemoDevices();

const servers: Array<{port: number; server: https.Server}> = [];
const portsToUse = PORTS.length > 0 ? PORTS : [PORT];

for (const p of portsToUse) {
  const server = https.createServer({
    key: fs.readFileSync(KEY_PATH),
    cert: fs.readFileSync(CERT_PATH)
  }, app);
  server.listen(p, HOST, () => {
    console.log(`Google Smart Home bridge listening on https://${HOST}:${p}`);
    console.log(`CERT_PATH=${CERT_PATH} KEY_PATH=${KEY_PATH}`);
  });
  servers.push({ port: p, server });
}

// Final error handler
app.use(errorHandler);


