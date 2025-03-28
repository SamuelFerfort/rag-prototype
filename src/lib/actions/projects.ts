"use server";

import { revalidatePath } from "next/cache";
import { projectRepository } from "@/lib/db/projects";
import {
  handleError,
  handleProjectError,
  handleUpdateProjectError,
} from "../utils";
import { UpdateProjectActionState } from "../types/projects";
import { deleteVectorsByFilter } from "@/lib/utils/pinecone-helpers";
import {
  createProjectSchema,
  ProjectFormState,
  updateProjectSchema,
} from "@/helpers/zod/projects-schema";
import { getCurrentUserId } from "../session";

// Create a new project
export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  // This function already redirects if we don't have a user
  const userId = await getCurrentUserId();

  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
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
export async function updateProject(
  prevState: UpdateProjectActionState,
  formData: FormData
): Promise<UpdateProjectActionState> {
  const userId = await getCurrentUserId();

  try {
    const rawData = {
      projectId: formData.get("projectId") as string,
      name: formData.get("name") as string,
      categoryId: formData.get("categoryId") as string, // Get categoryId
      description: formData.get("description") as string,
      status: formData.get("status") as string, // Get status
      clientName: formData.get("clientName") as string,
      clientLocation: formData.get("clientLocation") as string,
      clientType: formData.get("clientType") as string,
      clientDescription: formData.get("clientDescription") as string,
      // Get all selected user IDs
      userIds: formData.getAll("userIds").map((id) => id.toString()),
    };

    console.log("rawData", rawData);

    const validationResult = updateProjectSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error("Validation Errors:", validationResult.error.flatten());
      return {
        status: "error",
        // Add a user-friendly message
        message: "Validation failed. Please check the fields below.",
        errors: validationResult.error.flatten().fieldErrors,
        updatedProject: null, // Explicitly set null
      };
    }

    console.log("validationResult", validationResult);

    const project = await projectRepository.update(validationResult.data);

    if (!project) {
      // Handle case where update didn't return a project (e.g., transaction failed silently)
      throw new Error("Actualización de proyecto falló inesperadamente.");
    }

    console.log("Project updated in repository:", project);
    // Revalidate relevant paths
    revalidatePath("/projects");
    revalidatePath(`/projects/${project?.id}`);

    return {
      status: "success",
      message: "Proyecto actualizado exitosamente",
      errors: null,
      updatedProject: project,
    };
  } catch (error) {
    console.error("Update Project Error:", error);
    const { message } = handleUpdateProjectError(
      error,
      "Failed to update project"
    ); // Use your error handler
    return {
      status: "error",
      message,
      errors: null,
      updatedProject: null,
    };
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
