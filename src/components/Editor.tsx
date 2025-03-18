"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useState } from "react";
import { searchDocuments, addDocument } from "@/lib/actions/search";

export default function Editor() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    { id: string; text: string; score: number }[]
  >([]);
  const [status, setStatus] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start typing...",
      }),
    ],
    content: "<p></p>",
  });

  async function handleSearch() {
    if (!query) return;

    setIsSearching(true);
    setStatus("Searching...");
    try {
      const results = await searchDocuments(query);
      setSearchResults(results);
      setStatus(results.length > 0 ? "Found results!" : "No results found");
    } catch (error) {
      console.error(error);
      setStatus("Error searching documents");
    } finally {
      setIsSearching(false);
    }
  }

  function insertText(text: string) {
    if (!editor) return;

    editor.chain().focus().insertContent(text).run();
  }

  async function saveCurrentDocument() {
    if (!editor || !editor.getText()) return;

    setStatus("Saving document...");
    try {
      await addDocument(editor.getText());
      setStatus("Document saved and indexed!");
    } catch (error) {
      console.error(error);
      setStatus("Error saving document");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8 border p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Editor</h2>
        <div className="border rounded-md p-2 mb-4 min-h-60">
          <EditorContent editor={editor} />
        </div>
        <button
          onClick={saveCurrentDocument}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Save & Index Document
        </button>
        <p className="text-sm mt-2 text-gray-500">
          Save the current text as a document so it can be searched later
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Search</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query"
            className="flex-1 border p-2 rounded-md"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            Search
          </button>
        </div>

        {status && <p className="mb-4 text-sm">{status}</p>}

        {searchResults.length > 0 && (
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Search Results</h3>
            <ul className="space-y-2">
              {searchResults.map((result) => (
                <li key={result.id} className="border-b pb-2">
                  <p className="mb-1 text-sm">
                    {result.text.substring(0, 100)}...
                  </p>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      Score: {Math.round(result.score * 100)}%
                    </span>
                    <button
                      onClick={() => insertText(result.text)}
                      className="text-xs text-blue-500"
                    >
                      Insert
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
