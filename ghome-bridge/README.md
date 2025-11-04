ghome-bridge (PoC)

Google Smart Home fulfillment for virtual Gate and Garage devices, running on your Pi with HTTPS on port 443.

Endpoints
- HTTPS: port 443
- Fulfillment: https://ocvpn.no3.co.uk/fulfillment
- OAuth2 Authorization: https://ocvpn.no3.co.uk/oauth/authorize
- OAuth2 Token: https://ocvpn.no3.co.uk/oauth/token
- Health: https://ocvpn.no3.co.uk/healthz

Env vars
- PORT=443
- HOST=0.0.0.0
- CERT_PATH=/etc/letsencrypt/live/ocvpn.no3.co.uk/fullchain.pem
- KEY_PATH=/etc/letsencrypt/live/ocvpn.no3.co.uk/privkey.pem
- OAUTH_CLIENT_ID=ghome-bridge-client
- OAUTH_CLIENT_SECRET=ghome-bridge-secret
- AGENT_USER_ID=test-user
- SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' (optional, enables Report State)

Google Console (Smart Home project)
- Fulfillment URL: https://ocvpn.no3.co.uk/fulfillment
- Account Linking (OAuth, Auth Code):
  - Auth URL: https://ocvpn.no3.co.uk/oauth/authorize
  - Token URL: https://ocvpn.no3.co.uk/oauth/token
  - Client ID/Secret: match env vars
  - Redirect URIs: use the Google-provided URI
- Add your Google account as a tester, then link in the Home app.

Build and run on Pi
```bash
npm ci
npm run build
sudo env PORT=443 HOST=0.0.0.0 \
  CERT_PATH=/etc/letsencrypt/live/ocvpn.no3.co.uk/fullchain.pem \
  KEY_PATH=/etc/letsencrypt/live/ocvpn.no3.co.uk/privkey.pem \
  OAUTH_CLIENT_ID=ghome-bridge-client OAUTH_CLIENT_SECRET=ghome-bridge-secret \
  AGENT_USER_ID=your-google-user-id \
  node dist/index.js
```

Note: Binding to 443 requires root or CAP_NET_BIND_SERVICE.


