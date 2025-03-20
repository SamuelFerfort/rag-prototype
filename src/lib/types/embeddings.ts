export interface ChunkMetadata {
  project_id?: string;
  filename?: string;
  type?: string;
  timestamp?: string;
  page?: number;
  source?: string;
  [key: string]: any; // For any other metadata fields
}

export interface Chunk {
  id: string;
  text: string;
  metadata: ChunkMetadata;
}

export type Embedding = number[];
