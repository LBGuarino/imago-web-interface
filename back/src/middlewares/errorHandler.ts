import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof AppError) {
        logger.error({
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
            statusCode: err.statusCode,
        });

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        return;
    }

    // Para errores no operacionales (no manejados)
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    res.status(500).json({
        status: 'error',
        message: 'Algo salió mal en el servidor',
    });
}; 