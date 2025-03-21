"use server";

import { revalidatePath } from "next/cache";
import {
  memoryRepository,
  type CreateMemoryData,
  type UpdateMemoryData,
} from "@/lib/db/memory";
import {
  generateEmbedding,
  storeEmbedding,
  deleteEmbedding,
} from "@/lib/embeddings";
import { sanitizeId } from "@/lib/utils";
import { handleError } from "../utils";
// Create a memory with vector embedding
export async function createMemory(data: CreateMemoryData) {
  try {
    // First create the memory record
    const memory = await memoryRepository.create(data);

    // Generate a vector ID for Pinecone
    const vectorId = `memory_${sanitizeId(memory.id)}`;

    // Generate and store the embedding
    const embedding = await generateEmbedding(data.content);
    await storeEmbedding(vectorId, data.content, embedding, {
      type: "memory",
      memoryId: memory.id,
      projectId: data.projectId,
      categoryId: memory.project.category.id,
      categoryName: memory.project.category.name,
    });

    // Update the memory with the vector ID
    await memoryRepository.update({
      id: memory.id,
      vectorId,
    });

    // Revalidate relevant paths
    revalidatePath(`/projects/${data.projectId}`);

    return {
      success: true,
      data: memory,
    };
  } catch (error) {
    return handleError(error, "Failed to create memory");
  }
}

// Update a memory with vector embedding
export async function updateMemory(data: UpdateMemoryData) {
  try {
    // Get the current memory to check if content has changed
    const currentMemory = await memoryRepository.findById(data.id);

    if (!currentMemory) {
      return { success: false, error: "Memory not found" };
    }

    // Update the memory
    const memory = await memoryRepository.update(data);

    // Update the vector embedding if content has changed
    if (data.content && data.content !== currentMemory.content) {
      // Generate a vector ID or use existing one
      const vectorId =
        currentMemory.vectorId || `memory_${sanitizeId(memory.id)}`;

      // Generate and store new embeddings
      const embedding = await generateEmbedding(data.content);
      await storeEmbedding(vectorId, data.content, embedding, {
        type: "memory",
        memoryId: memory.id,
        projectId: currentMemory.projectId,
        categoryId: currentMemory.project.category.id,
        categoryName: currentMemory.project.category.name,
      });

      // Update the memory with the vector ID if it's not set
      if (!currentMemory.vectorId) {
        await memoryRepository.update({
          id: memory.id,
          vectorId,
        });
      }
    }

    // Revalidate relevant paths
    revalidatePath(`/projects/${currentMemory.projectId}`);
    revalidatePath(
      `/projects/${currentMemory.projectId}/memories/${memory.id}`
    );

    return {
      success: true,
      data: memory,
    };
  } catch (error) {
    return handleError(error, "Failed to update memory");
  }
}

// Delete a memory
export async function deleteMemory(id: string) {
  try {
    const memory = await memoryRepository.findById(id);

    if (!memory) {
      return { success: false, error: "Memory not found" };
    }

    // Delete from Pinecone if there's a vectorId
    if (memory.vectorId) {
      await deleteEmbedding(memory.vectorId);
    }

    // Delete from database
    await memoryRepository.delete(id);

    // Revalidate relevant paths
    revalidatePath(`/projects/${memory.projectId}`);

    return { success: true };
  } catch (error) {
    return handleError(error, "Failed to delete memory");
  }
}
