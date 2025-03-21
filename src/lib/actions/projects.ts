"use server";

import { revalidatePath } from "next/cache";
import { projectRepository } from "@/lib/db/projects";
import { handleError } from "../utils";
import { CreateProjectData, UpdateProjectData } from "../types/projects";
import { deleteEmbeddingsByFilter } from "../embeddings";

// Create a new project
export async function createProject(data: CreateProjectData) {
  try {
    const project = await projectRepository.create(data);

    // Revalidate relevant paths
    revalidatePath("/projects");

    return {
      success: true,
      data: project,
    };
  } catch (error) {
    return handleError(error, "Failed to create project");
  }
}

// Update a project
export async function updateProject(data: UpdateProjectData) {
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
  try {
    // First delete all vectors from Pinecone
    await deleteEmbeddingsByFilter({ projectId: id });

    // Then delete from database (this will cascade delete memories and documents)
    await projectRepository.delete(id);

    revalidatePath("/projects");

    return { success: true };
  } catch (error) {
    return handleError(error, "Failed to delete project");
  }
}
