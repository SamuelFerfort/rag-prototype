import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session"; // Adjust import based on your auth implementation
import Editor from "../components/common/Editor";

export default async function Home() {
  // Check if user is authenticated
  const user = await getCurrentUser();
  
  // Redirect based on auth status
  if (!user) {
    redirect("/signin");
  } else {
    redirect("/projects");
  }
  
  // This return is just a fallback and won't actually be rendered
  return null;
}
