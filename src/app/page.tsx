import Editor from "../components/Editor";
import DocumentUploader from "../components/DocumentUploader";

export default function Home() {
  return (
    <main className="py-8 max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-center mb-8">
        RAG Prototype with TipTap, LangChain and Pinecone
      </h1>

      {/* Document Uploader */}
      <DocumentUploader />

      {/* Editor for text input and search */}
      <Editor />
    </main>
  );
}
