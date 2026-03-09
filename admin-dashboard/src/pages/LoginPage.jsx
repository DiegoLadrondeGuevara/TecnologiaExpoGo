import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { login, loginWithGoogle } from '../services/authService';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
    const { t, i18n } = useTranslation();
    const isEs = i18n.language === 'es';
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize Google Sign-In
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;

        const loadGoogleScript = () => {
            if (document.getElementById('google-gsi-script')) return;
            const script = document.createElement('script');
            script.id = 'google-gsi-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleButton;
            document.body.appendChild(script);
        };

        const initializeGoogleButton = () => {
            if (!window.google) return;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCallback,
            });
            window.google.accounts.id.renderButton(
                document.getElementById('google-signin-btn'),
                {
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: 'continue_with',
                    shape: 'pill',
                },
            );
        };

        loadGoogleScript();
    }, [mounted]);

    const handleGoogleCallback = useCallback(async (response) => {
        if (!response.credential) return;
        setGoogleLoading(true);
        setError('');
        try {
            const { user } = await loginWithGoogle(response.credential);
            if (user.role !== 'ADMIN') {
                setError(isEs ? 'Acceso denegado. Se requieren credenciales de admin.' : 'Access denied. Admin credentials required.');
                setGoogleLoading(false);
                return;
            }
            navigate('/');
        } catch (err) {
            setError(err.message || (isEs ? 'Fallo el inicio de sesión con Google' : 'Google login failed'));
        } finally {
            setGoogleLoading(false);
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { user } = await login(identifier, password);
            if (user.role !== 'ADMIN') {
                setError(isEs ? 'Acceso denegado. Se requieren credenciales de admin.' : 'Access denied. Admin credentials required.');
                setLoading(false);
                return;
            }
            navigate('/');
        } catch (err) {
            setError(err.message || (isEs ? 'Credenciales inválidas' : 'Invalid credentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#06060a' }}>
            {/* Subtle grid background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <div
                className="relative w-full max-w-md"
                style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                {/* Logo */}
                <div className="text-center mb-10">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
                            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                        }}
                    >
                        <LogIn size={28} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">TechStore</h1>
                    <p className="text-sm mt-2 font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                        Admin Dashboard
                    </p>
                </div>

                {/* Login Card */}
                <form
                    onSubmit={handleSubmit}
                    className="glass-card p-8 space-y-6"
                    style={{
                        boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
                    }}
                >
                    {error && (
                        <div
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium animate-slide-down"
                            style={{
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                color: '#f87171',
                            }}
                        >
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {/* Google Sign-In */}
                    {GOOGLE_CLIENT_ID && (
                        <>
                            <div
                                id="google-signin-btn"
                                className="flex justify-center"
                                style={{ minHeight: 44 }}
                            />
                            {googleLoading && (
                                <div className="flex justify-center py-2">
                                    <Loader2 size={20} className="animate-spin text-white" />
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
                                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                                    or
                                </span>
                                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-muted)' }}>
                            {isEs ? 'Email o Usuario' : 'Email or Username'}
                        </label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder={isEs ? 'Email o usuario' : 'Email or username'}
                            required
                            className="glass-input w-full rounded-xl py-3.5 px-4 text-white font-medium text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-muted)' }}>
                            {isEs ? 'Contraseña' : 'Password'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="glass-input w-full rounded-xl py-3.5 px-4 pr-12 text-white font-medium text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                                style={{ color: 'var(--color-text-muted)' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="btn-gradient w-full flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <LogIn size={18} />
                        )}
                        {loading ? (isEs ? 'Autenticando...' : 'Authenticating...') : (isEs ? 'Iniciar Sesión' : 'Sign In')}
                    </button>

                    <p className="text-center text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        Default: admin@techstore.com / admin123
                    </p>
                </form>
            </div>
        </div>
    );
}
