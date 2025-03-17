import { Request, Response, NextFunction } from 'express';
import admin from '../firebaseAdmin';

export async function verifyAdminController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionCookie = req.cookies.__session;
    if (!sessionCookie) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    
    if (!decodedToken.admin) {
      res.status(403).json({ error: 'No autorizado' });
      return;
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ error: 'Sesión inválida' });
  }
}