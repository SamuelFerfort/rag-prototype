export function chunkDocument(text: string, chunkSize = 500, overlap = 100) {
  const chunks = [];
  let i = 0;

  while (i < text.length) {
    // Calculate chunk end with potential sentence boundary
    let end = Math.min(i + chunkSize, text.length);

    // Try to end at a sentence boundary if possible
    if (end < text.length) {
      const nextPeriod = text.indexOf(".", end - 50);
      if (nextPeriod > 0 && nextPeriod < end + 50) {
        end = nextPeriod + 1;
      }
    }

    chunks.push(text.substring(i, end).trim());
    i = end - overlap;
  }

  return chunks;
}
