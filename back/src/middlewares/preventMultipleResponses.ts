import { Request, Response, NextFunction } from 'express';

export const preventMultipleResponses = (req: Request, res: Response, next: NextFunction) => {
    let responseSent = false;
    
    const originalSend = res.send;
    res.send = function (...args: any): Response {
      if (responseSent) {
        console.error('⚠️ Intento de enviar múltiples respuestas');
        return this;
      }
      responseSent = true;
      return originalSend.apply(this, args);
    };
    
    next();
  };
