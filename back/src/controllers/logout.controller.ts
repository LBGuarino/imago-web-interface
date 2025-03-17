// controllers/logout.controller.ts
import { Request, Response, NextFunction } from "express";
import admin from "../firebaseAdmin";

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionCookie = req.cookies.__session;
    
    if (sessionCookie) {
      // 1. Verificar y revocar los tokens de refresco
      const decodedToken = await admin.auth().verifySessionCookie(sessionCookie);
      await admin.auth().revokeRefreshTokens(decodedToken.sub);
      console.log(`Tokens revocados para usuario: ${decodedToken.sub}`);
    }
  } catch (error) {
    console.error("Error durante la revocación de tokens:", error);
    // No interrumpimos el flujo, seguimos con la limpieza de la cookie
  }

  // 2. Limpiar la cookie de sesión
  try {
    res.clearCookie("__session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: process.env.NODE_ENV === "production" ? ".tudominio.com" : "localhost",
      path: "/",
    });
  } catch (error) {
    console.error("Error limpiando cookie:", error);
  }

  // 3. Responder al cliente
  res.status(200).json({ 
    success: true,
    message: "Sesión cerrada correctamente" 
  });
}