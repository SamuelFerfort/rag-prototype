import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { pinecone } from "./pinecone";
// Import PDF.js
import * as pdfjsLib from "pdfjs-dist";
// For DOCX parsing
import mammoth from "mammoth";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

// Set the worker source for PDF.js
// This is crucial for Node.js environment in Next.js
pdfjsLib.GlobalWorkerOptions.workerSrc = "pdfjs-dist/build/pdf.worker.mjs";

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
  metadata: Record<string, any> = {},
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
  } catch (error: unknown) {
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
  metadata: Record<string, any> = {},
) {
  try {
    let extractedText = "";

    if (metadata.type === "pdf") {
      try {
        // Load the PDF document with PDF.js
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const pageCount = pdf.numPages;
        metadata.pageCount = pageCount;

        // Extract text from all pages
        const textPromises = [];
        for (let i = 1; i <= pageCount; i++) {
          textPromises.push(
            pdf.getPage(i).then((page) =>
              page.getTextContent().then((content) =>
                content.items
                  .map((item: any) => item.str)
                  .join(" ")
                  .trim(),
              ),
            ),
          );
        }

        // Combine text from all pages
        const textArray = await Promise.all(textPromises);
        extractedText = textArray.join("\n\n");
      } catch (pdfError) {
        console.error("PDF extraction error:", pdfError);
        throw new Error(
          `Failed to extract text from PDF: ${
            pdfError instanceof Error ? pdfError.message : "Unknown error"
          }`,
        );
      }
    } else if (metadata.type === "docx") {
      try {
        // Parse DOCX with mammoth
        const result = await mammoth.extractRawText({
          arrayBuffer: buffer,
        });
        extractedText = result.value;

        // Add any warnings to metadata
        if (result.messages.length > 0) {
          metadata.parsingWarnings = result.messages;
        }
      } catch (docxError) {
        console.error("DOCX extraction error:", docxError);
        throw new Error(
          `Failed to extract text from DOCX: ${
            docxError instanceof Error ? docxError.message : "Unknown error"
          }`,
        );
      }
    } else {
      throw new Error(`Unsupported binary file type: ${metadata.type}`);
    }

    // If extraction failed, throw error
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error(
        `Failed to extract text from ${metadata.type} file (empty content)`,
      );
    }

    console.log(
      `Extracted ${extractedText.length} characters from ${metadata.type} file`,
    );

    // Now process the extracted text
    return processDocument(extractedText, metadata);
  } catch (error: unknown) {
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

    // Format results with actual scores
    return results.map(([doc, score]) => ({
      id: doc.metadata.id || doc.metadata.source || "unknown",
      text: doc.pageContent,
      score: score,
      metadata: doc.metadata,
    }));
  } catch (error: unknown) {
    console.error("Error searching documents:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to search documents");
  }
}
