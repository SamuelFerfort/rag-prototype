import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { pinecone } from "./pinecone";

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});

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
