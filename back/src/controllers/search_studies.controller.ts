import { Request, Response } from "express";
import { searchStudiesByDoctor } from "../services/googleHealthcareService";
import admin from "../lib/firebaseAdmin";

export default async function searchStudiesController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const sessionCookie = req.cookies["__session"];
    if (!sessionCookie) {
      res.status(401).json({ error: "No se proporcionó cookie de sesión." });
      return;
    }

    const decodedToken = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);
    const doctorUid = decodedToken.uid;

    const { projectId, location, datasetId, dicomStoreId } = req.body;
    if (!projectId || !location || !datasetId || !dicomStoreId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    const studies = await searchStudiesByDoctor(
      projectId,
      location,
      datasetId,
      dicomStoreId,
      doctorUid
    );

    res.status(200).json(studies);
  } catch (error) {
    console.error("Error al buscar estudios:", error);
    res.status(500).json({
      error: "Error al buscar estudios",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
