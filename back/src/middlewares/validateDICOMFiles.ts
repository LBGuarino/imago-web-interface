// src/middlewares/validateDICOMFiles.ts
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { MulterRequest } from "../controllers/upload_dicom.controller";

export const validateDICOMFiles = async (
  req: MulterRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || Array.isArray(req.files)) {
      return res.status(400).json({ error: "No se subieron archivos" });
    }

    const files = req.files;
    const requiredViews = ["view1", "view2", "view3", "view4"];

    // Validar vistas requeridas
    for (const view of requiredViews) {
      const file = files[view]?.[0];
      if (!file) {
        return res.status(400).json({ error: `Falta archivo para ${view}` });
      }

      // 1. Validar magic number DICOM
      const DICOM_MAGIC_NUMBER = Buffer.from([0x44, 0x49, 0x43, 0x4d]); // 'DICM' en HEX
      const fileMagic = file.buffer.slice(128, 132);

      if (!fileMagic.equals(DICOM_MAGIC_NUMBER)) {
        return res.status(400).json({
          error: `Archivo ${view} no es un DICOM válido`,
          details: `Magic number encontrado: ${fileMagic.toString("hex")}`,
        });
      }

      // 2. Validar hash contra posibles archivos maliciosos
      const fileHash = crypto
        .createHash("sha256")
        .update(file.buffer)
        .digest("hex");

      if (await isKnownMaliciousHash(fileHash)) {
        return res.status(403).json({
          error: `Archivo ${view} detectado como malicioso`,
          hash: fileHash,
        });
      }
    }

    // Validar tomografía opcional
    if (files["tomo"]?.[0]) {
      const tomoFile = files["tomo"][0];
      const tomoFileHash = crypto
        .createHash("sha256")
        .update(tomoFile.buffer)
        .digest("hex");

      if (await isKnownMaliciousHash(tomoFileHash)) {
        return res.status(403).json({
          error: `Archivo tomografía detectado como malicioso`,
          hash: tomoFileHash,
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Helper para verificar hashes maliciosos (implementar según necesidades)
async function isKnownMaliciousHash(hash: string): Promise<boolean> {
  // Integrar con sistema de threat intelligence
  return false;
}
