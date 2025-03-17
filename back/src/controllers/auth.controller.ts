import { NextFunction, Request, Response } from "express";
import admin from "../firebaseAdmin";

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 1000;

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

        const sessionCookie = await admin.auth().createSessionCookie(idToken,
            { expiresIn: SESSION_COOKIE_MAX_AGE });
        res.cookie("__session", sessionCookie, {
            maxAge: SESSION_COOKIE_MAX_AGE,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
        });

        res.status(200).json({ success: true });
        return;
    } catch (error) {
        console.error("Error al autenticar el usuario:", error);
        res.status(500).json({
            error: "Error al autenticar el usuario",
        });
        return;
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

        const sessionCookie = await admin.auth().createSessionCookie(idToken,
            { expiresIn: SESSION_COOKIE_MAX_AGE });
            res.cookie("__session", sessionCookie, {
                maxAge: SESSION_COOKIE_MAX_AGE,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                path: "/",
            });
        
            res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error de autenticación:", error);
        res.status(401).json({ error: "Sesión inválida" });
    }
}