import { generateEmbedding } from "@/lib/embeddings";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const embedding = await generateEmbedding(text);

    return NextResponse.json({
      embedding: embedding.slice(0, 10), // Just show first 10 values
      dimensionCount: embedding.length,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to generate embedding" },
      { status: 500 },
    );
  }
}
