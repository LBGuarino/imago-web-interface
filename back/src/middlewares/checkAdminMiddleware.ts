import { Request, Response, NextFunction } from "express";
import admin from "../lib/firebaseAdmin";

export async function checkAdminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionCookie = req.cookies["__session"];
    if (!sessionCookie) {
      res.status(401).json({ error: "No se proporcionó cookie de sesión." });
      return;
    }

    const decodedToken = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);

    if (decodedToken.admin === true) {
      (req as any).user = decodedToken;
      next();
      return;
    } else {
      res
        .status(403)
        .json({ error: "No tienes permisos para realizar esta acción." });
      return;
    }
  } catch (error: any) {
    res.status(401).json({ error: "Cookie de sesión inválida." });
  }
}
