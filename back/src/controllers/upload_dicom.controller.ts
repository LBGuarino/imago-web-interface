import { Request, Response, NextFunction } from "express";
import {
  dicomTxtLog,
  saveMetadataToDB,
  uploadDicomToHealthcare,
} from "../services/uploadDicom.service";
import axios, { AxiosError } from "axios";
import FormData from "form-data";
import { validateDICOMFiles } from "../middlewares/validateDICOMFiles";
import admin from "../lib/firebaseAdmin";

export interface MulterRequest extends Request {
  files?:
    | Express.Multer.File[]
    | { [fieldName: string]: Express.Multer.File[] };
}

// Función auxiliar para construir la URL del servicio Python
export function buildPythonUrl(
  baseUrl: string,
  doctorUid: string,
  additionalParams: Record<string, string> = {}
) {
  let queryParams = `doctor_uid=${encodeURIComponent(doctorUid)}`;
  for (const key in additionalParams) {
    queryParams += `&${encodeURIComponent(key)}=${encodeURIComponent(
      additionalParams[key]
    )}`;
  }
  return `${baseUrl}?${queryParams}`;
}

export default async function uploadDicomController(
  req: MulterRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.files || Array.isArray(req.files)) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    // await validateDICOMFiles(req, res, next);
    // console.log("Headers sent:", res.headersSent);
    // if (res.headersSent) {
    //   return;
    // }

    const files = req.files;
    const { projectId, location, datasetId, dicomStoreId } = req.body;
    if (!projectId || !location || !datasetId || !dicomStoreId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    const sessionCookie = req.cookies["__session"];
    if (!sessionCookie) {
      res.status(401).json({ error: "No se proporcionó cookie de sesión." });
      return;
    }
    const decodedToken = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);
    const doctorUid = decodedToken.uid;

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

      // Llamada al servicio Python para extraer metadata DICOM
      const formData = new FormData();
      formData.append("dicom_file", file.buffer, {
        filename: file.originalname,
      });
      // Construir la URL incluyendo el doctor_uid
      const pythonUrlWithUid = buildPythonUrl(PYTHON_METADATA_URL, doctorUid);
      console.log("Llamando a Python con URL:", pythonUrlWithUid);

      const dicomMetadataResponse = await axios.post(
        pythonUrlWithUid,
        formData,
        {
          headers: formData.getHeaders(),
        }
      );

      const { metadata: dicomMetadata, dicom_file: modifiedDicomHex } =
        dicomMetadataResponse.data;
      await saveMetadataToDB(dicomMetadata, file);
      // Aquí se pasa el doctorUid a dicomTxtLog
      await dicomTxtLog(file, doctorUid);

      // Convert hex string back to Buffer
      const modifiedDicomBuffer = Buffer.from(modifiedDicomHex, "hex");

      // Continúa el flujo: Subir archivo al Healthcare API.
      results[view] = await uploadDicomToHealthcare(
        projectId,
        location,
        datasetId,
        dicomStoreId,
        modifiedDicomBuffer
      );
    }

    // Procesamiento de tomografía opcional
    if (files["tomo"]?.[0]) {
      const tomoFile = files["tomo"][0];

      const formDataTomo = new FormData();
      formDataTomo.append("dicom_file", tomoFile.buffer, {
        filename: tomoFile.originalname,
      });
      // Construir la URL para tomografía, incluyendo el doctor_uid
      const pythonUrlWithUid = buildPythonUrl(PYTHON_METADATA_URL, doctorUid);
      console.log("Llamando a Python (tomo) con URL:", pythonUrlWithUid);

      const dicomMetadataTomoResp = await axios.post(
        pythonUrlWithUid,
        formDataTomo,
        {
          headers: formDataTomo.getHeaders(),
        }
      );

      const { metadata: dicomMetadataTomo, dicom_file: modifiedDicomTomoHex } =
        dicomMetadataTomoResp.data;
      await saveMetadataToDB(dicomMetadataTomo, tomoFile);

      // Convert hex string back to Buffer
      const modifiedDicomTomoBuffer = Buffer.from(modifiedDicomTomoHex, "hex");

      results["tomo"] = await uploadDicomToHealthcare(
        projectId,
        location,
        datasetId,
        dicomStoreId,
        modifiedDicomTomoBuffer
      );
    }

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

    res.status(200).json({
      uploadResults: results,
      deidentificationStatus: deidentifyResponse.data,
    });
  } catch (error) {
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
      return;
    } else if (error instanceof Error) {
      console.error("Error general:", error);
      res.status(500).json({
        error: "Error en el proceso completo",
        details: error.message,
      });
      return;
    } else {
      console.error("Error desconocido:", error);
      res.status(500).json({
        error: "Error desconocido",
        details: "Ocurrió un error inesperado",
      });
      return;
    }
  }
  return;
}
