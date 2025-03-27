"use server";

import { openai } from "../services/openai";
import { generateEmbeddings } from "../utils/content-processor";
import { pinecone } from "../services/pinecone";

interface AskAIParams {
  query: string;
  projectId: string;
  categoryId?: string;
}

export async function askAI({ query, projectId, categoryId }: AskAIParams) {
  try {
    // 1. Generate embedding for the query
    const [queryEmbedding] = await generateEmbeddings([query]);

    // 2. Build filter for Pinecone query
    const filter: any = {
      projectId: { $eq: projectId },
    };

    // Add category filter if provided
    if (categoryId) {
      filter.categoryId = { $eq: categoryId };
    }

    // 3. Search in Pinecone
    const index = pinecone.Index(process.env.PINECONE_INDEX!);
    const searchResponse = await index.query({
      vector: queryEmbedding,
      filter: filter,
      topK: 5,
      includeMetadata: true,
    });

    // 4. Extract and format relevant chunks
    const relevantChunks = searchResponse.matches
      .filter((match) => match.metadata?.text)
      .map((match) => match.metadata?.text as string);

    if (relevantChunks.length === 0) {
      return {
        success: false,
        error: "No relevant information found",
      };
    }

    console.log(relevantChunks);

    // 5. Construct prompt with context
    const prompt = `Based on the following context, please answer the question. 
Context:
${relevantChunks.join("\n\n")}

Question: ${query}

Please provide a clear and concise answer based on the context provided.`;

    // 6. Get completion from GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that provides accurate answers based on the given context. Format your responses in HTML using appropriate tags like <p>, <ul>, <li>, <strong>, <em>, etc. for better readability. Answer directly and concisely.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      success: true,
      answer: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error("AI query error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process query",
    };
  }
}
