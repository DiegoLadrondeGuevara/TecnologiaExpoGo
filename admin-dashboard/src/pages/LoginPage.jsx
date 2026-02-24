import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { login } from '../services/authService';

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { user } = await login(email, password);
            if (user.role !== 'ADMIN') {
                setError('Access denied. Admin credentials required.');
                setLoading(false);
                return;
            }
            navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            {/* Background glow effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[128px]" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo/Title */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl shadow-blue-600/20 mb-6">
                        <LogIn size={28} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">TechStore</h1>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Admin Dashboard</p>
                </div>

                {/* Login Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-[#1c1c1e] rounded-3xl border border-white/5 p-8 shadow-2xl space-y-6"
                >
                    {error && (
                        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3 text-rose-400 text-sm font-medium animate-in fade-in duration-200">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@techstore.com"
                            required
                            className="w-full bg-[#2c2c2e] border border-white/5 rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-[#2c2c2e] border border-white/5 rounded-2xl py-3.5 px-4 pr-12 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] text-sm uppercase tracking-widest"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <LogIn size={18} />
                        )}
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <p className="text-center text-gray-600 text-xs font-medium">
                        Default: admin@techstore.com / admin123
                    </p>
                </form>
            </div>
        </div>
    );
}
