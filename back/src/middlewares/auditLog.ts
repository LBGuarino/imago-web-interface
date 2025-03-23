import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { User } from '../entities/User';

export const auditLog = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Capturar la respuesta original
    const originalSend = res.send;
    res.send = function (body: any): Response {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Registrar el acceso
        logger.info({
            type: 'AUDIT_LOG',
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: (req.user as User)?.uid,
            body: req.body,
            responseSize: body ? JSON.stringify(body).length : 0,
        });

        return originalSend.call(this, body);
    };

    next();
}; 