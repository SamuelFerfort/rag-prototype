"use server";

import {
  searchEmbeddings,
  generateEmbedding,
  storeEmbedding,
} from "../embeddings";

export async function searchDocuments(
  query: string,
): Promise<{ id: string; text: string; score: number }[]> {
  if (!query.trim()) {
    return [];
  }
  try {
    const results = await searchEmbeddings(query);
    return results;
  } catch (error) {
    console.error("Search error:", error);
    throw new Error("Failed to search documents");
  }
}

export async function addDocument(text: string) {
  if (!text.trim()) {
    throw new Error("Document text cannot be empty");
  }

  try {
    const id = `doc_${Date.now()}`;
    const embedding = await generateEmbedding(text);
    await storeEmbedding(id, text, embedding);
    return { id, text };
  } catch (error) {
    console.error("Add document error:", error);
    throw new Error("Failed to add document");
  }
}
