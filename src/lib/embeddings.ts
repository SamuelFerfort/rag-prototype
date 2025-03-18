import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

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
) {
  const index = pinecone.Index(process.env.PINECONE_INDEX!);

  await index.upsert([
    {
      id,
      values: embedding,
      metadata: {
        text,
      },
    },
  ]);
}

export async function searchEmbeddings(
  query: string,
  topK = 3,
): Promise<{ id: string; text: string; score: number }[]> {
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
}
