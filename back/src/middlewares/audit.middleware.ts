// middlewares/auditMiddleware.ts
import { Request, Response, NextFunction } from "express";
import auditLogger from "../utils/audit.logger";

export const auditMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Supongamos que ya tienes un mecanismo de autenticación y el usuario se almacena en req.user
  const user = req.user || { uid: "anonimo" };

  // Define qué datos quieres loguear. En este ejemplo se registran método, URL, usuario y cuerpo (sin datos sensibles)
  const logEntry = {
    user: typeof user === "object" ? (user as any).uid : user,
    method: req.method,
    url: req.originalUrl,
    // Filtra el cuerpo si contiene información sensible
    body: { ...req.body },
    timestamp: new Date().toISOString(),
  };

  auditLogger.info(logEntry);
  next();
};
