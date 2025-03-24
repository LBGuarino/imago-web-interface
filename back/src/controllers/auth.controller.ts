import { NextFunction, Request, Response } from "express";
import admin from "../lib/firebaseAdmin";
import getLocalUserService from "../services/user.service";
import rateLimit from 'express-rate-limit';

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 1000;

function getCookieOptions() {
  const options: any = {
    maxAge: SESSION_COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  };
  if (process.env.NODE_ENV === "production" && process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }
  return options;
}

export const refreshSessionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 solicitudes por ventana
  message: { error: 'Demasiadas solicitudes de refresh, por favor espere.' }
});

export default async function sessionLoginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ error: "Falta el token de autenticación" });
      return;
    }

    // Verificar el token y obtener claims antes de crear la cookie
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await admin.auth().getUser(decodedToken.uid);

    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn: SESSION_COOKIE_MAX_AGE });

    res
      .cookie("__session", sessionCookie, getCookieOptions())
      .status(200)
      .json({ 
        success: true,
        user: {
          email: user.email,
          admin: decodedToken.admin || false,
          approved: decodedToken.approved || false,
          email_verified: user.emailVerified,
          uid: user.uid,
          displayName: user.displayName
        }
      });
  } catch (error) {
    console.error("Error al autenticar el usuario:", error);
    res.status(401).json({ error: "Error al autenticar el usuario" });
  }
}

export async function refreshSessionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ error: "Falta el token de autenticación" });
      return;
    }
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn: SESSION_COOKIE_MAX_AGE });

    res.cookie("__session", sessionCookie, getCookieOptions());
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error de autenticación:", error);
    res.status(401).json({ error: "Sesión inválida" });
  }
}

export async function getUserController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionCookie = req.cookies["__session"];
    if (!sessionCookie) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const decodedToken = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true); // Usar verifySessionCookie en lugar de verifyIdToken

    const user = await admin.auth().getUser(decodedToken.uid);
    res.status(200).json({
      email: user.email,
      admin: decodedToken.admin || false,
      approved: decodedToken.approved || false,
      email_verified: user.emailVerified,
      uid: user.uid
    });

  } catch (error) {
    console.error("Error obteniendo datos del usuario:", error);
    res.status(401).json({ error: "Sesión inválida" });
  }
}

export async function getLocalUserController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: "Falta el token de autenticación" });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await getLocalUserService(decodedToken.uid);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error obteniendo datos del usuario:", error);
    res.status(401).json({ error: "Sesión inválida" });
  }
}

export async function checkAttributesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Lee la cookie de sesión directamente
    const sessionCookie = req.cookies["__session"];
    if (!sessionCookie) {
      res.status(401).json({ error: "No se proporcionó cookie de sesión." });
      return;
    }

    // Verifica la cookie con Firebase Admin
    const decodedToken = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);

    if (decodedToken.approved === true) {
      // Responde directamente con éxito, ya que este es el endpoint final
      res.status(200).json({ approved: true, user: decodedToken });
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
