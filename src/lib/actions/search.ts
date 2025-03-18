"use server";

import { searchSimilarDocuments, processDocument } from "../services/langchain";

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
      `Failed to search documents: ${error?.message || "Unknown error"}`,
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

    // Process document using LangChain
    await processDocument(text, {
      id,
      source: "editor",
      timestamp: new Date().toISOString(),
    });

    return { id, text };
  } catch (error: any) {
    console.error("Add document error:", error);
    throw new Error(
      `Failed to add document: ${error?.message || "Unknown error"}`,
    );
  }
}
