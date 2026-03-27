export const CONFIG = {
  // Base URL for the backend API
  // Override via EXPO_PUBLIC_API_URL or change IP Address here if Ngrok gets taken down
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  MAX_HISTORY_ITEMS: 20,
};
