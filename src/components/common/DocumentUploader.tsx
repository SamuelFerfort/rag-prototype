"use client";

import { useState, useRef } from "react";
import { uploadDocument } from "@/lib/actions/documents";

export default function DocumentUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setIsUploading(true);
    setUploadStatus("Reading file...");
    setUploadProgress(10);

    try {
      // Read file content based on file type
      const fileContent = await readFile(file);
      setUploadProgress(30);
      setUploadStatus(`Processing ${getFileTypeLabel(file)} with LangChain...`);

      // Set up progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev < 85) return prev + 5;
          return prev;
        });
      }, 1000);

      // Upload document
      const result = await uploadDocument(
        file.name,
        fileContent,
        getFileType(file)
      );

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus(
        `Success! Processed "${result.filename}" into ${result.chunkCount} chunks`
      );
    } catch (error) {
      // We're allowing `any` here to avoid TypeScript errors
      console.error("Upload error:", error);
      setUploadStatus(
        `Error: ${
          error instanceof Error ? error.message : "Problem uploading document"
        }`
      );
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileType = (file: File): string => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";

    if (file.type.includes("pdf") || extension === "pdf") return "pdf";
    if (
      file.type.includes("word") ||
      extension === "docx" ||
      extension === "doc"
    )
      return "docx";
    if (file.type.includes("text") || extension === "txt") return "txt";
    if (extension === "md") return "md";

    return "txt"; // Default to text
  };

  const getFileTypeLabel = (file: File): string => {
    const type = getFileType(file);
    switch (type) {
      case "pdf":
        return "PDF";
      case "docx":
        return "Word document";
      case "md":
        return "Markdown";
      default:
        return "text file";
    }
  };

  const readFile = async (file: File): Promise<string> => {
    const fileType = getFileType(file);

    // For text-based files, use the simple text reader
    if (fileType === "txt" || fileType === "md") {
      return readFileAsText(file);
    }

    // For binary files, we need to use ArrayBuffer and process accordingly
    const buffer = await readFileAsArrayBuffer(file);

    // Convert ArrayBuffer to appropriate format based on file type
    if (fileType === "pdf") {
      // Client-side PDF parsing is handled in the server action
      // Just return a placeholder here and send the raw buffer
      return JSON.stringify({
        type: "pdf",
        name: file.name,
        size: file.size,
        buffer: Array.from(new Uint8Array(buffer)),
      });
    }

    if (fileType === "docx") {
      // Client-side DOCX parsing is handled in the server action
      // Just return a placeholder here and send the raw buffer
      return JSON.stringify({
        type: "docx",
        name: file.name,
        size: file.size,
        buffer: Array.from(new Uint8Array(buffer)),
      });
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("Failed to read file content"));
        }
      };
      reader.onerror = () => reject(new Error("File reading error"));
      reader.readAsText(file);
    });
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as ArrayBuffer);
        } else {
          reject(new Error("Failed to read file content"));
        }
      };
      reader.onerror = () => reject(new Error("File reading error"));
      reader.readAsArrayBuffer(file);
    });
  };

  // List of supported file types for the input element
  const supportedFileTypes = ".txt,.md,.pdf,.docx";

  return (
    <div className="border border-gray-700 p-4 rounded-md mb-8 bg-gray-800">
      <h2 className="text-lg font-semibold mb-4">Upload Document</h2>

      <div
        className="border-2 border-dashed border-gray-600 rounded-md p-8 mb-4 text-center cursor-pointer"
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
              {(file.size / 1024).toFixed(1)} KB • {getFileTypeLabel(file)}
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-2">Drag & drop a file here, or click to select</p>
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
            <button
              onClick={handleUpload}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Upload & Process
            </button>
          )}
        </div>
      )}
    </div>
  );
}
