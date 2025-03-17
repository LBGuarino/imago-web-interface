import { z } from "zod";

export const contactFormSchema = z.object({
  nombre: z.string().nonempty({ message: "El nombre es requerido" }),
  apellido: z.string().nonempty({ message: "El apellido es requerido" }),
  telefono: z
    .string()
    .nonempty({ message: "El teléfono es requerido" })
    .regex(/^\+?\d{7,15}$/, { message: "El teléfono debe tener entre 7 y 15 dígitos" }),
  email: z.string().email({ message: "El email es inválido" }),
  centroDeSalud: z.string().nonempty({ message: "El centro de salud es requerido" }),
});

export type ContactFormInputs = z.infer<typeof contactFormSchema>;
