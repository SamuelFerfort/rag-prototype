import { load } from "cheerio";
import { Chunk } from "@/lib/types/embeddings";
import { openai } from "@/lib/services/openai";

interface ContentChunk {
  text: string;
  metadata: {
    position: number;
    total: number;
    type: "title" | "content";
  };
}

export function extractTextFromHtml(html: string): string {
  const $ = load(html);

  // Remove script and style elements
  $("script, style").remove();

  // Get text content
  return $("body").text().trim();
}

export function chunkContent(
  title: string,
  content: string,
  maxChunkSize: number = 1000
): ContentChunk[] {
  const chunks: ContentChunk[] = [];

  // Always include title as first chunk
  chunks.push({
    text: title,
    metadata: {
      position: 0,
      total: 1, // Will update this later
      type: "title",
    },
  });

  // Split content by paragraphs first
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length <= maxChunkSize) {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    } else {
      if (currentChunk) {
        chunks.push({
          text: currentChunk,
          metadata: {
            position: chunks.length,
            total: 1, // Will update this later
            type: "content",
          },
        });
      }
      currentChunk = paragraph;
    }
  }

  // Add the last chunk if there's anything left
  if (currentChunk) {
    chunks.push({
      text: currentChunk,
      metadata: {
        position: chunks.length,
        total: 1,
        type: "content",
      },
    });
  }

  // Update total count in metadata
  const total = chunks.length;
  chunks.forEach((chunk) => {
    chunk.metadata.total = total;
  });

  return chunks;
}

export async function processMemoryContent(
  memoryId: string,
  projectId: string,
  categoryId: string,
  categoryName: string,
  title: string,
  htmlContent: string
): Promise<{ chunks: Chunk[]; embeddings: number[][] }> {
  // Extract plain text from HTML
  const plainText = extractTextFromHtml(htmlContent);

  // Get content chunks
  const contentChunks = chunkContent(title, plainText);

  // Transform to the expected Chunk format
  const chunks: Chunk[] = contentChunks.map((chunk, index) => ({
    id: `memory_${memoryId}_chunk_${index}`,
    text: chunk.text,
    metadata: {
      position: chunk.metadata.position,
      total: chunk.metadata.total,
      memoryId,
      projectId,
      categoryId,
      categoryName,
      type: "memory",
      isTitle: chunk.metadata.type === "title",
    },
  }));

  // Generate embeddings for all chunks at once
  const embeddings = await generateEmbeddings(
    chunks.map((chunk) => chunk.text)
  );

  return { chunks, embeddings };
}

// Generate embeddings for multiple texts in a batch
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  return response.data.map((item) => item.embedding);
}
