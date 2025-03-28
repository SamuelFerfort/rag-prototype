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
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Project name is required"),
  categoryId: z.string().min(1, "Category ID is required"), // Keep required, send via hidden input if not editable
  description: z.string().optional(), // Allow empty description
  status: z.nativeEnum(ProjectStatus, {
    // Added status
    errorMap: () => ({ message: "Invalid project status" }),
  }),
  clientName: z.string().min(1, "Client name is required"),
  clientLocation: z.string().min(1, "Client location is required"),
  clientType: z.nativeEnum(ClientType, {
    errorMap: () => ({ message: "Invalid client type" }),
  }),
  clientDescription: z.string().optional(), // Allow empty description
  userIds: z.array(z.string()).min(1, "At least one user must be assigned"),
});
