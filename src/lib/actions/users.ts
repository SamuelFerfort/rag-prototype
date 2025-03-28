"use server";

import { auth } from "@/lib/auth";
import { getCurrentUser } from "../session";
import { z } from "zod";
import { CreateUserActionState } from "../types/users";
import { revalidatePath } from "next/cache";
import { APIError } from "better-auth";

// Schema remains the same
const signupSchema = z.object({
  email: z.string().email({ message: "Correo electrónico inválido" }),
  name: z.string().min(1, { message: "Nombre no puede estar vacío" }),
  password: z
    .string()
    .min(8, { message: "Contraseña debe tener al menos 8 caracteres" }),
});
export async function createUser(
  prevState: CreateUserActionState,
  formData: FormData
): Promise<CreateUserActionState> {
  // This already redirects if no user
  const callingUser = await getCurrentUser();

  // --- Data Extraction and Validation ---
  const rawData = {
    email: formData.get("email") as string,
    name: formData.get("name") as string,
    password: formData.get("password") as string,
  };

  const validationResult = signupSchema.safeParse(rawData);

  if (!validationResult.success) {
    console.log("validationResult", validationResult);
    return {
      status: "error",
      message: "Error al crear usuario. Por favor, verifica los campos.",
      errors: validationResult.error.flatten().fieldErrors,
      values: rawData,
    };
  }

  const { email, name, password } = validationResult.data;

  console.log(email, name, password);
  try {
    const newUser = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    console.log(newUser);

    revalidatePath("/settings");
    return {
      status: "success",
      message: `Usuario '${name}' creado correctamente`,
      errors: null,
      values: rawData,
    };
  } catch (error) {
    console.error("Error creating user:", error); // Keep logging for debugging other errors

    // Check if it's the specific duplicate user APIError
    if (
      error?.constructor?.name === "APIError" &&
      (error as Error).message === "User already exists"
    ) {
      return {
        status: "error",
        message: "No se pudo crear el usuario.", // General message for toast/alert
        errors: {
          email: ["Este correo electrónico ya está en uso."], // Specific field error
        },
        values: rawData, // Return submitted values
      };
    } else {
      // Handle other errors (could be other APIErrors or different error types)
      console.log("Caught a different error type or APIError message.");
      return {
        status: "error",
        message: "Error al crear usuario.",
        errors: null,
        values: rawData, // Still return values
      };
    }
  }
}

export async function updateUser() {}

export async function deleteUser() {}
