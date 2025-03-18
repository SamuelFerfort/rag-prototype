import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured";
import { pinecone } from "./pinecone";
import { openai } from "./openai";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});

// Unstructured API configuration
const UNSTRUCTURED_API_KEY = process.env.UNSTRUCTURED_API_KEY;
const UNSTRUCTURED_API_URL =
  process.env.UNSTRUCTURED_API_URL ||
  "https://api.unstructuredapp.io/general/v0/general";

/**
 * Process a text document
 */
export async function processDocument(
  text: string,
  metadata: Record<string, any> = {},
) {
  try {
    // Create a LangChain document
    const doc = new Document({
      pageContent: text,
      metadata,
    });

    // Split the document into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const docs = await textSplitter.splitDocuments([doc]);
    console.log(`Split document into ${docs.length} chunks`);

    // Get Pinecone index
    const index = pinecone.Index(process.env.PINECONE_INDEX!);

    // Store documents in Pinecone
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
    });

    return {
      chunkCount: docs.length,
      status: "success",
    };
  } catch (error: unknown) {
    console.error("Error processing document:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to process document");
  }
}

/**
 * Process a binary document (PDF, DOCX, etc.) using Unstructured
 */
export async function processDocumentBuffer(
  buffer: ArrayBuffer,
  metadata: Record<string, any> = {},
) {
  try {
    // Create a temporary file from the buffer
    const tempDir = os.tmpdir();
    const fileExtension =
      metadata.type === "pdf"
        ? ".pdf"
        : metadata.type === "docx"
          ? ".docx"
          : ".txt";
    const tempFilePath = path.join(
      tempDir,
      `temp_${Date.now()}${fileExtension}`,
    );

    // Write buffer to temp file
    fs.writeFileSync(tempFilePath, Buffer.from(buffer));

    try {
      // Process with Unstructured - using correct options
      const loader = new UnstructuredLoader(tempFilePath, {
        apiKey: UNSTRUCTURED_API_KEY,
        apiUrl: UNSTRUCTURED_API_URL,
        // Strategy options: "hi_res" (more accurate) or "fast" (quicker processing)
        strategy: "hi_res",
        // These are proper options for the UnstructuredLoader
        includePageBreaks: true,
        chunkingStrategy: "by_title",
      });

      // Load documents with structure preserved
      const docs = await loader.load();

      // Add our custom metadata to each document
      const enhancedDocs = docs.map((doc) => {
        return new Document({
          pageContent: doc.pageContent,
          metadata: {
            ...doc.metadata,
            ...metadata,
            source: metadata.filename || "unknown",
            timestamp: new Date().toISOString(),
          },
        });
      });

      console.log(
        `Extracted ${enhancedDocs.length} elements from ${metadata.type} file`,
      );

      // Get Pinecone index
      const index = pinecone.Index(process.env.PINECONE_INDEX!);

      // Store structured documents in Pinecone
      await PineconeStore.fromDocuments(enhancedDocs, embeddings, {
        pineconeIndex: index,
      });

      // Clean up temporary file
      fs.unlinkSync(tempFilePath);

      return {
        chunkCount: enhancedDocs.length,
        status: "success",
      };
    } catch (processError) {
      // Clean up temp file if there's an error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw processError;
    }
  } catch (error: unknown) {
    console.error("Error processing binary document:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to process binary document");
  }
}

/**
 * Search for documents using semantic similarity
 */
export async function searchSimilarDocuments(query: string, topK = 3) {
  try {
    // Get Pinecone index
    const index = pinecone.Index(process.env.PINECONE_INDEX!);

    // Create vector store
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
    });

    // Use similaritySearchWithScore instead of similaritySearch
    const results = await vectorStore.similaritySearchWithScore(query, topK);

    // Format results with actual scores
    return results.map(([doc, score]) => ({
      id: doc.metadata.id || doc.metadata.source || "unknown",
      text: doc.pageContent,
      score: score,
      metadata: doc.metadata,
    }));
  } catch (error: unknown) {
    console.error("Error searching documents:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to search documents");
  }
}
