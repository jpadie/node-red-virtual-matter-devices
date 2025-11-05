import express from "express";
import { registry } from "./registry";
import { reportState } from "./homegraph";

export function createFulfillmentRouter() {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const body = req.body || {};
    const intent = body.inputs?.[0]?.intent;
    const requestId = body.requestId || "";
    const agentUserId = body.agentUserId || process.env.AGENT_USER_ID || "test-user";
    try { console.log("FULFILL:IN", JSON.stringify({ requestId, intent, hasBody: !!body })); } catch {}

    try {
      switch (intent) {
        case "action.devices.SYNC": {
          const devices = registry.listDevices().map(d => ({
            id: d.id,
            type: d.type,
            traits: d.traits,
            name: d.name,
            willReportState: d.willReportState,
            attributes: d.attributes,
            deviceInfo: d.deviceInfo
          }));
          const out = { requestId, payload: { agentUserId, devices } };
          try { console.log("FULFILL:OUT SYNC", JSON.stringify({ requestId, numDevices: devices.length })); } catch {}
          return res.json(out);
        }
        case "action.devices.QUERY": {
          const ids: string[] = body.inputs?.[0]?.payload?.devices?.map((d: any) => d.id) || [];
          const out: Record<string, any> = {};
          for (const id of ids) {
            const s = registry.getState(id);
            out[id] = s ? s : { online: false };
          }
          try { console.log("FULFILL:OUT QUERY", JSON.stringify({ requestId, ids })); } catch {}
          return res.json({ requestId, payload: { devices: out } });
        }
        case "action.devices.EXECUTE": {
          const commands = body.inputs?.[0]?.payload?.commands || [];
          const success: any[] = [];
          for (const c of commands) {
            const ids: string[] = c.devices?.map((d: any) => d.id) || [];
            for (const exec of c.execution || []) {
              if (exec.command === "action.devices.commands.OpenClose") {
                let percent = exec.params?.openPercent;
                if (typeof percent !== "number") {
                  percent = exec.params?.open ? 100 : 0;
                }
                for (const id of ids) {
                  registry.setOpenPercent(id, percent);
                  success.push({ ids: [id], status: "SUCCESS", states: registry.getState(id) });
                }
              }
            }
          }
          // Fire and forget report state
          reportState(agentUserId).catch(() => {});
          try { console.log("FULFILL:OUT EXECUTE", JSON.stringify({ requestId, updated: success.length })); } catch {}
          return res.json({ requestId, payload: { commands: success } });
        }
        case "action.devices.DISCONNECT": {
          return res.status(200).send("");
        }
        default:
          return res.status(400).json({ error: "unsupported_intent" });
      }
    } catch (e) {
      console.error(e);
      try { console.error("FULFILL:ERR", JSON.stringify({ requestId, message: (e as any)?.message })); } catch {}
      return res.status(500).json({ requestId, error: "internal" });
    }
  });

  return router;
}


