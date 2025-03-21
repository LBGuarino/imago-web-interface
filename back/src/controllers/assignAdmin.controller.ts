// controllers/assignAdminRole.controller.ts
import { Request, Response } from "express";
import { assignAdminRole } from "../services/claims.service";

export async function assignAdminRoleController(
  req: Request,
  res: Response
): Promise<void> {
  const { uid } = req.body;
  if (!uid || typeof uid !== "string") {
    res.status(400).json({ error: "UID inválido o no proporcionado" });
    return;
  }
  try {
    await assignAdminRole(uid);
    res.status(200).json({
      message: "El usuario ha sido asignado como admin correctamente.",
    });
    return;
  } catch (error: any) {
    console.error("Error asignando rol admin:", error);
    res.status(500).json({ error: error.message });
    return;
  }
}
