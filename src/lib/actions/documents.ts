"use server";

import { chunkDocument } from "../utils/chunker";
import { generateEmbedding, storeEmbedding } from "../embeddings";

/**
 * Uploads and processes a document by:
 * 1. Chunking the content into manageable pieces
 * 2. Generating embeddings for each chunk
 * 3. Storing the chunks and embeddings in Pinecone
 */
export async function uploadDocument(filename: string, content: string) {
  if (!content || content.trim().length === 0) {
    throw new Error("Document content cannot be empty");
  }

  console.log(
    `Starting to process document: ${filename} (${content.length} characters)`
  );

  try {
    // Generate a clean document ID base from the filename
    const cleanFilename = filename.replace(/\W+/g, "_").toLowerCase();

    // Get current timestamp for unique document ID
    const timestamp = Date.now();

    // Chunk the document into smaller pieces with smaller chunk size for quicker processing
    const chunks = chunkDocument(content, 300, 50);

    console.log(`Created ${chunks.length} chunks from document`);

    // Process each chunk
    const results = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Create a unique ID for this chunk
      const chunkId = `doc_${cleanFilename}_chunk_${i}_${timestamp}`;

      try {
        console.log(
          `Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`
        );

        // Generate embedding for the chunk
        const embedding = await generateEmbedding(chunk);
        console.log(`Generated embedding for chunk ${i + 1}`);

        // Store the chunk and its embedding in Pinecone
        await storeEmbedding(chunkId, chunk, embedding);
        console.log(`Stored chunk ${i + 1} in vector database`);

        results.push({
          id: chunkId,
          chunk,
          position: i,
        });
      } catch (error: any) {
        console.error(
          `Error processing chunk ${i} of ${filename}:`,
          error?.message || error
        );

        // Continue with other chunks instead of throwing an error
        // This way we can process as many chunks as possible even if some fail
        continue;
      }
    }

    return {
      filename,
      chunkCount: results.length, // Return actual successful chunks
      firstChunkId: results.length > 0 ? results[0].id : null,
    };
  } catch (error: any) {
    console.error("Document processing error:", error?.message || error);
    throw new Error(
      `Failed to process document: ${error?.message || "Unknown error"}`
    );
  }
}

/**
 * Gets document metadata by ID
 * This is a placeholder for future functionality
 */
export async function getDocumentById(id: string) {
  // This would retrieve document metadata from a database
  // For now, we'll return a mock response based on ID parsing
  const parts = id.split("_");

  if (parts.length >= 4) {
    const filename = parts[1];
    const chunkPosition = parts[2] === "chunk" ? parts[3] : "0";

    return {
      id,
      filename,
      chunkPosition,
    };
  }

  return null;
}
