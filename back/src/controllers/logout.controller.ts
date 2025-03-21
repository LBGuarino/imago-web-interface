// controllers/logout.controller.ts
import { Request, Response, NextFunction } from "express";
import admin from "../lib/firebaseAdmin";

function getCookieOptions() {
  const options: any = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };
  if (process.env.NODE_ENV === "production" && process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }
  return options;
}

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionCookie = req.cookies["__session"];

    if (sessionCookie) {
      // 1. Verificar y revocar los tokens de refresco
      const decodedToken = await admin
        .auth()
        .verifySessionCookie(sessionCookie);
      await admin.auth().revokeRefreshTokens(decodedToken.sub);
      console.log(`Tokens revocados para usuario: ${decodedToken.sub}`);
    }
  } catch (error) {
    console.error("Error durante la revocación de tokens:", error);
    // No interrumpimos el flujo, seguimos con la limpieza de la cookie
  }

  // 2. Limpiar la cookie de sesión
  try {
    res.clearCookie("__session", getCookieOptions());
  } catch (error) {
    console.error("Error limpiando cookie:", error);
  }

  // 3. Responder al cliente
  res.status(200).json({
    success: true,
    message: "Sesión cerrada correctamente",
  });
}
