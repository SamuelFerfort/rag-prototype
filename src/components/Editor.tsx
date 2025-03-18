"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useState } from "react";
import {
  searchDocuments,
  addDocument,
  type SearchResult,
} from "@/lib/actions/search";

export default function Editor() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
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
      setStatus(
        results.length > 0
          ? `Found ${results.length} results`
          : "No results found",
      );
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error?.message || "Unknown error"}`);
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
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error?.message || "Unknown error"}`);
    }
  }

  // Simple highlight function
  function formatPreview(text: string, maxLength = 200) {
    if (!text) return "";

    // Truncate text if needed
    let preview =
      text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

    // Highlight query terms
    if (query) {
      const terms = query.split(" ").filter((t) => t.length > 2);
      terms.forEach((term) => {
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escapedTerm})`, "gi");
        preview = preview.replace(
          regex,
          '<span style="background-color: #ffd700; color: #000000;">$1</span>',
        );
      });
    }

    return preview;
  }

  return (
    <div className="mb-8 border border-gray-700 p-4 rounded-md bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">Editor</h2>
      <div className="border border-gray-600 rounded-md p-2 mb-4 min-h-60 bg-gray-900">
        <EditorContent editor={editor} />
      </div>
      <button
        onClick={saveCurrentDocument}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Save & Index Document
      </button>
      <p className="text-sm mt-2 text-gray-400">
        Save the current text as a document so it can be searched later
      </p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Search</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query"
            className="flex-1 border border-gray-600 p-2 rounded-md bg-gray-900 text-white"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-800"
          >
            Search
          </button>
        </div>

        {status && <p className="mb-4 text-sm">{status}</p>}

        {searchResults.length > 0 && (
          <div className="border border-gray-700 rounded-md p-4">
            <h3 className="font-medium mb-2">Search Results</h3>
            <ul className="space-y-3">
              {searchResults.map((result, idx) => (
                <li
                  key={result.id || idx}
                  className="border-b border-gray-700 pb-3"
                >
                  <div
                    className="mb-2 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: formatPreview(result.text),
                    }}
                  />

                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">
                      Score: {(result.score * 100).toFixed(1)}%
                      {result.metadata?.filename &&
                        ` • Source: ${result.metadata.filename}`}
                    </span>
                    <button
                      onClick={() => insertText(result.text)}
                      className="text-xs bg-blue-600 px-2 py-1 rounded text-white"
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
