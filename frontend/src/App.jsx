import React, { useState, useRef } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle } from 'lucide-react';

const ShrimpCounterPWA = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    setLoading(true);
    setResult(null);

    console.log("Đang giả lập gửi ảnh:", file.name);

    setTimeout(() => {
      const mockCount = Math.floor(Math.random() * 401) + 100;
      
      setResult({ 
        total: mockCount,
        message: "Phát hiện cá giống thành công (Mock Mode)" 
      });
      setLoading(false);
    }, 2000);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      handleUpload(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
        <h1 className="text-xl font-bold uppercase tracking-tight">Fish AI Count</h1>
        <div className="text-xs bg-blue-500 px-2 py-1 rounded-full">v1.0.0-Beta</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col items-center justify-center">
        
        {/* Khung hiển thị ảnh */}
        <div className="w-full max-w-md aspect-square bg-white border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden flex items-center justify-center relative shadow-inner">
          {image ? (
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-400 text-center">
              <Camera size={48} className="mx-auto mb-2 opacity-20" />
              <p>Chưa có ảnh nào được chọn</p>
            </div>
          )}
          
          {/* Hiệu ứng Scanning khi đang xử lý */}
          {loading && (
            <div className="absolute inset-0 bg-blue-500/20">
              <div className="w-full h-1 bg-blue-500 shadow-[0_0_15px_blue] animate-scan"></div>
            </div>
          )}
        </div>

        {/* Hiển thị Kết quả */}
        <div className="mt-8 w-full max-w-md text-center">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-blue-600 font-medium animate-pulse">
              <RefreshCw className="animate-spin" /> Đang đếm cá...
            </div>
          ) : result ? (
            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-green-500">
              <p className="text-slate-500 uppercase text-xs font-bold tracking-widest">Tổng số lượng</p>
              <h2 className="text-6xl font-black text-slate-800 my-2">{result.total}</h2>
              <div className="flex items-center justify-center gap-1 text-green-600 font-medium">
                <CheckCircle size={18} /> Đã hoàn tất
              </div>
            </div>
          ) : (
            <p className="text-slate-400 italic">Vui lòng chụp ảnh khay cá từ trên xuống</p>
          )}
        </div>
      </main>

      {/* Bottom Bar - Nút bấm chính */}
      <footer className="p-6 bg-white border-t border-slate-200 flex gap-4 justify-center">
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          hidden 
          ref={fileInputRef} 
          onChange={onFileChange}
        />
        
        <button 
          onClick={() => fileInputRef.current.click()}
          className="flex-1 max-w-[200px] bg-slate-800 hover:bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
        >
          <Camera size={20} /> CHỤP ẢNH
        </button>

        <button 
          onClick={() => fileInputRef.current.click()}
          className="bg-white border-2 border-slate-800 text-slate-800 p-4 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-md"
        >
          <Upload size={20} />
        </button>
      </footer>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scan {
          position: absolute;
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ShrimpCounterPWA;