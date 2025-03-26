"use server";

import { revalidatePath } from "next/cache";
import { documentRepository } from "@/lib/db/documents";
import { projectRepository } from "@/lib/db/projects";
import { handleError } from "@/lib/utils";
import { sanitizeId } from "@/lib/utils/ids";
import { storeInPinecone } from "./search";
import { deleteEmbedding } from "@/lib/embeddings";
import { Chunk } from "@/lib/types/embeddings";
import { pinecone } from "../services/pinecone";
import { del } from "@vercel/blob";
import { deleteVectorsByFilter } from "@/lib/utils/pinecone-helpers";

// Types
type UploadDocumentInput = {
  name: string;
  path: string;
  mimeType: string;
  size: number;
  projectId: string;
  chunks: Chunk[];
  embeddings: number[][];
};

// Upload and store a new document
export async function uploadDocument(data: UploadDocumentInput) {
  try {
    // Fetch the project to get category info
    const project = await projectRepository.findById(data.projectId);

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Create a vector ID for Pinecone
    const vectorId = `document_${sanitizeId(data.name)}_${Date.now()}`;

    // Create document in database
    const document = await documentRepository.create({
      name: data.name,
      path: data.path,
      mimeType: data.mimeType,
      size: data.size,
      projectId: data.projectId,
      vectorId,
    });

    // Enhance chunks with project and category metadata
    const enhancedChunks = data.chunks.map((chunk) => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        projectId: data.projectId,
        categoryId: project.categoryId,
        categoryName: project.category.name,
        documentId: document.id,
        type: "document",
      },
    }));

    // Store chunks and embeddings in Pinecone
    await storeInPinecone(enhancedChunks, data.embeddings);

    // Revalidate relevant paths
    revalidatePath(`/projects/${data.projectId}`);

    return {
      success: true,
      data: document,
    };
  } catch (error) {
    return handleError(error, "Failed to upload document");
  }
}

// Delete a document and all its embeddings
export async function deleteDocument(id: string) {
  try {
    const document = await documentRepository.findById(id);

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    // Delete the file from Vercel Blob
    try {
      // The document.path contains the Blob URL
      if (document.path) {
        await del(document.path);
        console.log(`Deleted file from Blob storage: ${document.path}`);
      }
    } catch (blobError) {
      console.error("Error deleting file from Blob storage:", blobError);
      // Continue with deletion even if Blob deletion fails
    }

    // Delete all embeddings from Pinecone
    try {
      await deleteVectorsByFilter({ documentId: document.id });
    } catch (error) {
      console.error("Error deleting embeddings:", error);
      // Continue with document deletion even if embedding deletion fails
    }

    // Delete from database
    await documentRepository.delete(id);

    // Revalidate relevant paths
    revalidatePath(`/projects/${document.projectId}`);

    return { success: true };
  } catch (error) {
    return handleError(error, "Failed to delete document");
  }
}
