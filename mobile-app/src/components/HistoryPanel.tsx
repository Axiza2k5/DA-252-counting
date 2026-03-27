// @ts-nocheck
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { History, X, Clock, Trash2 } from 'lucide-react-native';
import { HistoryItem } from '../types';
interface Props {
  history: HistoryItem[];
  onClose: () => void;
  onRestore: (item: HistoryItem) => void;
  onRemove: (id: string) => void;
}

export const HistoryPanel: React.FC<Props> = ({ history, onClose, onRestore, onRemove }) => {
  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-2">
          <History size={20} color="#86BAF3" />
          <Text className="text-sm font-semibold tracking-[4px] text-[#E9EBED] uppercase">
            Lịch sử quét
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} className="p-2 bg-[#5F8BE1]/15 rounded-full">
          <X size={16} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {history.length === 0 ? (
          <View className="items-center justify-center py-12 bg-[#5F8BE1]/10 rounded-3xl border border-[#5F8BE1]/15 mt-4">
            <Clock size={32} color="rgba(134,186,243,0.5)" />
            <Text className="text-[#E9EBED]/40 mt-3 text-xs tracking-widest uppercase">Trống</Text>
          </View>
        ) : (
          history.map(item => (
            <TouchableOpacity 
              key={item.id} 
              className="bg-[#5F8BE1]/15 p-4 rounded-3xl mb-4 flex-row items-center border border-[#5F8BE1]/25 relative overflow-hidden"
              onPress={() => onRestore(item)}
            >
              <View className="w-20 h-20 rounded-2xl overflow-hidden bg-[#3B5199]/40 mr-4">
                <Image source={{ uri: item.imageUrl }} className="w-full h-full opacity-80" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-baseline mb-1">
                  <Text className="text-3xl font-black text-white">{item.fishCount}</Text>
                  <Text className="text-[10px] font-bold tracking-widest uppercase text-[#86BAF3]/50 ml-2">con</Text>
                </View>
                <Text className="text-[10px] text-[#86BAF3]/40 uppercase tracking-widest mt-1">
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity 
                className="w-10 h-10 bg-red-500/10 items-center justify-center rounded-full ml-2"
                onPress={() => onRemove(item.id)}
              >
                <Trash2 size={16} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};
