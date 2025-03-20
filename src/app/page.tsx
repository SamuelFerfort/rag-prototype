import Editor from "../components/common/Editor";
import DocumentUploader from "../components/common/DocumentUploader";

export default async function Home() {
  return (
    <main className="py-8 max-w-4xl mx-auto px-">
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
