import Editor from "../components/Editor";
import DocumentUploader from "../components/DocumentUploader";

export default function Home() {
  return (
    <main className="py-8 px-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        RAG Prototype with TipTap, OpenAI and Pinecone
      </h1>

      <div className="grid grid-cols-1 gap-8">
        {/* Document Uploader Component */}
        <DocumentUploader />

        {/* Editor Component */}
        <Editor />
      </div>
    </main>
  );
}
