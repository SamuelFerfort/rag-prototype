"use server";

import { chunkDocument } from "../utils/chunker";
import { generateEmbedding, storeEmbedding } from "../embeddings";

export async function uploadDocument(filename: string, content: string) {
  const chunks = chunkDocument(content);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const id = `doc_${filename.replace(/\W+/g, "_")}_chunk_${i}_${Date.now()}`;
    const embedding = await generateEmbedding(chunk);
    await storeEmbedding(id, chunk, embedding);
  }

  return {
    filename,
    chunkCount: chunks.length,
  };
}
