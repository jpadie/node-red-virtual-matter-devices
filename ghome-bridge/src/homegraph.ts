import { GoogleAuth } from "google-auth-library";
import { registry } from "./registry";

// Optional Report State. Enabled if SERVICE_ACCOUNT_JSON is set
const SERVICE_ACCOUNT_JSON = process.env.SERVICE_ACCOUNT_JSON || process.env.GHOME_SERVICE_ACCOUNT_JSON;

export async function reportState(agentUserId: string) {
  try {
    if (!SERVICE_ACCOUNT_JSON) return; // disabled
    const credentials = JSON.parse(SERVICE_ACCOUNT_JSON);
    const auth = new GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/homegraph"] });
    const client = await auth.getClient();
    const url = "https://homegraph.googleapis.com/v1/devices:reportStateAndNotification";

    const devicesState: Record<string, any> = {};
    for (const d of registry.listDevices()) {
      const s = registry.getState(d.id);
      if (s) devicesState[d.id] = s;
    }
    const payload = {
      requestId: `${Date.now()}`,
      agentUserId,
      payload: { devices: { states: devicesState } }
    };
    await client.request({ url, method: "POST", data: payload });
  } catch (e) {
    console.warn("reportState failed:", e);
  }
}


