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
  deleteEmbeddingsByFilter,
} from "@/lib/embeddings";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "../session";
import { z } from "zod";
import { processMemoryContent } from "@/lib/utils/content-processor";
import { handleError } from "../utils";
import { sanitizeId } from "@/lib/utils/ids";
import { storeInPinecone } from "./search";
import { deleteVectorsByFilter } from "@/lib/utils/pinecone-helpers";

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

    // Update the memory in the database
    const memory = await memoryRepository.update(data);

    // If content has changed, update embeddings
    if (data.content && data.content !== currentMemory.content) {
      // Delete existing embeddings for this memory
      await deleteVectorsByFilter({ memoryId: memory.id });

      // Process the content into chunks and generate embeddings
      const { chunks, embeddings } = await processMemoryContent(
        memory.id,
        currentMemory.projectId,
        currentMemory.project.category.id,
        currentMemory.project.category.name,
        memory.name,
        data.content
      );

      // Store chunks and embeddings in Pinecone
      await storeInPinecone(chunks, embeddings);
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

    // Delete all chunks from Pinecone
    await deleteVectorsByFilter({ memoryId: memory.id });

    // Delete from database
    await memoryRepository.delete(id);

    // Revalidate relevant paths
    revalidatePath(`/projects/${memory.projectId}`);

    return { success: true };
  } catch (error) {
    return handleError(error, "Failed to delete memory");
  }
}

// Simple schema for memory creation
const createMemorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  projectId: z.string().min(1, "El proyecto es requerido"),
});

type MemoryFormState = {
  status: string;
  errors?: {
    name?: string[];
    projectId?: string[];
    _form?: string[];
  };
  data?: any;
  message?: string;
};

export async function createSimpleMemory(
  prevState: MemoryFormState,
  formData: FormData
): Promise<MemoryFormState> {
  const userId = await getCurrentUserId();

  try {
    const rawData = {
      name: formData.get("name"),
      projectId: formData.get("projectId"),
    };

    // Validate with Zod
    const validationResult = createMemorySchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        status: "error",
        errors: validationResult.error.flatten().fieldErrors,
        message: "Por favor corrige los errores en el formulario",
      };
    }

    // Data is valid, create the memory
    const data = validationResult.data;

    console.log("data", data);
    const memory = await memoryRepository.createSimple({
      name: data.name,
      projectId: data.projectId,
      content: "",
    });

    // Revalidate relevant paths
    revalidatePath(`/projects/${data.projectId}`);

    return {
      status: "success",
      data: memory,
      message: "Memoria creada exitosamente",
    };
  } catch (error) {
    console.error("Failed to create memory:", error);
    return {
      status: "error",
      message: "Error al crear la memoria",
      errors: {
        _form: ["Error al crear la memoria"],
      },
    };
  }
}
