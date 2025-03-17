import { Request, Response, NextFunction } from "express";
import { uploadDicomToHealthcare } from "../services/uploadDicom.service";
import axios, { AxiosError } from "axios";

interface MulterRequest extends Request {
  files?: Express.Multer.File[] | { [fieldName: string]: Express.Multer.File[] };
}

export default async function uploadDicomController(
  req: MulterRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  console.log("req.body", req.body);
  console.log("req.files", req.files);

  try {
    // Validación de archivos
    if (!req.files || Array.isArray(req.files)) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    const files = req.files;

    // Validación de parámetros requeridos
    const { projectId, location, datasetId, dicomStoreId } = req.body;
    if (!projectId || !location || !datasetId || !dicomStoreId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    const results: Record<string, any> = {};
    const requiredViewFields = ["view1", "view2", "view3", "view4"];

    // Procesamiento de vistas requeridas
    for (const view of requiredViewFields) {
      const file = files[view]?.[0];
      if (!file) {
        res.status(400).json({ error: `Missing file for ${view}` });
        return;
      }

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
      results["tomo"] = await uploadDicomToHealthcare(
        projectId,
        location,
        datasetId,
        dicomStoreId,
        tomoFile.buffer
      );
    }

    // Llamada a desidentificación
    const sessionCookie = req.cookies.__session;
    const deidentifyResponse = await axios.post(
      "http://localhost:3001/api/deidentify",
      {
        projectId,
        location,
        datasetId,
        sourceDicomStoreId: dicomStoreId,
        destinationStore: `projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/imagoarg-dicom-destinationstore`,
        gcsConfigUri: "gs://imagoarg_bucket/de-id-template.json",
      },
      {
        headers: {
          Cookie: `__session=${sessionCookie}`,
          'X-Internal-Request': 'true'
        }
      }
    );

    // Respuesta unificada
    res.status(200).json({
      uploadResults: results,
      deidentificationStatus: deidentifyResponse.data
    });

  } catch (error) {
    // Manejo de errores centralizado
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('Error en desidentificación:', axiosError.response?.data);
      res.status(500).json({
        error: "Error en el proceso de desidentificación",
        details: axiosError.response?.data || axiosError.message
      });
    } else if (error instanceof Error) {
      console.error('Error general:', error);
      res.status(500).json({ 
        error: "Error en el proceso completo",
        details: error.message 
      });
    } else {
      console.error('Error desconocido:', error);
      res.status(500).json({ 
        error: "Error desconocido",
        details: "Ocurrió un error inesperado" 
      });
    }
  }
}