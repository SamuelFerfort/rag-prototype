import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { pinecone } from "./pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});

/**
 * Process a document by splitting it into chunks and storing in Pinecone
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
  } catch (error: any) {
    console.error("Error processing document:", error);
    throw new Error(
      `Failed to process document: ${error?.message || "Unknown error"}`,
    );
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
      score: score, // This will now have the actual similarity score
      metadata: doc.metadata,
    }));
  } catch (error: any) {
    console.error("Error searching documents:", error);
    throw new Error(
      `Failed to search documents: ${error?.message || "Unknown error"}`,
    );
  }
}
