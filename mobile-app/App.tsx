// @ts-nocheck
import './global.css';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, StatusBar, Animated, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, CheckCircle, ScanLine, History, Cpu, Globe, X, LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebViewMessageEvent } from 'react-native-webview';

import { Auth } from './src/components/Auth';

import { useHistory } from './src/hooks/useHistory';
import { HistoryPanel } from './src/components/HistoryPanel';
import { MLWebView } from './src/components/MLWebView';
import { CONFIG } from './src/config';
import { InferenceResult, HistoryItem } from './src/types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InferenceResult | null>(null);
  
  const [modelType, setModelType] = useState<'online' | 'local'>('online');
  const [showHistory, setShowHistory] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [cpuReady, setCpuReady] = useState(false);
  const webviewRef = useRef<any>(null);

  // Animation refs
  const modeSlideAnim = useRef(new Animated.Value(0)).current;
  const historyFadeAnim = useRef(new Animated.Value(0)).current;
  const historySlideAnim = useRef(new Animated.Value(30)).current;
  const mainFadeAnim = useRef(new Animated.Value(1)).current;

  const { history, removeHistoryItem, addHistoryItem } = useHistory();

  // Pre-request permissions and check auth on mount
  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      const token = await AsyncStorage.getItem('access_token');
      setIsAuthenticated(!!token);
      setAuthChecking(false);
    })();
  }, []);

  // Server health check - ping every 10 seconds
  useEffect(() => {
    const checkServer = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${CONFIG.API_URL}/`, { signal: controller.signal });
        clearTimeout(timeoutId);
        setServerOnline(res.ok);
      } catch {
        setServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  // Mode toggle animation
  useEffect(() => {
    Animated.spring(modeSlideAnim, {
      toValue: modelType === 'online' ? 0 : 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [modelType]);

  // History panel animation
  useEffect(() => {
    if (showHistory) {
      Animated.parallel([
        Animated.timing(historyFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(historySlideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(mainFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(historyFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(historySlideAnim, { toValue: 30, duration: 200, useNativeDriver: true }),
        Animated.timing(mainFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [showHistory]);

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'SYS' && data.status === 'dom_ready') {
    } else if (data.type === 'SYS' && data.status === 'ready') {
      console.log('WebView ONNX model is ready');
      setCpuReady(true);
    } else if (data.type === 'RESULT') {
      setResult({
        total: data.count,
        message: `Đếm bằng thiết bị (${data.latency_ms}ms)`
      });
      const b64Image = `data:image/jpeg;base64,${data.result_image_base64}`;
      setImageUri(b64Image);
      
      addHistoryItem({ imageUrl: b64Image, fishCount: data.count });
      setLoading(false);
    } else if (data.type === 'ERROR') {
      console.error('WebView Error:', data.message);
      Alert.alert("Lỗi WebView Chi Tiết", data.message);
      setResult({ total: "ERR", message: String(data.message).substring(0, 40) });
      setLoading(false);
    }
  };

  const processOnline = async (uri: string) => {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('file', { uri, name: filename, type } as any);

      const token = await AsyncStorage.getItem('access_token');

      let response = await fetch(`${CONFIG.API_URL}/predict`, {
        method: 'POST',
        body: formData,
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
      });

      if (response.status === 401) {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const refreshRes = await fetch(`${CONFIG.API_URL}/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              await AsyncStorage.setItem('access_token', refreshData.access_token);
              
              // Retry
              response = await fetch(`${CONFIG.API_URL}/predict`, {
                method: 'POST',
                body: formData,
                headers: { 
                  'Authorization': `Bearer ${refreshData.access_token}` 
                },
              });
            } else {
              handleLogout();
              throw new Error('Phiên đăng nhập đã hết hạn');
            }
          } catch (e) {
            handleLogout();
            throw new Error('Phiên đăng nhập đã hết hạn');
          }
        } else {
          handleLogout();
          throw new Error('Phiên đăng nhập đã hết hạn');
        }
      }

      if (!response.ok) throw new Error('API server không phản hồi');
      const data = await response.json();

      let finalUri = uri;
      if (data.result_image_base64) {
        finalUri = `data:image/jpeg;base64,${data.result_image_base64}`;
        setImageUri(finalUri);
      }

      setResult({ total: data.count, message: "Phân tích qua Server" });
      addHistoryItem({ imageUrl: finalUri, fishCount: data.count });
    } catch (error) {
      console.error(error);
      setResult({ total: "ERR", message: "Kết nối server thất bại" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (uri: string, base64Str?: string | null) => {
    setLoading(true);
    setResult(null);

    if (modelType === 'local') {
      if (!base64Str) {
        setResult({ total: "ERR", message: "Không đọc được Base64" });
        setLoading(false);
        return;
      }
      webviewRef.current?.injectJavaScript(`
        document.dispatchEvent(new MessageEvent('message', {
          data: JSON.stringify({ type: 'INFER', image: 'data:image/jpeg;base64,${base64Str}' })
        }));
        true;
      `);
    } else {
      processOnline(uri);
    }
  };

  const pickImage = async (useCamera: boolean = false) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.getCameraPermissionsAsync();
        if (status !== 'granted') {
          const req = await ImagePicker.requestCameraPermissionsAsync();
          if (req.status !== 'granted') { Alert.alert('Cần cấp quyền', 'Vui lòng cấp quyền sử dụng camera.'); return; }
        }
      } else {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (req.status !== 'granted') { Alert.alert('Cần cấp quyền', 'Vui lòng cấp quyền thư viện ảnh.'); return; }
        }
      }

      const needBase64 = modelType === 'local';
      let pickerResult;
      if (useCamera) {
        pickerResult = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: needBase64 });
      } else {
        pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: needBase64 });
      }

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const asset = pickerResult.assets[0];
        setImageUri(asset.uri);
        handleUpload(asset.uri, asset.base64);
      }
    } catch (E) {
      console.log(E);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    // Clear transient state for UX
    setImageUri(null);
    setResult(null);
    setShowHistory(false);
  };

  if (authChecking) {
    return (
      <SafeAreaView className="flex-1 bg-[#3B5199] items-center justify-center">
        <ActivityIndicator size="large" color="#86BAF3" />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#3B5199]">
      <StatusBar barStyle="light-content" />

      {/* SEAFOAM BACKGROUND */}
      <View className="absolute inset-0 bg-[#3B5199]" />

      {/* COMPONENT: WebView Lõi AI */}
      <MLWebView ref={webviewRef} onMessage={handleWebViewMessage} />

      <View className="flex-1 px-6 pt-12 pb-6 flex-col relative z-10">
        
        {/* Main Content */}
        <Animated.View style={{ flex: 1, opacity: mainFadeAnim }} pointerEvents={showHistory ? 'none' : 'auto'}>
            {/* HEADER BLOCK */}
            <View className="flex-row justify-between items-center mb-8">
              <View className="flex-row items-center gap-3 opacity-80">
                <ScanLine size={26} color="#86BAF3" strokeWidth={1.5} />
                <Text className="font-bold tracking-[4px] text-lg uppercase text-[#E9EBED]">
                  Aqua<Text className="text-[#86BAF3]">Vision</Text>
                </Text>
              </View>
              
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => setShowHistory(true)} className="flex-row items-center gap-2 bg-[#5F8BE1]/15 py-2 px-3 rounded-full border border-[#5F8BE1]/30">
                  <History size={16} color="#86BAF3" />
                  <Text className="text-[10px] font-bold tracking-[2px] uppercase text-[#E9EBED]/80">Lịch sử</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center w-8 h-8 bg-red-500/10 rounded-full border border-red-500/30">
                  <LogOut size={14} color="#FCA5A5" />
                </TouchableOpacity>
              </View>
            </View>

            {/* MODEL SELECTOR BLOCK */}
            <View className="flex-row p-1 bg-[#5F8BE1]/10 rounded-full border border-[#5F8BE1]/20 mb-8 self-start relative">
              <Animated.View 
                style={{
                  position: 'absolute',
                  top: 4, bottom: 4, left: 4,
                  width: 86,
                  backgroundColor: 'rgba(95,139,225,0.25)',
                  borderRadius: 9999,
                  transform: [{
                    translateX: modeSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 86]
                    })
                  }]
                }}
              />
              <TouchableOpacity 
                onPress={() => setModelType('online')} 
                className="py-2 w-[86px] rounded-full flex-row items-center justify-center gap-2"
              >
                <Globe size={14} color={modelType === 'online' ? '#86BAF3' : 'rgba(233,235,237,0.4)'} />
                <Text className={`text-[10px] font-bold tracking-[2px] uppercase ${modelType === 'online' ? 'text-[#86BAF3]' : 'text-[#E9EBED]/40'}`}>
                  Online
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setModelType('local')} 
                className="py-2 w-[86px] rounded-full flex-row items-center justify-center gap-2"
              >
                <Cpu size={14} color={modelType === 'local' ? '#86BAF3' : 'rgba(233,235,237,0.4)'} />
                <Text className={`text-[10px] font-bold tracking-[2px] uppercase ${modelType === 'local' ? 'text-[#86BAF3]' : 'text-[#E9EBED]/40'}`}>
                  Local
                </Text>
              </TouchableOpacity>
            </View>

            {/* STATUS BAR BLOCK */}
            <View className="flex-row justify-between items-center mb-4">
              <View className="px-4 py-2 bg-[#5F8BE1]/10 rounded-full border border-[#5F8BE1]/20 flex-row items-center gap-2">
                <View className={`w-2 h-2 rounded-full ${
                  loading ? 'bg-yellow-400' 
                  : modelType === 'online' 
                    ? (serverOnline ? 'bg-green-400' : 'bg-red-400') 
                    : (cpuReady ? 'bg-green-400' : 'bg-yellow-400')
                }`} />
                <Text className="text-[10px] font-medium tracking-[2px] text-[#E9EBED] uppercase">
                  {loading 
                    ? "PROCESSING..." 
                    : modelType === 'online'
                      ? (serverOnline ? "SERVER ONLINE" : "SERVER OFFLINE")
                      : (cpuReady ? "MODEL READY" : "LOADING MODEL...")}
                </Text>
              </View>

              {imageUri && !loading && (
                <TouchableOpacity onPress={() => { setImageUri(null); setResult(null); }} className="p-2">
                  <X size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              )}
            </View>

            {/* VIEWPORT BLOCK */}
            <View className="w-full aspect-square rounded-3xl overflow-hidden bg-[#5F8BE1]/10 border border-[#5F8BE1]/20 mb-6 relative">
              {imageUri ? (
                <Image source={{ uri: imageUri }} className="w-full h-full opacity-80" resizeMode="cover" />
              ) : (
                <TouchableOpacity
                  onPress={() => pickImage(true)}
                  className="w-full h-full flex-col items-center justify-center"
                >
                  <View className="mb-4">
                     <Camera size={48} color="rgba(95,139,225,0.4)" strokeWidth={1} />
                  </View>
                  <Text className="text-xs tracking-[4px] uppercase font-light text-[#E9EBED]/40">
                    Chạm để chụp
                  </Text>
                </TouchableOpacity>
              )}

              {loading && (
                <View className="absolute inset-0 bg-[#3B5199]/80 items-center justify-center">
                  <ActivityIndicator size="large" color="#86BAF3" />
                  <Text className="text-[#86BAF3] mt-4 text-[10px] uppercase font-bold tracking-[2px]">Running {modelType.toUpperCase()}</Text>
                </View>
              )}
            </View>

            {/* RESULTS & ACTIONS BLOCK */}
            <View className="flex-1 justify-end">
              {result && !loading ? (
                <View className="bg-[#5F8BE1]/15 p-6 rounded-3xl items-center justify-center border border-[#5F8BE1]/30">
                  <Text className="text-[10px] font-semibold tracking-[4px] text-[#E9EBED] uppercase mb-2">Total Count</Text>
                  <Text className="text-7xl font-black text-white mb-2">{result.total}</Text>
                  <View className="flex-row items-center gap-2">
                    <CheckCircle size={14} color="#86BAF3" />
                    <Text className="text-[#86BAF3] text-[10px] uppercase font-bold tracking-widest">{result.message}</Text>
                  </View>
                </View>
              ) : (
                <View className="flex-row gap-4">
                  <TouchableOpacity
                    onPress={() => pickImage(true)}
                    disabled={loading}
                    className={`flex-1 bg-[#5F8BE1] py-5 rounded-2xl flex-row items-center justify-center gap-3 ${loading ? 'opacity-50' : ''}`}
                  >
                    <Camera size={18} color="#E9EBED" />
                    <Text className="text-[#E9EBED] font-bold tracking-[2px] uppercase text-xs">Chụp Hình</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => pickImage(false)}
                    disabled={loading}
                    className={`w-16 bg-[#5F8BE1]/20 rounded-2xl items-center justify-center border border-[#5F8BE1]/30 ${loading ? 'opacity-50' : ''}`}
                  >
                    <Upload size={18} color="#86BAF3" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>

        {/* History Overlay */}
        <Animated.View 
          style={{ 
            position: 'absolute', 
            top: 48, left: 24, right: 24, bottom: 24, 
            opacity: historyFadeAnim, 
            transform: [{ translateY: historySlideAnim }],
            zIndex: showHistory ? 20 : -1
          }} 
          pointerEvents={showHistory ? 'auto' : 'none'}
        >
          <HistoryPanel 
            history={history} 
            onClose={() => setShowHistory(false)}
            onRestore={(item) => {
               setImageUri(item.imageUrl);
               setResult({ total: item.fishCount, message: "Xem lại từ lịch sử" });
               setShowHistory(false);
            }}
            onRemove={removeHistoryItem}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
