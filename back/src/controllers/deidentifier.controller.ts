// src/controllers/deidentifyDICOMController.ts
import { NextFunction, Request, Response } from "express";
import { healthcare_v1 } from "googleapis";
import { deidentifyDICOMService } from "../services/googleHealthcareService";

export default async function deidentifyDICOMController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extraemos los parámetros del body, incluyendo project y source store.
    const {
      projectId,
      location,
      datasetId,
      sourceDicomStoreId,
      destinationStore,
      config,
      gcsConfigUri,
      filterConfig,
    } = req.body as {
      projectId: string;
      location: string;
      datasetId: string;
      sourceDicomStoreId: string;
      destinationStore: string;
      config?: healthcare_v1.Schema$DeidentifyDicomStoreRequest["config"];
      gcsConfigUri?: string;
      filterConfig?: healthcare_v1.Schema$DeidentifyDicomStoreRequest["filterConfig"];
    };

    // Construimos el objeto de solicitud.
    // Se especifica gcsConfigUri o config, según se haya enviado.
    const deidentifyRequest: healthcare_v1.Schema$DeidentifyDicomStoreRequest = {
      destinationStore,
      ...(gcsConfigUri ? { gcsConfigUri } : { config }),
      filterConfig, // opcional, según lo requieras
    };

    // Llamamos a la función de servicio con los parámetros completos.
    const operation = await deidentifyDICOMService(
      projectId,
      location,
      datasetId,
      sourceDicomStoreId,
      deidentifyRequest
    );

    // Respondemos con el resultado de la operación.
    res.status(200).json(operation);
  } catch (error) {
    next(error);
  }
}
