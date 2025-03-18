import Editor from "../components/Editor";

export default function Home() {
  return (
    <main className="py-8">
      <h1 className="text-2xl font-bold text-center mb-8">
        RAG Prototype with TipTap, OpenAI and Pinecone
      </h1>
      <Editor />
    </main>
  );
}
