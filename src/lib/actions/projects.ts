"use server";

import { revalidatePath } from "next/cache";
import { projectRepository } from "@/lib/db/projects";
import { handleError, handleProjectError } from "../utils";
import { CreateProjectData, UpdateProjectData } from "../types/projects";
import { deleteVectorsByFilter } from "@/lib/utils/pinecone-helpers";
import {
  createProjectSchema,
  ProjectFormState,
} from "@/helpers/zod/projects-schema";
import { getCurrentUserId } from "../session";

// Create a new project
export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  // This function already redirects if we don't have a user
  const userId = await getCurrentUserId();

  const name = formData.get("name") as String;
  const categoryId = formData.get("categoryId") as String;
  const userIds = formData.getAll("userIds").map((id) => id.toString());
  userIds.push(userId);

  try {
    console.log("formData", formData);
    const rawData = {
      name,
      categoryId,
      userIds,
    };

    console.log("rawData", rawData);

    const validationResult = createProjectSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        status: "error",
        errors: validationResult.error.flatten().fieldErrors,
        message: "Por favor corrige los errores en el formulario",
      };
    }

    console.log("validationResult", validationResult);
    const data = validationResult.data;
    const project = await projectRepository.create(data);

    // Revalidate relevant paths
    revalidatePath("/projects");

    return {
      status: "success",
      data: project,
      message: "Proyecto creado exitosamente",
    };
  } catch (error) {
    return handleProjectError(error, "Failed to create project");
  }
}

// Update a project
export async function updateProject(data: UpdateProjectData) {
  // we are missing validation and authorization here
  try {
    const project = await projectRepository.update(data);

    // Revalidate relevant paths
    revalidatePath("/projects");
    revalidatePath(`/projects/${data.id}`);

    return {
      success: true,
      data: project,
    };
  } catch (error) {
    return handleError(error, "Failed to update project");
  }
}

export async function deleteProject(id: string) {
  // we are missing validation and authorization here
  try {
    // First delete all vectors from Pinecone
    await deleteVectorsByFilter({ projectId: id });

    // Then delete from database (this will cascade delete memories and documents)
    await projectRepository.delete(id);

    revalidatePath("/projects");

    return { success: true };
  } catch (error) {
    return handleError(error, "Failed to delete project");
  }
}
