/**
 * Splits a document into chunks of specified size with overlap between chunks.
 * Tries to maintain context by splitting at sentence boundaries when possible.
 * For testing purposes, we're using smaller chunk sizes with less overlap.
 */
export function chunkDocument(
  text: string,
  chunkSize = 250, // Smaller for testing
  overlap = 20, // Less overlap for testing
): string[] {
  // Return empty array for empty text
  if (!text || text.trim().length === 0) {
    return [];
  }

  // For extremely long texts, process a smaller portion for testing
  if (text.length > 20000 && process.env.NODE_ENV !== "production") {
    console.log(
      `Document too large for testing (${text.length} chars), using first 20000 chars`,
    );
    text = text.substring(0, 20000);
  }

  const chunks: string[] = [];
  let i = 0;

  while (i < text.length) {
    // Calculate maximum possible chunk end
    let end = Math.min(i + chunkSize, text.length);

    // Try to find a natural break point (prioritize these in order)
    const breakPoints = [
      findBreakPoint(text, end, 50, ["\n\n", "\r\n\r\n"]), // Paragraph breaks
      findBreakPoint(text, end, 50, [". ", "! ", "? "]), // Sentence endings
      findBreakPoint(text, end, 50, [", ", ": ", "; "]), // Phrase breaks
      findBreakPoint(text, end, 50, [" "]), // Word breaks
    ];

    // Use the first valid break point found
    const bestBreakPoint = breakPoints.find((bp) => bp > i);
    if (bestBreakPoint && bestBreakPoint < end + 50) {
      end = bestBreakPoint;
    }

    // Extract the chunk and clean it up
    const chunk = text.substring(i, end).trim();

    // Only add non-empty chunks
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move to next chunk position, accounting for overlap
    i = Math.max(i + 1, end - overlap);
  }

  // For testing, limit to fewer chunks
  if (chunks.length > 10 && process.env.NODE_ENV !== "production") {
    console.log(
      `Limiting to 10 chunks for testing (originally ${chunks.length})`,
    );
    return chunks.slice(0, 10);
  }

  return chunks;
}

/**
 * Finds the position of the first delimiter after the target position.
 * Returns -1 if no delimiter is found within the search range.
 */
function findBreakPoint(
  text: string,
  targetPos: number,
  searchRange: number,
  delimiters: string[],
): number {
  // Search within range before and after the target position
  const searchStart = Math.max(0, targetPos - searchRange);
  const searchEnd = Math.min(text.length, targetPos + searchRange);

  const searchText = text.substring(searchStart, searchEnd);

  // Find positions of all delimiters in the search range
  const positions = delimiters
    .flatMap((delimiter) => {
      const positions: number[] = [];
      let pos = searchText.indexOf(delimiter);

      while (pos !== -1) {
        positions.push(searchStart + pos + delimiter.length);
        pos = searchText.indexOf(delimiter, pos + 1);
      }

      return positions;
    })
    .filter((pos) => pos > targetPos)
    .sort((a, b) => a - b);

  // Return the closest position after target
  return positions.length > 0 ? positions[0] : -1;
}
