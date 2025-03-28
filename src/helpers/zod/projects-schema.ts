// src/lib/types/projects.ts
import { z } from "zod";
import { ClientType, ProjectStatus } from "@prisma/client";

export const createProjectSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  categoryId: z.string().min(1, "La categoría es requerida"),
  userIds: z.array(z.string()).min(1, "Debe asignar al menos un usuario"),
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;

export type ProjectFormState = {
  status: "idle" | "submitting" | "success" | "error";
  errors?: {
    name?: string[];
    categoryId?: string[];
    userIds?: string[];
  };
  data?: any;
  message?: string;
};

export const updateProjectSchema = z.object({
  projectId: z.string().min(1, "ID del proyecto requerido"),
  name: z.string().min(1, "Nombre del proyecto requerido"),
  categoryId: z.string().min(1, "ID de la categoría requerido"), // Keep required, send via hidden input if not editable
  description: z.string().optional(), // Allow empty description
  status: z.nativeEnum(ProjectStatus, {
    // Added status
    errorMap: () => ({ message: "Estado de proyecto inválido" }),
  }),
  clientName: z.string().optional(),
  clientLocation: z.string().optional(),
  clientType: z.nativeEnum(ClientType, {
    errorMap: () => ({ message: "Tipo de cliente inválido" }),
  }),
  clientDescription: z.string().optional(), // Allow empty description
  userIds: z.array(z.string()).min(1, "Debe asignar al menos un usuario"),
});
