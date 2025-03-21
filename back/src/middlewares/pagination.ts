// src/middlewares/pagination.ts
import { Request, Response, NextFunction } from "express";

export const paginationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const DEFAULT_LIMIT = 50;
  const MAX_LIMIT = 200;

  // Parsear y validar parámetros
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const rawLimit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(1, rawLimit), MAX_LIMIT);

  // Calcular offset seguro
  const offset = (page - 1) * limit;

  // Adjuntar a request para uso en controllers
  req.pagination = {
    page,
    limit,
    offset,
    hasNext: false, // Se llenará posteriormente
  };

  next();
};

declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        offset: number;
        hasNext: boolean;
      };
    }
  }
}
