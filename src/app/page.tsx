import Editor from "../components/common/Editor";
import DocumentUploader from "../components/common/DocumentUploader";
import SignOut from "@/components/auth/sign-out";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return (
    <main className="py-8 max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-center mb-8">
        RAG Prototype with TipTap, LangChain and Pinecone
      </h1>
      {/* Document Uploader */}
      <DocumentUploader />
      {/* Editor for text input and search */}
      <Editor />
      <SignOut />
    </main>
  );
}
