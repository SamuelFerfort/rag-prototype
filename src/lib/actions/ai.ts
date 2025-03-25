"use server";

import { searchEmbeddings } from "@/lib/embeddings";
import { openai } from "@/lib/services/openai";
import { getCurrentUserId } from "@/lib/session";
import { projectRepository } from "@/lib/db/projects";
import { handleError } from "@/lib/utils";

interface AskAIParams {
  query: string;
  projectId: string;
  categoryId?: string;
  maxResults?: number;
}

export async function askAI({
  query,
  projectId,
  categoryId,
  maxResults = 5
}: AskAIParams) {
  try {
    // Verify user authentication and project access
    const userId = await getCurrentUserId();
    const project = await projectRepository.findById(projectId);
    
    if (!project) {
      return { success: false, error: "Project not found" };
    }
    
    // Verify user has access to this project
    const hasAccess = project.users.some(u => u.userId === userId);
    if (!hasAccess) {
      return { success: false, error: "You don't have access to this project" };
    }
    
    // Define search filter - include category if provided
    const filter: {
      projectId: string;
      categoryId?: string;
    } = {
      projectId
    };
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    
    // Search for relevant content
    const searchResults = await searchEmbeddings(query, filter, maxResults);
    
    if (searchResults.length === 0) {
      return {
        success: true,
        text: "No se encontró información relevante en el proyecto para responder a esta consulta. Por favor, proporciona más contexto o reformula tu pregunta.",
        sources: []
      };
    }
    
    // Prepare context from search results
    const context = searchResults
      .map((result, index) => {
        const source = result.metadata.filename 
          ? `Documento: ${result.metadata.filename}` 
          : result.metadata.type === "memory" 
            ? "Memoria del proyecto" 
            : "Documento";
            
        return `[${index + 1}] ${result.text}\n${source}`;
      })
      .join("\n\n");
    
    // Create prompt for OpenAI
    const systemPrompt = `
    Eres un asistente especializado en proyectos. Responde a la consulta del usuario basándote en el contexto proporcionado.
    Si no puedes responder con la información disponible, indícalo claramente.
    Sé conciso y relevante.
    `;
    
    const userPrompt = `
    CONTEXTO:
    ${context}
    
    CONSULTA: ${query}
    
    INSTRUCCIONES:
    1. Responde a la consulta utilizando solo la información proporcionada en el contexto.
    2. Si la información en el contexto no es suficiente para responder, indícalo claramente.
    3. Formato tu respuesta de manera clara y concisa.
    `;
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 500
    });
    
    // Prepare response
    return {
      success: true,
      text: completion.choices[0].message.content || "No se pudo generar una respuesta",
      sources: searchResults.map(result => ({
        text: result.text.substring(0, 150) + (result.text.length > 150 ? "..." : ""),
        score: result.score,
        metadata: {
          type: result.metadata.type,
          filename: result.metadata.filename,
          categoryName: result.metadata.categoryName
        }
      }))
    };
    
  } catch (error) {
    console.error("Error in askAI:", error);
    return handleError(error, "Failed to generate AI response");
  }
}