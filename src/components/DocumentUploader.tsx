"use client";

import { useState, useRef, useEffect } from "react";
import { uploadDocument } from "@/lib/actions/documents";

export default function DocumentUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTimeout, setUploadTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (uploadTimeout) clearTimeout(uploadTimeout);
    };
  }, [uploadTimeout]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus("");
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setUploadStatus("");
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // Reset state
    setIsUploading(true);
    setUploadStatus("Reading file...");
    setUploadProgress(10);

    // Set upload timeout detection
    const timeout = setTimeout(() => {
      setUploadStatus(
        "Still processing. This may take a while for large files..."
      );
      setUploadProgress((prev) => Math.min(prev + 10, 90)); // Increment but don't reach 100%

      // Set a second timeout for very long operations
      setTimeout(() => {
        setUploadStatus(
          "Processing is taking longer than expected. Please check console for errors."
        );
      }, 60000); // After a minute
    }, 15000); // After 15 seconds

    setUploadTimeout(timeout);

    try {
      // Read file content
      const text = await readFileContent(file);
      setUploadProgress(30);
      setUploadStatus(
        "Processing document... (creating chunks and embeddings)"
      );

      // Artificial progress updates to give feedback during long API calls
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev < 90) return prev + 5;
          return prev;
        });
      }, 3000);

      // Upload document (chunks and embeds it)
      const result = await uploadDocument(file.name, text);

      // Clean up intervals
      clearInterval(progressInterval);
      if (uploadTimeout) clearTimeout(uploadTimeout);

      setUploadProgress(100);
      setUploadStatus(
        `Success! Created ${result.chunkCount} chunks from "${result.filename}"`
      );
    } catch (error: any) {
      // Type as any to handle error.message
      console.error("Upload error:", error);
      setUploadStatus(
        `Error: ${error?.message || "Problem uploading document"}`
      );
      setUploadProgress(0);
    } finally {
      if (uploadTimeout) clearTimeout(uploadTimeout);
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    setIsUploading(false);
    setUploadStatus("Upload cancelled");
    setUploadProgress(0);
    if (uploadTimeout) clearTimeout(uploadTimeout);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file content"));
        }
      };

      reader.onerror = () => reject(new Error("File reading error"));

      // Only handling text files for now
      if (
        file.type.startsWith("text/") ||
        file.name.endsWith(".md") ||
        file.name.endsWith(".txt")
      ) {
        reader.readAsText(file);
      } else {
        reject(
          new Error("Unsupported file type. Only text files are supported.")
        );
      }
    });
  };

  return (
    <div className="border rounded-md p-4 mb-8">
      <h2 className="text-lg font-semibold mb-4">Upload Document</h2>

      <div
        className="border-2 border-dashed rounded-md p-8 mb-4 text-center cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.md,.text,text/plain,text/markdown"
        />

        {file ? (
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-500">
              {(file.size / 1024).toFixed(1)} KB • {file.type || "text/plain"}
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-2">Drag & drop a file here, or click to select</p>
            <p className="text-sm text-gray-500">
              Supported formats: .txt, .md
            </p>
          </div>
        )}
      </div>

      {file && (
        <div>
          {isUploading ? (
            <>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={cancelUpload}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Cancel
                </button>
                <div className="text-sm flex-1 flex items-center">
                  {uploadStatus}
                </div>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                Large files or first-time uploads may take longer due to API
                rate limits
              </p>
            </>
          ) : (
            <div className="flex flex-col">
              <button
                onClick={handleUpload}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mb-2"
              >
                Upload & Process Document
              </button>

              {uploadStatus && <p className="text-sm mt-1">{uploadStatus}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
