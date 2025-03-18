import { pinecone } from "./services/pinecone";
import { openai } from "./services/openai";

// Define a basic error type for better TypeScript handling
interface ApiError extends Error {
  status?: number;
  message: string;
}

/**
 * Generates embeddings for the given text with retry logic
 */
export async function generateEmbedding(text: string, maxRetries = 3) {
  let retries = 0;
  let lastError: ApiError | null = null;

  while (retries < maxRetries) {
    try {
      console.log(`Generating embedding for text (${text.length} chars)`);

      // Truncate text if it's very long to avoid API issues
      const truncatedText = text.length > 8000 ? text.substring(0, 8000) : text;

      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: truncatedText,
      });

      if (!response.data || !response.data[0] || !response.data[0].embedding) {
        throw new Error("Invalid embedding response from OpenAI");
      }

      return response.data[0].embedding;
    } catch (error: any) {
      lastError = {
        message: error?.message || "Unknown embedding error",
        status: error?.status,
        name: error?.name || "ApiError",
      };

      retries++;

      console.warn(
        `Embedding API error (attempt ${retries}/${maxRetries}):`,
        lastError.message
      );

      if (lastError.status === 429) {
        // Rate limit error - wait longer between retries
        const waitTime = 1000 * Math.pow(2, retries); // Exponential backoff
        console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else if (retries < maxRetries) {
        // Other error - wait a bit before retry
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  // If we get here, all retries failed
  throw lastError || new Error("Failed to generate embedding after retries");
}

/**
 * Stores an embedding in Pinecone with retry logic
 */
export async function storeEmbedding(
  id: string,
  text: string,
  embedding: number[],
  maxRetries = 3
) {
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < maxRetries) {
    try {
      console.log(`Storing embedding for document ID: ${id}`);

      const index = pinecone.Index(process.env.PINECONE_INDEX!);

      await index.upsert([
        {
          id,
          values: embedding,
          metadata: {
            text,
            source: id.split("_")[1], // Extract source from ID
            timestamp: new Date().toISOString(),
          },
        },
      ]);

      return; // Success!
    } catch (error: any) {
      lastError = new Error(error?.message || "Unknown Pinecone error");
      retries++;

      console.warn(
        `Pinecone storage error (attempt ${retries}/${maxRetries}):`,
        lastError.message
      );

      // Wait before retry with exponential backoff
      const waitTime = 500 * Math.pow(2, retries);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  // If we get here, all retries failed
  throw lastError || new Error("Failed to store embedding after retries");
}

export async function searchEmbeddings(
  query: string,
  topK = 3
): Promise<{ id: string; text: string; score: number }[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const index = pinecone.Index(process.env.PINECONE_INDEX!);
    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return results.matches.map((match) => ({
      id: match.id,
      score: match.score ?? 0, // Default to 0 if undefined
      text: typeof match.metadata?.text === "string" ? match.metadata.text : "", // Ensure text is a string
    }));
  } catch (error: any) {
    console.error("Error searching embeddings:", error?.message || error);
    throw new Error(
      `Failed to search embeddings: ${error?.message || "Unknown error"}`
    );
  }
}
