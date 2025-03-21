import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes";
import cookieParser from "cookie-parser";
import { preventMultipleResponses } from "./middlewares/preventMultipleResponses";
import helmet from "helmet";

const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Content-Length",
      "X-Requested-With",
    ],
  })
);

app.use(helmet());

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use(router);

app.use(preventMultipleResponses);

// Middleware de manejo de errores centralizado
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).send({
    statusCode: err.statusCode || 500,
    message: err.message || "Internal Server Error",
  });
});

export default app;
