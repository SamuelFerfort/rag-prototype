"use server";

import { pinecone } from "../services/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import type { Chunk, ChunkMetadata, Embedding } from "../types/embeddings";
import { storeInPinecone } from "./search";

// Initialize OpenAI embeddings for storing to Pinecone
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});

const API_URL = process.env.DOCUMENT_PROCESSOR_URL;

/**
 * Upload and process a document using the external API
 */
export async function uploadDocument(
  filename: string,
  content: string,
  fileType: string = "txt"
) {
  try {
    // Generate document ID
    const timestamp = Date.now();
    const cleanFilename = filename.replace(/\W+/g, "_").toLowerCase();
    const docId = `doc_${cleanFilename}_${timestamp}`;

    // Prepare metadata
    const metadata = {
      project_id: docId,
      filename: filename,
      type: fileType,
      timestamp: new Date().toISOString(),
    };

    // For text-based files
    if (fileType === "txt" || fileType === "md") {
      // Create FormData and directly upload the text content
      const formData = new FormData();
      const textBlob = new Blob([content], { type: "text/plain" });
      const textFile = new File([textBlob], filename, { type: "text/plain" });

      formData.append("file", textFile);
      formData.append("project_id", docId);
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

      return {
        id: docId,
        filename,
        chunkCount: result.count,
        timestamp,
      };
    }
    // For binary files (PDF, DOCX)
    else if (fileType === "pdf" || fileType === "docx") {
      // Parse the JSON content for binary files
      let payload;
      try {
        payload = JSON.parse(content);
      } catch (e) {
        throw new Error("Invalid binary file payload");
      }

      // Convert array back to buffer and create a file
      const buffer = new Uint8Array(payload.buffer);
      const fileBlob = new Blob([buffer], { type: `application/${fileType}` });
      const file = new File([fileBlob], filename, {
        type: `application/${fileType}`,
      });

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", docId);
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

      return {
        id: docId,
        filename,
        chunkCount: result.count,
        timestamp,
      };
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  } catch (error: unknown) {
    console.error("Document upload error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to upload document");
  }
}
