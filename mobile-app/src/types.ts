export interface HistoryItem {
  id: string;
  imageUrl: string;
  fishCount: number | string;
  timestamp: string;
}

export interface InferenceResult {
  total: number | string;
  message: string;
}
