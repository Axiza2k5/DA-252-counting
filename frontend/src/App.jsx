import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle, ScanLine, X, History, Clock, Trash2 } from 'lucide-react';

const FishCounterPWA = () => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('scanHistory');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.map(item => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }));
            }
        } catch (e) {
            console.error('Failed to load history', e);
        }
        return [];
    });
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('scanHistory', JSON.stringify(history));
        } catch (e) {
            console.warn('Local storage quota exceeded, trimming history...');
            if (history.length > 5) { 
                setHistory(prev => prev.slice(0, prev.length - 2));
            }
        }
    }, [history]);

    const [modelType, setModelType] = useState('online');
    const [latency, setLatency] = useState(null);
    const fileInputRef = useRef(null);

    const handleUpload = async (file) => {
        setLoading(true);
        setResult(null);
        setLatency(null);

        const startTime = performance.now();

        try {
            let fishCount = 0;
            let responseData = null;

            if (modelType === 'online') {
                const formData = new FormData();
                formData.append('file', file);
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await fetch(`${apiUrl}/predict`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                responseData = await response.json();
                fishCount = responseData.count;
            } else {
                const { runLocalInference } = await import('./yoloInference.js');
                responseData = await runLocalInference(file);
                fishCount = responseData.count;
            }

            const endTime = performance.now();
            setLatency(Math.round(endTime - startTime));

            setResult({
                total: fishCount,
                message: "Phân tích thành công"
            });
            
            const finalImageToSave = (responseData && responseData.result_image_base64) 
                ? `data:image/jpeg;base64,${responseData.result_image_base64}` 
                : URL.createObjectURL(file);
                
            setImage(finalImageToSave);

            const newHistoryItem = {
                id: Date.now().toString(),
                imageUrl: finalImageToSave,
                fishCount: fishCount,
                timestamp: new Date()
            };
            setHistory(prev => [newHistoryItem, ...prev].slice(0, 20));
        } catch (error) {
            console.error("Lỗi:", error);
            setResult({ total: "ERR", message: "Kết nối thất bại" });
        } finally {
            setLoading(false);
        }
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
            handleUpload(file);
        }
    };

    const resetScan = () => {
        setImage(null);
        setResult(null);
    }

    return (
        <div className="min-h-screen bg-ocean-pattern text-white flex flex-col md:flex-row overflow-hidden font-sans">

            {/* LEFT / TOP PANEL: Branding & Visual */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 relative z-10">
                <div className="flex items-center justify-between mb-12 opacity-80 w-full">
                    <div className="flex items-center gap-3">
                        <ScanLine size={26} className="text-ocean-400 stroke-[1.5]" />
                        <span className="font-bold tracking-[0.25em] text-sm uppercase text-white">Aqua<span className="text-ocean-400">Vision</span></span>
                    </div>
                    <button 
                        onClick={() => setShowHistory(!showHistory)} 
                        className={`p-2 rounded-full transition-colors z-30 ${showHistory ? 'bg-white/10' : 'hover:bg-white/5'}`}
                        title="Lịch sử"
                    >
                        <History size={22} className={showHistory ? "text-ocean-400" : "text-white"} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter mix-blend-overlay text-white opacity-90 mb-6">
                        COUNT<br />
                        WITH<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-400 to-white">PRECISION</span>
                    </h1>

                    <div className="max-w-md border-l-2 border-ocean-400 pl-6 mt-8">
                        <p className="text-xl md:text-2xl font-light text-blue-100 mb-2">
                            Giải pháp đếm cá giống tự động
                        </p>
                        <p className="text-sm font-light text-blue-200 opacity-70">
                            Công nghệ AI nhận diện vật thể với độ chính xác cao, giúp tiết kiệm thời gian và tối ưu hóa quy trình kiểm đếm cho doanh nghiệp thủy sản.
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-4">
                    <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] opacity-90">
                        <span className="opacity-50">Model:</span>
                        <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
                            <button 
                                onClick={() => setModelType('online')} 
                                className={`px-3 py-1.5 rounded-md transition-all ${modelType === 'online' ? 'bg-ocean-400 text-ocean-900 font-bold shadow-lg shadow-ocean-400/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                                Online
                            </button>
                            <button 
                                onClick={() => setModelType('local')} 
                                className={`px-3 py-1.5 rounded-md transition-all ${modelType === 'local' ? 'bg-ocean-400 text-ocean-900 font-bold shadow-lg shadow-ocean-400/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                                Local
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-12 text-xs uppercase tracking-[0.2em] opacity-50">
                        <span>Lat: {latency !== null ? `${latency}ms` : '--'}</span>
                    </div>
                </div>
            </div>

            {/* RIGHT / BOTTOM PANEL: Action Area */}
            <div className="w-full md:w-1/2 p-6 md:p-12 lg:p-24 flex items-center justify-center relative z-20 bg-ocean-900/40 backdrop-blur-xl">
                <div className="w-full max-w-lg">
                    {showHistory ? (
                        <div className="flex flex-col h-full max-h-[70vh] animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-sm font-semibold tracking-[0.2em] text-blue-200 uppercase flex items-center gap-3">
                                    <History size={18} className="text-ocean-400" /> Lịch sử quét
                                </h2>
                                <button onClick={() => setShowHistory(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                                {history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center glass-panel rounded-3xl h-64 border border-white/5 bg-white/5 shadow-inner">
                                        <Clock size={32} className="text-ocean-400/50 mb-4" />
                                        <p className="text-xs font-semibold tracking-[0.2em] text-blue-200/50 uppercase">Chưa có dữ liệu</p>
                                    </div>
                                ) : (
                                    history.map(item => (
                                        <div key={item.id} className="glass-panel p-5 rounded-2xl flex gap-5 items-center hover:bg-white/10 transition-all group cursor-pointer border border-white/5 hover:border-ocean-400/30 hover:shadow-[0_0_30px_rgba(45,212,191,0.15)] relative overflow-hidden" onClick={() => {
                                            setImage(item.imageUrl);
                                            setResult({ total: item.fishCount, message: "Kết quả từ lịch sử" });
                                            setShowHistory(false);
                                        }}>
                                            <button 
                                                className="absolute top-2 right-2 p-2 rounded-full bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setHistory(prev => prev.filter(h => h.id !== item.id));
                                                }}
                                                title="Xóa lịch sử này"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-ocean-400/0 group-hover:via-ocean-400/50 to-transparent transition-all"></div>
                                            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-black/40 ring-1 ring-white/10 group-hover:ring-ocean-400/50 transition-all relative">
                                                <img src={item.imageUrl} alt="Scan" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity mix-blend-luminosity group-hover:mix-blend-normal" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-4xl font-black text-white mb-1 leading-none group-hover:text-ocean-400 transition-colors text-glow flex items-baseline">
                                                    {item.fishCount} <span className="text-[10px] font-semibold tracking-widest text-blue-200/60 uppercase ml-2">con</span>
                                                </div>
                                                <div className="text-[10px] font-medium tracking-widest uppercase text-blue-100/40 flex items-center gap-1.5 mt-3">
                                                    <Clock size={12} className="text-ocean-400/70" /> {item.timestamp.toLocaleDateString()} &bull; {item.timestamp.toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Status Text */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[11px] font-medium tracking-[0.15em] text-blue-200 uppercase flex items-center gap-2 backdrop-blur-md shadow-lg">
                            <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-ocean-400 animate-pulse' : 'bg-ocean-400/70'}`}></span>
                            {loading ? "PROCESSING..." : "AWAITING UPLOAD"}
                        </div>
                        {image && !loading && (
                            <button onClick={resetScan} className="text-white/50 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        )}
                    </div>

                    {/* Camera / Image Container */}
                    <div className="relative aspect-[4/3] md:aspect-square w-full rounded-3xl overflow-hidden glass-panel group shadow-2xl transition-all duration-500 hover:shadow-ocean-400/20">
                        {image ? (
                            <img src={image} alt="Target" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-full flex flex-col items-center justify-center text-white/40 hover:text-white/80 transition-all cursor-pointer"
                            >
                                <Camera size={64} strokeWidth={1} className="mb-4" />
                                <span className="text-sm tracking-widest uppercase font-light">Chạm để chụp</span>
                            </button>
                        )}

                        {/* Scanning Laser Animation */}
                        {loading && (
                            <div className="absolute inset-0 z-10 bg-ocean-900/60 backdrop-blur-sm pointer-events-none">
                                <div className="animate-scan-laser w-full h-[10%] absolute left-0"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-ocean-400">
                                    <ScanLine size={48} className="animate-pulse" />
                                </div>
                            </div>
                        )}

                        {/* Final Overlay Info */}
                        {result && !loading && image && (
                            <div className="absolute inset-0 border-4 border-ocean-400 rounded-3xl pointer-events-none"></div>
                        )}
                    </div>

                    {/* Results & Actions Area */}
                    <div className="mt-8">
                        {result && !loading ? (
                            <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-ocean-400 to-transparent"></div>
                                <span className="text-sm font-semibold tracking-[0.2em] text-blue-200 uppercase mb-2">Total Count</span>
                                <h2 className="text-8xl font-black text-white text-glow mb-4 leading-none">{result.total}</h2>
                                <div className="flex items-center gap-2 text-ocean-400 text-sm font-medium tracking-wide">
                                    <CheckCircle size={16} /> {result.message}
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={loading}
                                    className="flex-1 bg-white hover:bg-blue-50 text-ocean-900 py-5 rounded-2xl font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                                >
                                    <Camera size={18} /> Chụp hình
                                </button>
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={loading}
                                    className="w-20 glass-panel hover:bg-white/10 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Upload size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                        </>
                    )}

                </div>
            </div>

            <input
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                ref={fileInputRef}
                onChange={onFileChange}
            />
        </div>
    );
};

export default FishCounterPWA;