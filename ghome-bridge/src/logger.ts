import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  // Attach a request id for correlation
  const reqId = (req.headers["x-request-id"] as string) || randomUUID();
  (req as any)._reqId = reqId;

  // Shallow log of request
  const info = {
    reqId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    ua: req.headers["user-agent"],
    contentType: req.headers["content-type"],
  };
  try { console.log("REQ", JSON.stringify(info)); } catch {}

  res.on("finish", () => {
    const ms = Date.now() - start;
    const out = { reqId, status: res.statusCode, ms, length: res.getHeader("content-length") };
    try { console.log("RES", JSON.stringify(out)); } catch {}
  });

  next();
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const reqId = (req as any)._reqId;
  try { console.error("ERR", JSON.stringify({ reqId, message: err?.message, stack: err?.stack })); } catch {}
  if (!res.headersSent) res.status(500).json({ error: "internal", reqId });
}


