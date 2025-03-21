import { Request, Response, NextFunction } from "express";
import {
  dicomTxtLog,
  saveMetadataToDB,
  uploadDicomToHealthcare,
} from "../services/uploadDicom.service";
import axios, { AxiosError } from "axios";
import FormData from "form-data";
import { validateDICOMFiles } from "../middlewares/validateDICOMFiles";

export interface MulterRequest extends Request {
  files?:
    | Express.Multer.File[]
    | { [fieldName: string]: Express.Multer.File[] };
}

export default async function uploadDicomController(
  req: MulterRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validación de archivos
    if (!req.files || Array.isArray(req.files)) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    await validateDICOMFiles(req, res, next);

    const files = req.files;
    const { projectId, location, datasetId, dicomStoreId } = req.body;
    if (!projectId || !location || !datasetId || !dicomStoreId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    const results: Record<string, any> = {};
    const requiredViewFields = ["view1", "view2", "view3", "view4"];

    const PYTHON_METADATA_URL =
      process.env.PYTHON_METADATA_URL ||
      "http://localhost:5001/extract-metadata";
    const DICOM_DEIDENTIFICATION_URL =
      process.env.DICOM_DEIDENTIFICATION_URL ||
      "http://localhost:3001/api/deidentify";

    // Procesamiento de vistas requeridas
    for (const view of requiredViewFields) {
      const file = files[view]?.[0];
      if (!file) {
        res.status(400).json({ error: `Missing file for ${view}` });
        return;
      }

      // 👇🏻 Llamada al servicio Python para extraer metadata DICOM 👇🏻
      const formData = new FormData();
      formData.append("dicom_file", file.buffer, {
        filename: file.originalname,
      });

      const dicomMetadataResponse = await axios.post(
        "http://localhost:5001/extract-metadata",
        formData,
        {
          headers: formData.getHeaders(),
        }
      );

      const dicomMetadata = dicomMetadataResponse.data;
      await saveMetadataToDB(dicomMetadata, file);
      await dicomTxtLog(file);

      // Continúa tu flujo original: Subir archivo al Healthcare API.
      results[view] = await uploadDicomToHealthcare(
        projectId,
        location,
        datasetId,
        dicomStoreId,
        file.buffer
      );
    }

    // Procesamiento de tomografía opcional
    if (files["tomo"]?.[0]) {
      const tomoFile = files["tomo"][0];

      const formDataTomo = new FormData();
      formDataTomo.append("dicom_file", tomoFile.buffer, {
        filename: tomoFile.originalname,
      });

      const dicomMetadataTomoResp = await axios.post(
        PYTHON_METADATA_URL,
        formDataTomo,
        {
          headers: formDataTomo.getHeaders(),
        }
      );

      const dicomMetadataTomo = dicomMetadataTomoResp.data;
      await saveMetadataToDB(dicomMetadataTomo, tomoFile);

      results["tomo"] = await uploadDicomToHealthcare(
        projectId,
        location,
        datasetId,
        dicomStoreId,
        tomoFile.buffer
      );
    }

    // Llamada a desidentificación (tu código original intacto)
    const sessionCookie = req.cookies["__session"];
    const deidentifyResponse = await axios.post(
      DICOM_DEIDENTIFICATION_URL,
      {
        projectId,
        location,
        datasetId,
        sourceDicomStoreId: dicomStoreId,
        destinationStore: `projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/imagoarg-dicom-destinationstore`,
        gcsConfigUri:
          process.env.GCS_CONFIG_URI ||
          "gs://imagoarg_bucket/de-id-template.json",
      },
      {
        headers: {
          Cookie: `__session=${sessionCookie}`,
          "X-Internal-Request": "true",
        },
      }
    );

    // Respuesta unificada original intacta
    res.status(200).json({
      uploadResults: results,
      deidentificationStatus: deidentifyResponse.data,
    });
  } catch (error) {
    // Manejo de errores centralizado (original intacto)
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(
        "Error en desidentificación o servicio Python:",
        axiosError.response?.data
      );
      res.status(500).json({
        error: "Error en servicio externo (desidentificación o Python)",
        details: axiosError.response?.data || axiosError.message,
      });
    } else if (error instanceof Error) {
      console.error("Error general:", error);
      res.status(500).json({
        error: "Error en el proceso completo",
        details: error.message,
      });
    } else {
      console.error("Error desconocido:", error);
      res.status(500).json({
        error: "Error desconocido",
        details: "Ocurrió un error inesperado",
      });
    }
  }
}
