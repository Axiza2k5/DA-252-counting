import { createContext, useContext, useState, ReactNode } from "react";

export interface HistoryEntry {
  id: string;
  imageUrl: string;
  fishCount: number;
  timestamp: Date;
  modelType: "local" | "online";
}

interface HistoryContextType {
  history: HistoryEntry[];
  addHistoryEntry: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([
    // Sample data for mockup
    {
      id: "1",
      imageUrl: "https://images.unsplash.com/photo-1605768816557-ceee9f8b127f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXNoJTIwdW5kZXJ3YXRlciUyMHNjaG9vbHxlbnwxfHx8fDE3NzI5NTk0NjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      fishCount: 23,
      timestamp: new Date("2026-03-08T14:30:00"),
      modelType: "online",
    },
    {
      id: "2",
      imageUrl: "https://images.unsplash.com/photo-1631300692372-d96d2d13c20c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGZpc2glMjBhcXVhcml1bXxlbnwxfHx8fDE3NzI5NDA4NDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      fishCount: 12,
      timestamp: new Date("2026-03-07T10:15:00"),
      modelType: "local",
    },
    {
      id: "3",
      imageUrl: "https://images.unsplash.com/photo-1711664223920-a1285deabf85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZmlzaCUyMHBvbmQlMjBvcmFuZ2V8ZW58MXx8fHwxNzcyOTU5NDYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      fishCount: 8,
      timestamp: new Date("2026-03-06T16:45:00"),
      modelType: "online",
    },
    {
      id: "4",
      imageUrl: "https://images.unsplash.com/photo-1767021871418-55627f70d9a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb2klMjBmaXNoJTIwc3dpbW1pbmd8ZW58MXx8fHwxNzcyOTU5NDY0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      fishCount: 5,
      timestamp: new Date("2026-03-05T09:20:00"),
      modelType: "local",
    },
  ]);

  const addHistoryEntry = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setHistory((prev) => [newEntry, ...prev]);
  };

  return (
    <HistoryContext.Provider value={{ history, addHistoryEntry }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}
