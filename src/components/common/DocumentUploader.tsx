"use client";

import { useState, useRef } from "react";
import { storeProcessedDocument } from "@/lib/actions/storage";
import { getFileType } from "@/lib/utils";

const BACKEND_URL = process.env.NEXT_PUBLIC_DOCUMENT_PROCESSOR_URL;

export default function DocumentUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus("");
      setUploadProgress(0);
      setIsSuccess(false);
      setIsError(false);
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
      setIsSuccess(false);
      setIsError(false);
    }
  };

  const resetUploader = () => {
    setFile(null);
    setUploadStatus("");
    setUploadProgress(0);
    setIsSuccess(false);
    setIsError(false);

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("Preparing file for upload...");
    setUploadProgress(10);
    setIsError(false);

    try {
      // Generate document ID
      const timestamp = Date.now();
      const cleanFilename = file.name.replace(/\W+/g, "_").toLowerCase();
      const docId = `doc_${cleanFilename}_${timestamp}`;

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", docId);

      // Add metadata
      const metadata = {
        project_id: docId,
        filename: file.name,
        type: getFileType(file),
        timestamp: new Date().toISOString(),
      };
      formData.append("metadata", JSON.stringify(metadata));
      formData.append("strategy", "fast");

      setUploadStatus("Uploading to processing server...");
      setUploadProgress(30);

      // Upload directly to the backend
      const response = await fetch(`${BACKEND_URL}/process`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      setUploadProgress(80);
      setUploadStatus("Processing document...");

      // Get the processed chunks and embeddings
      const result = await response.json();

      // Now store the chunks and embeddings in Pinecone using a server action
      setUploadStatus("Storing in vector database...");
      const storageResult = await storeProcessedDocument({
        docId,
        filename: file.name,
        chunks: result.chunks,
        embeddings: result.embeddings,
      });

      setUploadProgress(100);
      setUploadStatus(
        `Success! Processed "${file.name}" into ${result.count} chunks`,
      );
      setIsSuccess(true);

      // Clear file input for next upload
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(
        `Error: ${
          error instanceof Error ? error.message : "Problem uploading document"
        }`,
      );
      setUploadProgress(0);
      setIsError(true);
    } finally {
      setIsUploading(false);
    }
  };

  // List of supported file types for the input element
  const supportedFileTypes = ".txt,.pdf,.docx";

  return (
    <div className="border border-gray-700 p-4 rounded-md mb-8 bg-gray-800">
      <h2 className="text-lg font-semibold mb-4">Upload Document</h2>

      {isSuccess ? (
        <div className="text-center py-6">
          <div className="mb-4 text-green-400">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="mb-4">{uploadStatus}</p>
          <button
            onClick={resetUploader}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Upload Another Document
          </button>
        </div>
      ) : (
        <>
          <div
            className={`border-2 border-dashed ${
              isError ? "border-red-500" : "border-gray-600"
            } rounded-md p-8 mb-4 text-center cursor-pointer`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept={supportedFileTypes}
            />

            {file ? (
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB • {getFileType(file)}
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-2">
                  Drag & drop a file here, or click to select
                </p>
                <p className="text-sm text-gray-400">
                  Supported formats: .txt, .md, .pdf, .docx
                </p>
              </div>
            )}
          </div>

          {file && (
            <div>
              {isUploading ? (
                <>
                  <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1">{uploadStatus}</p>
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpload}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Upload & Process
                  </button>

                  {isError && (
                    <button
                      onClick={resetUploader}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                      Start Over
                    </button>
                  )}
                </div>
              )}

              {isError && (
                <p className="mt-2 text-red-400 text-sm">{uploadStatus}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
