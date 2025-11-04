import express from "express";
import { randomUUID } from "crypto";

// Extremely simple in-memory OAuth for PoC
const codes = new Map<string, string>(); // code -> userId
const tokens = new Map<string, { userId: string; expiresAt: number }>(); // access_token -> data

const CLIENT_ID = process.env.OAUTH_CLIENT_ID || "ghome-bridge-client";
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || "ghome-bridge-secret";
const DEFAULT_USER = process.env.AGENT_USER_ID || "test-user";

export function createOauthRouter() {
  const router = express.Router();

  // Authorization endpoint (auto-approves for PoC)
  router.get("/authorize", (req, res) => {
    const { redirect_uri, state, client_id, response_type } = req.query as Record<string, string>;
    if (!redirect_uri || !client_id || response_type !== "code") {
      return res.status(400).send("invalid_request");
    }
    if (client_id !== CLIENT_ID) {
      return res.status(400).send("unauthorized_client");
    }
    const code = randomUUID();
    codes.set(code, DEFAULT_USER);
    const url = new URL(redirect_uri);
    url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);
    return res.redirect(url.toString());
  });

  // Token endpoint
  router.post("/token", express.urlencoded({ extended: false }), (req, res) => {
    const { grant_type } = req.body as Record<string, string>;

    if (grant_type === "authorization_code") {
      const { code, redirect_uri, client_id, client_secret } = req.body as Record<string, string>;
      if (!code || !redirect_uri || !client_id || !client_secret) {
        return res.status(400).json({ error: "invalid_request" });
      }
      if (client_id !== CLIENT_ID || client_secret !== CLIENT_SECRET) {
        return res.status(401).json({ error: "invalid_client" });
      }
      const userId = codes.get(code);
      if (!userId) return res.status(400).json({ error: "invalid_grant" });
      codes.delete(code);
      const accessToken = randomUUID();
      const expiresIn = 3600;
      tokens.set(accessToken, { userId, expiresAt: Date.now() + expiresIn * 1000 });
      return res.json({
        token_type: "bearer",
        access_token: accessToken,
        expires_in: expiresIn,
        refresh_token: randomUUID()
      });
    }

    if (grant_type === "refresh_token") {
      const accessToken = randomUUID();
      const expiresIn = 3600;
      tokens.set(accessToken, { userId: DEFAULT_USER, expiresAt: Date.now() + expiresIn * 1000 });
      return res.json({ token_type: "bearer", access_token: accessToken, expires_in: expiresIn });
    }

    return res.status(400).json({ error: "unsupported_grant_type" });
  });

  return router;
}


