import React, { useState } from 'react';
import { User, Lock, ArrowRight, ScanLine, AlertCircle } from 'lucide-react';

const Auth = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        const apiUrl = import.meta.env.VITE_API_URL;

        try {
            if (isLogin) {
                // Login Flow
                const formData = new URLSearchParams();
                formData.append('username', username);
                formData.append('password', password);

                const response = await fetch(`${apiUrl}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || 'Đăng nhập thất bại');
                }

                localStorage.setItem('access_token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('refresh_token', data.refresh_token);
                }
                onLoginSuccess();
            } else {
                // Register Flow
                const response = await fetch(`${apiUrl}/register`, {
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

                // Auto switch to login after successful registration
                setIsLogin(true);
                setError('Đăng ký thành công! Vui lòng đăng nhập.');
                // We keep username and password filled so they can just click login
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ocean-pattern text-white flex flex-col md:flex-row overflow-hidden font-sans">
            {/* LEFT / TOP PANEL: Branding */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 relative z-10">
                <div className="flex items-center gap-3 mb-12 opacity-80 absolute top-8 md:top-16">
                    <ScanLine size={26} className="text-ocean-400 stroke-[1.5]" />
                    <span className="font-bold tracking-[0.25em] text-sm uppercase text-white">Aqua<span className="text-ocean-400">Vision</span></span>
                </div>

                <div className="flex-1 flex flex-col justify-center mt-16 md:mt-0">
                    <h1 className="text-5xl md:text-7xl font-black leading-[0.85] tracking-tighter mix-blend-overlay text-white opacity-90 mb-6">
                        {isLogin ? "WELCOME" : "JOIN"} <br />
                        {isLogin ? "BACK" : "US"} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-400 to-white">TODAY</span>
                    </h1>

                    <div className="max-w-md border-l-2 border-ocean-400 pl-6 mt-4">
                        <p className="text-xl font-light text-blue-100 mb-2">
                            {isLogin ? "Đăng nhập để tiếp tục" : "Đăng ký tài khoản mới"}
                        </p>
                        <p className="text-sm font-light text-blue-200 opacity-70">
                            {isLogin 
                                ? "Truy cập hệ thống đếm cá giống tự động với công nghệ AI." 
                                : "Bắt đầu trải nghiệm công nghệ AI nhận diện vật thể với độ chính xác cao."}
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT / BOTTOM PANEL: Form */}
            <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center relative z-20 bg-ocean-900/40 backdrop-blur-xl">
                <div className="w-full max-w-md glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ocean-400 to-transparent"></div>
                    
                    <h2 className="text-2xl font-bold tracking-widest uppercase mb-8 flex items-center gap-3">
                        {isLogin ? "Đăng nhập" : "Đăng ký"}
                    </h2>

                    {error && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${error.includes('thành công') ? 'bg-ocean-400/20 text-ocean-400 border border-ocean-400/30' : 'bg-red-500/20 text-red-200 border border-red-500/30'}`}>
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold tracking-widest text-blue-200/70 uppercase ml-1">Tên đăng nhập</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-ocean-400/50 focus:border-transparent transition-all"
                                    placeholder="Nhập tên đăng nhập..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold tracking-widest text-blue-200/70 uppercase ml-1">Mật khẩu</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-ocean-400/50 focus:border-transparent transition-all"
                                    placeholder="Nhập mật khẩu..."
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 bg-ocean-400 hover:bg-ocean-300 text-ocean-900 py-3.5 rounded-xl font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)]"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-ocean-900/30 border-t-ocean-900 rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    {isLogin ? "Đăng nhập" : "Đăng ký ngay"}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-xs font-medium tracking-widest text-blue-200/60 hover:text-white transition-colors uppercase"
                        >
                            {isLogin ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
