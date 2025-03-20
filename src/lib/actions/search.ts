"use server";

import { searchSimilarDocuments } from "../services/langchain";
import { pinecone } from "../services/pinecone";
import type { Chunk, Embedding } from "../types/embeddings";
import { sanitizeId } from "../utils";

const API_URL = process.env.DOCUMENT_PROCESSOR_URL;

export interface SearchResult {
  id: string;
  text: string;
  score: number;
  metadata?: Record<string, any>;
}

/**
 * Search for documents using LangChain and Pinecone
 */
export async function searchDocuments(query: string): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }
  try {
    const results = await searchSimilarDocuments(query, 5);
    return results;
  } catch (error: any) {
    console.error("Search error:", error);
    throw new Error(
      `Failed to search documents: ${error?.message || "Unknown error"}`
    );
  }
}

/**
 * Add document from editor to the vector store
 */
export async function addDocument(text: string) {
  if (!text.trim()) {
    throw new Error("Document text cannot be empty");
  }

  try {
    const id = `editor_${Date.now()}`;
    const timestamp = Date.now();

    // Create metadata
    const metadata = {
      project_id: id,
      source: "editor",
      timestamp: new Date().toISOString(),
    };

    // Create FormData
    const formData = new FormData();
    const textBlob = new Blob([text], { type: "text/plain" });
    const textFile = new File([textBlob], "editor-note.txt", {
      type: "text/plain",
    });

    formData.append("file", textFile);
    formData.append("project_id", id);
    formData.append("metadata", JSON.stringify(metadata));
    formData.append("strategy", "fast");

    // Call the external API
    const response = await fetch(`${API_URL}/process`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // Store in Pinecone
    await storeInPinecone(result.chunks, result.embeddings);

    return { id, text };
  } catch (error: any) {
    console.error("Add document error:", error);
    throw new Error(
      `Failed to add document: ${error?.message || "Unknown error"}`
    );
  }
}

/**
 * Store chunks and their embeddings in Pinecone
 */
export async function storeInPinecone(
  chunks: Chunk[],
  embeddings: Embedding[]
): Promise<boolean> {
  try {
    // Get Pinecone index
    const index = pinecone.Index(process.env.PINECONE_INDEX!);

    // Prepare vectors for upsert with sanitized IDs
    const vectors = chunks.map((chunk, i) => ({
      id: sanitizeId(chunk.id), // Sanitize ID here
      values: embeddings[i],
      metadata: {
        ...chunk.metadata,
        text: chunk.text,
        original_id: chunk.id, // Store original ID in metadata if needed
      },
    }));

    // Upsert vectors in batches of 100
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
    }

    return true;
  } catch (error) {
    console.error("Error storing in Pinecone:", error);
    throw error;
  }
}
