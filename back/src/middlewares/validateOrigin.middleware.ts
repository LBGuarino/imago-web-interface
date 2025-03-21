import { Request, Response, NextFunction } from "express";

export function validateOrigin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:3000";
  const origin = req.headers.origin;
  if (origin !== allowedOrigin) {
    return res.status(403).json({ error: "Origen no permitido" });
  }
  next();
}
