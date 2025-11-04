import fs from "fs";
import https from "https";
import express from "express";
import bodyParser from "body-parser";
import { createOauthRouter } from "./oauth";
import { createFulfillmentRouter } from "./fulfillment";
import { registry } from "./registry";

const PORT = parseInt(process.env.PORT || "443", 10);
const HOST = process.env.HOST || "0.0.0.0";
const CERT_PATH = process.env.CERT_PATH || "/etc/letsencrypt/live/ocvpn.no3.co.uk/fullchain.pem";
const KEY_PATH = process.env.KEY_PATH || "/etc/letsencrypt/live/ocvpn.no3.co.uk/privkey.pem";

// Basic sanity checks
if (!fs.existsSync(CERT_PATH) || !fs.existsSync(KEY_PATH)) {
  console.error("Certificate or key not found. Set CERT_PATH and KEY_PATH env vars.");
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");
app.use(bodyParser.json({ limit: "1mb" }));

// Health
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// OAuth
app.use("/oauth", createOauthRouter());

// Fulfillment
app.use("/fulfillment", createFulfillmentRouter());

// Warm up the in-memory registry with demo devices
registry.bootstrapDemoDevices();

const server = https.createServer({
  key: fs.readFileSync(KEY_PATH),
  cert: fs.readFileSync(CERT_PATH)
}, app);

server.listen(PORT, HOST, () => {
  console.log(`Google Smart Home bridge listening on https://${HOST}:${PORT}`);
});


