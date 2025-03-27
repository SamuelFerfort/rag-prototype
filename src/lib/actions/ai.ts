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
    const prompt = `Basándose en el siguiente contexto, por favor responda a la pregunta o complete el contenido solicitado.

Contexto:
${relevantChunks.join("\n\n")}

Consulta: ${query}

Proporcione una respuesta clara y detallada basada en el contexto proporcionado. Su respuesta debe ser relevante para completar o enriquecer un documento profesional.`;

    // 6. Get completion from GPT-4
    const completion = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: [
        {
          role: "system",
          content:
            "Usted es un asistente especializado en gestión de proyectos ambientales que proporciona respuestas precisas basadas en el contexto dado. Formatee *SIEMPRE* sus respuestas en HTML utilizando etiquetas como <p>, <ul>, <li>, <strong>, <em>, <h3>, <h4>, <blockquote> para mejorar la legibilidad y estructura. Sus respuestas se insertarán directamente en un editor de texto enriquecido Quill, así que asegúrese de que el HTML sea válido y bien estructurado. Responda siempre en español de manera directa, profesional y concisa.",
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
