"use server";

import { storeInPinecone } from "./search";
import { Chunk, Embedding } from "../types/embeddings";

interface ProcessedDocument {
  documentId: string;
  filename: string;
  chunks: Chunk[];
  embeddings: Embedding[];
  projectId: string;
}

/**
 * Server action to store processed document chunks and embeddings in Pinecone
 * This is called after the client directly uploads and processes a document
 */
export async function storeProcessedDocument(document: ProcessedDocument) {
  try {
    // Validate the input
    if (!document.chunks || !document.embeddings) {
      throw new Error("Missing chunks or embeddings");
    }

    if (document.chunks.length !== document.embeddings.length) {
      throw new Error("Chunks and embeddings count mismatch");
    }

    // Store in Pinecone
    await storeInPinecone(document.chunks, document.embeddings);

    // Return success with document info
    return {
      success: true,
      id: document.documentId,
      filename: document.filename,
      chunkCount: document.chunks.length,
      timestamp: Date.now(),
      projectId: document.projectId,
    };
  } catch (error) {
    console.error("Error storing document in Pinecone:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to store document",
    };
  }
}
