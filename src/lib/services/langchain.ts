import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { pinecone } from "./pinecone";

// For PDF parsing
import pdfParse from "pdf-parse";
// For DOCX parsing
import mammoth from "mammoth";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});

/**
 * Process a text document
 */
export async function processDocument(
  text: string,
  metadata: Record<string, any> = {}
) {
  try {
    // Create a LangChain document
    const doc = new Document({
      pageContent: text,
      metadata,
    });

    // Split the document into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const docs = await textSplitter.splitDocuments([doc]);
    console.log(`Split document into ${docs.length} chunks`);

    // Get Pinecone index
    const index = pinecone.Index(process.env.PINECONE_INDEX!);

    // Store documents in Pinecone
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
    });

    return {
      chunkCount: docs.length,
      status: "success",
    };
  } catch (error) {
    console.error("Error processing document:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to process document");
  }
}

/**
 * Process a binary document (PDF, DOCX)
 */
export async function processDocumentBuffer(
  buffer: ArrayBuffer,
  metadata: Record<string, any> = {}
) {
  try {
    // Extract text based on file type
    let extractedText = "";

    if (metadata.type === "pdf") {
      // Parse PDF
      const data = await pdfParse(Buffer.from(buffer));
      extractedText = data.text;

      // Add page count to metadata
      metadata.pageCount = data.numpages;
    } else if (metadata.type === "docx") {
      // Parse DOCX
      const result = await mammoth.extractRawText({
        arrayBuffer: buffer,
      });
      extractedText = result.value;

      // Add any warnings to metadata
      if (result.messages.length > 0) {
        metadata.parsingWarnings = result.messages;
      }
    } else {
      throw new Error(`Unsupported binary file type: ${metadata.type}`);
    }

    // If extraction failed, throw error
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error(`Failed to extract text from ${metadata.type} file`);
    }

    console.log(
      `Extracted ${extractedText.length} characters from ${metadata.type} file`
    );

    // Now process the extracted text
    return processDocument(extractedText, metadata);
  } catch (error) {
    console.error("Error processing binary document:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to process binary document");
  }
}

/**
 * Search for documents using semantic similarity
 */
export async function searchSimilarDocuments(query: string, topK = 3) {
  try {
    // Get Pinecone index
    const index = pinecone.Index(process.env.PINECONE_INDEX!);

    // Create vector store
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
    });

    // Use similaritySearchWithScore instead of similaritySearch
    const results = await vectorStore.similaritySearchWithScore(query, topK);

    // Format results with actual scores and ensure unique IDs
    return results.map(([doc, score], index) => ({
      id: `${
        doc.metadata.id || doc.metadata.source || "unknown"
      }_chunk_${index}`,
      text: doc.pageContent,
      score: score,
      metadata: doc.metadata,
    }));
  } catch (error) {
    console.error("Error searching documents:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to search documents");
  }
}
