import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { User, Lock, ArrowRight, ScanLine, AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';

interface AuthProps {
  onLoginSuccess: () => void;
}

export function Auth({ onLoginSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (username.length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login Flow
        const response = await fetch(`${CONFIG.API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Đăng nhập thất bại');
        }

        await AsyncStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          await AsyncStorage.setItem('refresh_token', data.refresh_token);
        }
        onLoginSuccess();
      } else {
        // Register Flow
        const response = await fetch(`${CONFIG.API_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Đăng ký thất bại');
        }

        setIsLogin(true);
        setError('Đăng ký thành công! Vui lòng đăng nhập.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#3B5199]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 pt-12 pb-8 flex-col justify-center relative z-10">
            
            {/* BRANDING */}
            <View className="items-center mb-12 opacity-80">
              <View className="flex-row items-center gap-3">
                <ScanLine size={32} color="#86BAF3" strokeWidth={1.5} />
                <Text className="font-bold tracking-[4px] text-xl uppercase text-[#E9EBED]">
                  Aqua<Text className="text-[#86BAF3]">Vision</Text>
                </Text>
              </View>
            </View>

            <View className="mb-10">
              <Text className="text-5xl font-black leading-tight text-white opacity-90 mb-2">
                {isLogin ? "WELCOME\nBACK" : "JOIN\nUS"}
              </Text>
              <View className="border-l-2 border-[#86BAF3] pl-4 mt-2">
                <Text className="text-lg font-light text-[#E9EBED] mb-1">
                  {isLogin ? "Đăng nhập để tiếp tục" : "Đăng ký tài khoản mới"}
                </Text>
                <Text className="text-xs font-light text-[#E9EBED]/70">
                  {isLogin 
                    ? "Truy cập hệ thống đếm cá giống tự động." 
                    : "Bắt đầu trải nghiệm công nghệ AI nhận diện."}
                </Text>
              </View>
            </View>

            {/* FORM */}
            <View className="bg-[#5F8BE1]/10 p-6 rounded-3xl border border-[#5F8BE1]/20 shadow-lg">
              <Text className="text-xl font-bold tracking-[2px] uppercase text-[#E9EBED] mb-6">
                {isLogin ? "Đăng nhập" : "Đăng ký"}
              </Text>

              {error ? (
                <View className={`mb-6 p-4 rounded-xl flex-row items-start gap-3 border ${error.includes('thành công') ? 'bg-[#86BAF3]/20 border-[#86BAF3]/30' : 'bg-red-500/20 border-red-500/30'}`}>
                  <AlertCircle size={18} color={error.includes('thành công') ? '#86BAF3' : '#FCA5A5'} className="mt-0.5" />
                  <Text className={`flex-1 text-sm ${error.includes('thành công') ? 'text-[#86BAF3]' : 'text-red-200'}`}>
                    {error}
                  </Text>
                </View>
              ) : null}

              <View className="space-y-4">
                <View>
                  <Text className="text-[10px] font-bold tracking-[2px] text-[#E9EBED]/70 uppercase ml-1 mb-1">Tên đăng nhập</Text>
                  <View className="flex-row items-center bg-[#5F8BE1]/15 border border-[#5F8BE1]/20 rounded-xl px-4 h-14">
                    <User size={18} color="rgba(233,235,237,0.4)" />
                    <TextInput
                      value={username}
                      onChangeText={setUsername}
                      className="flex-1 ml-3 text-[#E9EBED]"
                      placeholder="Nhập tên đăng nhập..."
                      placeholderTextColor="rgba(233,235,237,0.4)"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View className="mt-4">
                  <Text className="text-[10px] font-bold tracking-[2px] text-[#E9EBED]/70 uppercase ml-1 mb-1">Mật khẩu</Text>
                  <View className="flex-row items-center bg-[#5F8BE1]/15 border border-[#5F8BE1]/20 rounded-xl px-4 h-14">
                    <Lock size={18} color="rgba(233,235,237,0.4)" />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      className="flex-1 ml-3 text-[#E9EBED]"
                      placeholder="Nhập mật khẩu..."
                      placeholderTextColor="rgba(233,235,237,0.4)"
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  className={`mt-8 bg-[#86BAF3] h-14 rounded-xl flex-row items-center justify-center gap-3 ${loading ? 'opacity-50' : ''}`}
                >
                  {loading ? (
                    <ActivityIndicator color="#1E293B" />
                  ) : (
                    <>
                      <Text className="text-[#1E293B] font-bold tracking-[2px] uppercase text-sm">
                        {isLogin ? "Đăng nhập" : "Đăng ký ngay"}
                      </Text>
                      <ArrowRight size={18} color="#1E293B" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View className="mt-8 items-center">
                <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(''); }}>
                  <Text className="text-[10px] font-bold tracking-[2px] text-[#E9EBED]/60 uppercase">
                    {isLogin ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
