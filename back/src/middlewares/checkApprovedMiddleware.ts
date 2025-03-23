import { Request, Response, NextFunction } from "express";
import admin from "../lib/firebaseAdmin";

export async function checkApprovedMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extraer la cookie __session
    const sessionCookie = req.cookies?.__session;
    if (!sessionCookie) {
      res.status(401).json({ error: "No se proporcionó cookie de sesión." });
      return;
    }

    // Verificar y decodificar la cookie de sesión con Firebase Admin
    const decodedToken = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);

    // Verificar que el custom claim 'approved' esté en true
    if (!decodedToken.approved) {
      res.status(403).json({
        error: "El usuario no está aprobado para acceder a este recurso.",
      });
      return;
    }

    // Guardar el token decodificado en req.user para uso posterior
    (req as any).user = decodedToken;

    next();
  } catch (error: any) {
    console.error("Error en checkApprovedMiddleware:", error);
    res
      .status(401)
      .json({ error: "Cookie de sesión inválida o error en la verificación." });
    return;
  }
}
