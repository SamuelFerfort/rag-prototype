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
    immediatelyRender: false,
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
          ? `Found ${results.length} results!`
          : "No results found",
      );
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

  // Format preview text with highlighting for the query terms
  function formatPreview(text: string, maxLength = 200) {
    if (!text) return "";

    // Truncate text if needed
    let preview =
      text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

    // Highlight query terms if present
    if (query) {
      const terms = query.split(" ").filter((t) => t.length > 2);
      terms.forEach((term) => {
        const regex = new RegExp(term, "gi");
        preview = preview.replace(
          regex,
          (match) => `<span class="bg-yellow-200">${match}</span>`,
        );
      });
    }

    return preview;
  }

  return (
    <div className="border rounded-md p-4">
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

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Search</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query"
            className="flex-1 border p-2 rounded-md"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
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
            <ul className="space-y-4">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  className="border rounded-md p-3 hover:bg-gray-50"
                >
                  {/* Preview with highlighted search terms */}
                  <div
                    className="mb-2 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: formatPreview(result.text),
                    }}
                  />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Score: {Math.round(result.score * 100)}%
                      </span>

                      {result.source && (
                        <span className="text-xs text-gray-500">
                          Source: {result.source.filename}
                          {result.source.chunkPosition &&
                            ` (chunk ${result.source.chunkPosition})`}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => insertText(result.text)}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Insert All
                      </button>
                    </div>
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
