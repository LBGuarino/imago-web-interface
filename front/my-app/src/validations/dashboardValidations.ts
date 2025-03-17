// src/validations/dashboardFormSchema.ts
import { z } from "zod";

// Esquema para campos obligatorios
const requiredFileFieldSchema = z.preprocess(
  (arg) => {
    // Si existe FileList y tiene al menos un archivo, lo retornamos; de lo contrario, undefined.
    if (typeof FileList !== "undefined" && arg instanceof FileList && arg.length > 0) {
      return arg;
    }
    return undefined;
  },
  z
    .custom<FileList>((val) => typeof FileList !== "undefined" && val instanceof FileList, {
      message: "Debe seleccionar un archivo.",
    })
    .refine((files) => files.length === 1, { message: "Debe seleccionar un archivo." })
    .transform((files) => {
      const file = files.item(0);
      if (!file) throw new Error("Debe seleccionar un archivo.");
      return file;
    })
    .refine((file) => file.name.toLowerCase().endsWith(".dcm"), {
      message: "Solo se permiten archivos en formato DICOM (.dcm).",
    })
);

// Para los campos opcionales, simplemente hacemos .optional()
const optionalFileFieldSchema = requiredFileFieldSchema.optional();

export const dashboardFormSchema = z.object({
  view1: requiredFileFieldSchema,
  view2: requiredFileFieldSchema,
  view3: requiredFileFieldSchema,
  view4: requiredFileFieldSchema,
  tomo: optionalFileFieldSchema,
  studyName: z.string().min(1, "Ingrese el nombre del estudio."),
  studyDesc: z.string().optional(),
});

export type DashboardFormInputs = z.infer<typeof dashboardFormSchema>;
