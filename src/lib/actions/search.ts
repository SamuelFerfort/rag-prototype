"use server";

import {
  searchEmbeddings,
  generateEmbedding,
  storeEmbedding,
} from "../embeddings";
import { getDocumentById } from "./documents";

export interface SearchResult {
  id: string;
  text: string;
  score: number;
  source?: {
    filename?: string;
    chunkPosition?: string;
  };
}

/**
 * Searches for documents relevant to the query
 */
export async function searchDocuments(query: string): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    // Get search results from vector database
    const results = await searchEmbeddings(query);

    // Enhance results with metadata
    const enhancedResults = await Promise.all(
      results.map(async (result) => {
        // Extract document metadata from ID (if available)
        const docInfo = await getDocumentById(result.id);

        return {
          ...result,
          source: docInfo
            ? {
                filename: docInfo.filename,
                chunkPosition: docInfo.chunkPosition,
              }
            : undefined,
        };
      }),
    );

    return enhancedResults;
  } catch (error) {
    console.error("Search error:", error);
    throw new Error("Failed to search documents");
  }
}

/**
 * Adds a document to the index
 */
export async function addDocument(text: string) {
  if (!text.trim()) {
    throw new Error("Document text cannot be empty");
  }

  try {
    const id = `doc_editor_${Date.now()}`;
    const embedding = await generateEmbedding(text);
    await storeEmbedding(id, text, embedding);
    return { id, text };
  } catch (error) {
    console.error("Add document error:", error);
    throw new Error("Failed to add document");
  }
}
