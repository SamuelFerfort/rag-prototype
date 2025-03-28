/**
 * Sanitize an ID to be Pinecone-compatible (ASCII only)
 */
export function sanitizeId(id: string): string {
  // Remove any non-ASCII characters and replace spaces/special chars with underscores
  return id
    .normalize("NFD") // Normalize diacritics
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
    .replace(/[^\x00-\x7F]/g, "") // Remove remaining non-ASCII chars
    .replace(/[\s.]+/g, "_") // Replace spaces and dots with underscores
    .replace(/[^a-zA-Z0-9_-]/g, "") // Remove any other special characters
    .substring(0, 512); // Ensure it's not too long
}
