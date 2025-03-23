import express, { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./routes";
import cookieParser from "cookie-parser";
import { preventMultipleResponses } from "./middlewares/preventMultipleResponses";
import helmet from "helmet";
import { validateEnv } from "./utils/validateEnv";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/errorHandler";

validateEnv();

const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:3000";

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana
  message: 'Demasiadas peticiones, por favor intente más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware de seguridad básico
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3001", "https://healthcare.googleapis.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Configuración de CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));

// Aplicar rate limiting a todas las rutas
app.use(limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));

// Middleware para parsear cookies
app.use(cookieParser());

app.use(router);

app.use(preventMultipleResponses);

// Manejador de errores global
app.use(errorHandler as ErrorRequestHandler);

// Middleware de manejo de errores centralizado
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).send({
    statusCode: err.statusCode || 500,
    message: err.message || "Internal Server Error",
  });
});

export default app;
