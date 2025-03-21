import { pinecone } from "./services/pinecone";
import { openai } from "./services/openai";

// Enhanced metadata type
export type EmbeddingMetadata = {
  text?: string;
  type?: "document" | "memory";
  projectId?: string;
  categoryId?: string;
  categoryName?: string;
  documentId?: string;
  memoryId?: string;
  filename?: string;
  [key: string]: any; // Allow for additional metadata
};

export async function generateEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

export async function storeEmbedding(
  id: string,
  text: string,
  embedding: number[],
  metadata: EmbeddingMetadata = {}
) {
  const index = pinecone.Index(process.env.PINECONE_INDEX!);

  // Always include the text in metadata
  const fullMetadata = {
    ...metadata,
    text,
  };

  await index.upsert([
    {
      id,
      values: embedding,
      metadata: fullMetadata,
    },
  ]);
}

export async function deleteEmbedding(id: string) {
  const index = pinecone.Index(process.env.PINECONE_INDEX!);

  await index.deleteOne(id);
}

export async function searchEmbeddings(
  query: string,
  filter?: {
    projectId?: string;
    categoryId?: string;
    type?: "document" | "memory";
  },
  topK = 5
): Promise<
  { id: string; text: string; score: number; metadata: EmbeddingMetadata }[]
> {
  const queryEmbedding = await generateEmbedding(query);
  const index = pinecone.Index(process.env.PINECONE_INDEX!);

  // Build filter based on provided parameters
  const filterObj: any = {};

  if (filter) {
    if (filter.projectId) {
      filterObj.projectId = { $eq: filter.projectId };
    }

    if (filter.categoryId) {
      filterObj.categoryId = { $eq: filter.categoryId };
    }

    if (filter.type) {
      filterObj.type = { $eq: filter.type };
    }
  }

  // Perform the query with filters
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter: Object.keys(filterObj).length > 0 ? filterObj : undefined,
  });

  return results.matches.map((match) => ({
    id: match.id,
    score: match.score ?? 0,
    text: typeof match.metadata?.text === "string" ? match.metadata.text : "",
    metadata: match.metadata as EmbeddingMetadata,
  }));
}

export async function deleteEmbeddingsByFilter(filter: {
  projectId?: string;
  documentId?: string;
  memoryId?: string;
}) {
  const index = pinecone.Index(process.env.PINECONE_INDEX!);

  // Build Pinecone filter
  const filterObj: any = {};

  if (filter.projectId) {
    filterObj.projectId = { $eq: filter.projectId };
  }

  if (filter.documentId) {
    filterObj.documentId = { $eq: filter.documentId };
  }

  if (filter.memoryId) {
    filterObj.memoryId = { $eq: filter.memoryId };
  }

  // Check if we have any filters
  if (Object.keys(filterObj).length === 0) {
    throw new Error("At least one filter must be provided");
  }

  // Delete all matching vectors
  await index.deleteMany({
    filter: filterObj,
  });
}
