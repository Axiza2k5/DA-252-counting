import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, ScanLine, X } from 'lucide-react';

const FishCounterPWA = () => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleUpload = async (file) => {
        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${apiUrl}/predict`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            setResult({
                total: data.count,
                message: "Phân tích thành công"
            });
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
                <div className="flex items-center gap-3 mb-12 opacity-80">
                    <ScanLine size={26} className="text-ocean-400 stroke-[1.5]" />
                    <span className="font-bold tracking-[0.25em] text-sm uppercase text-white">Aqua<span className="text-ocean-400">Vision</span></span>
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

                <div className="hidden md:flex items-center gap-12 mt-12 text-xs uppercase tracking-[0.2em] opacity-50">
                    <span>Model: YOLOv11</span>
                    <span>Lat: 45ms</span>
                </div>
            </div>

            {/* RIGHT / BOTTOM PANEL: Action Area */}
            <div className="w-full md:w-1/2 p-6 md:p-12 lg:p-24 flex items-center justify-center relative z-20 bg-ocean-900/40 backdrop-blur-xl">
                <div className="w-full max-w-lg">

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