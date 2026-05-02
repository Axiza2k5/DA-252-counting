import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem } from '../types';
import { CONFIG } from '../config';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('@scanHistory');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveHistory = async (newHistory: HistoryItem[]) => {
    try {
      const trimmed = newHistory.slice(0, CONFIG.MAX_HISTORY_ITEMS);
      setHistory(trimmed);
      await AsyncStorage.setItem('@scanHistory', JSON.stringify(trimmed));
    } catch (e) {
      console.error(e);
    }
  };

  const removeHistoryItem = async (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
  };

  const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    saveHistory([newItem, ...history]);
  };

  return { history, removeHistoryItem, addHistoryItem };
}
