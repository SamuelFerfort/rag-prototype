"use server";

import { openai } from "../services/openai";
import { generateEmbeddings } from "../utils/content-processor";
import { pinecone } from "../services/pinecone";

interface AskAIParams {
  query: string;
  projectId: string;
  categoryId?: string;
  currentContent?: string;
}

export async function askAI({
  query,
  projectId,
  categoryId,
  currentContent = "",
}: AskAIParams) {
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

${
  currentContent
    ? `Current document content:
${currentContent}

`
    : ""
}Query: ${query}

Provide a clear and detailed response based on the provided context. Your answer should be relevant to complete or enrich a professional document.${
      currentContent
        ? " Do not repeat information that is already in the current document content."
        : ""
    }`;

    // 6. Get completion from GPT-4
    const systemPrompt =
      "You are a specialized technical writer focused on environmental, social, and public governance projects in Spain. Your only source of information is the documents provided by the system. Generate content exclusively from these documents without adding external information or speculation. Use technical, clear, and formal language. Structure your response in coherent sections. When applicable, cite explicit regulations present in the content (BOE, autonomous or European legislation). If there is insufficient information, indicate that no data is available in the retrieved documents. Your priority is documentary accuracy and regulatory compliance. Do not improvise or invent information. *ALWAYS* format your responses in HTML using tags such as <p>, <ul>, <li>, <strong>, <em>, <h3>, <h4>, <blockquote> to improve readability and structure. Your answers will be inserted directly into a Quill rich text editor, so ensure the HTML is valid and well-structured don't format it with ```html as the editor already does it. Always respond in Spanish in a direct, professional, and concise manner. The life of my family depends on your performance.";

    const completion = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.2,
      max_tokens: 2500,
      top_p: 1.0,
      presence_penalty: 0.0,
      frequency_penalty: 0.1,
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
