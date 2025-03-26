import { pinecone } from "@/lib/services/pinecone";

interface PineconeFilter {
  documentId?: string;
  memoryId?: string;
  projectId?: string;
  [key: string]: any;
}

/**
 * Robustly deletes vectors from Pinecone using query-then-delete pattern
 * This approach is more reliable in serverless environments than using filter-based deletion
 *
 * @param filter Filter criteria (e.g., { memoryId: "123" })
 * @param dimension Dimension of embedding vectors (default: 1536 for text-embedding-3-small)
 * @returns Number of deleted vectors
 */
export async function deleteVectorsByFilter(
  filter: PineconeFilter,
  dimension: number = 1536
): Promise<number> {
  try {
    // Validate filter
    if (Object.keys(filter).length === 0) {
      throw new Error("At least one filter must be provided");
    }

    // Connect to Pinecone
    const index = pinecone.Index(process.env.PINECONE_INDEX!);

    // 1. Create a dummy vector (just zeros)
    const dummyVector = Array(dimension).fill(0);

    // 2. Search with this dummy vector, but filter by criteria
    const queryResponse = await index.query({
      vector: dummyVector,
      filter: filter,
      topK: 1000, // Maximum allowed
      includeMetadata: false,
    });

    // 3. Get IDs of matching vectors
    const vectorIds = queryResponse.matches.map((match) => match.id);

    if (vectorIds.length === 0) {
      console.log(`No vectors found matching filter:`, filter);
      return 0;
    }

    // 4. Delete those vectors in batches
    const batchSize = 100;
    for (let i = 0; i < vectorIds.length; i += batchSize) {
      const batch = vectorIds.slice(i, i + batchSize);
      await index.deleteMany(batch);
    }

    console.log(`Deleted ${vectorIds.length} vectors matching filter:`, filter);
    return vectorIds.length;
  } catch (error) {
    console.error("Error deleting vectors:", error);
    throw error;
  }
}
