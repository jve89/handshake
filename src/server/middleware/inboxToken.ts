import { Request, Response, NextFunction } from "express";
import { verifyInboxToken, touchInboxToken } from "../services/tokenService";

export interface InboxScope {
  handshakeId?: number;
  receiverId?: number;
  token?: string;
}
declare module "express-serve-static-core" {
  interface Request {
    inbox?: InboxScope;
  }
}

function extractToken(req: Request): string | null {
  const h = req.headers.authorization;
  if (h && h.startsWith("Bearer ")) return h.slice(7);
  const q = (req.query.token as string) || "";
  return q || null;
}

export default async function inboxToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "Missing inbox token" });

  const v = await verifyInboxToken(token);
  if (!v.valid)
    return res.status(401).json({ error: v.reason || "Invalid token" });

  req.inbox = { handshakeId: v.handshakeId, receiverId: v.receiverId, token };
  await touchInboxToken(token).catch(() => {}); // non-blocking
  next();
}
