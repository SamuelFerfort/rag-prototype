import { z } from "zod";

const LoginSchema = z.object({
  email: z
    .string()
    .email({ message: "Correo electrónico inválido" })
    .min(1, { message: "El correo electrónico es requerido" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .max(20, { message: "La contraseña debe tener como máximo 20 caracteres" }),
});

export default LoginSchema;
