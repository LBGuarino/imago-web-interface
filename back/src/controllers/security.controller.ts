import { Request, Response, NextFunction } from 'express';
import { getFirestore } from 'firebase-admin/firestore';

export async function logSecurityEventController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { timestamp, event, userId, ipAddress, details } = req.body;

    // Validar datos requeridos
    if (!timestamp || !event) {
      res.status(400).json({ error: 'Datos de log incompletos' });
      return;
    }

    // Crear documento en Firestore
    const db = getFirestore();
    await db.collection('security_logs').add({
      timestamp: new Date(timestamp),
      event,
      userId,
      ipAddress,
      details,
      createdAt: new Date()
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al registrar evento de seguridad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
} 