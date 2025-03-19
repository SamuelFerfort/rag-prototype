import { z } from "zod";
export const SignupSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Mínimo 2 caracteres son requeridos" })
    .max(20, { message: "Máximo 20 caracteres son permitidos" }),
  email: z
    .string()
    .email({ message: "Correo electrónico inválido" })
    .min(1, { message: "El correo electrónico es requerido" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(20, { message: "La contraseña debe tener como máximo 20 caracteres" }),
});
