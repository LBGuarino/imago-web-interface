// utils/auditLogger.ts
import winston from "winston";
import path from "path";

const auditLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // Logs en formato JSON para facilitar el análisis
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/audit.log"),
      handleExceptions: true,
    }),
    // Opcional: agregar también salida en consola para desarrollo
    new winston.transports.Console(),
  ],
  exitOnError: false,
});

export default auditLogger;
