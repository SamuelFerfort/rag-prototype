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
    const prompt = `Based on the following context, please answer the question or complete the requested content.

Context:
${relevantChunks.join("\n\n")}

Query: ${query}

Provide a clear and detailed response based on the provided context. Your answer should be relevant to complete or enrich a professional document.`;

    // 6. Get completion from GPT-4
    const completion = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: [
        {
          role: "system",
          content:
            "You are a specialized assistant in environmental project management who provides accurate answers based on the given context. You are an expert in drafting technical texts and reports for environmental and governance projects aimed at Spanish public administration. Be explanatory and combine the best results in your writing. Always cite and reference relevant laws when appropriate. *ALWAYS* format your responses in HTML using tags such as <p>, <ul>, <li>, <strong>, <em>, <h3>, <h4>, <blockquote> to improve readability and structure. Your answers will be inserted directly into a Quill rich text editor, so make sure the HTML is valid and well-structured no need to format with ```html as the editor already does it. Always respond in Spanish in a direct, professional, and concise manner.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 1000,
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
