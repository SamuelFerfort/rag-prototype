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
