import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Users, Package, ShoppingCart, ArrowUpRight, ChevronRight } from 'lucide-react';
import { fetchDashboardStats } from '../services/api';
import { formatPrice } from '../../../shared-logic/currency';

export default function DashboardPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const currency = i18n.language === 'es' ? 'PEN' : 'USD';

    useEffect(() => {
        fetchDashboardStats().then(data => { setStats(data); setLoading(false); });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="modern-spinner" />
                <p className="font-medium animate-pulse" style={{ color: 'var(--color-text-muted)' }}>{t('admin.loading')}...</p>
            </div>
        );
    }

    const statCards = [
        { title: t('admin.totalSales'), value: formatPrice(stats.totalSales, currency), icon: TrendingUp, change: '+12.5%', gradient: 'linear-gradient(135deg, #10b981, #059669)', glow: 'rgba(16, 185, 129, 0.15)' },
        { title: t('admin.activeUsers'), value: stats.activeUsers, icon: Users, change: '+3.2%', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', glow: 'rgba(99, 102, 241, 0.15)' },
        { title: t('admin.totalProducts'), value: stats.totalProducts, icon: Package, change: '+2', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245, 158, 11, 0.15)' },
        { title: t('admin.recentOrders'), value: stats.totalOrders, icon: ShoppingCart, change: '+18%', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', glow: 'rgba(139, 92, 246, 0.15)' },
    ];

    const statusStyles = {
        approved: { bg: 'rgba(16, 185, 129, 0.08)', text: '#10b981', dot: '#10b981' },
        pending: { bg: 'rgba(245, 158, 11, 0.08)', text: '#f59e0b', dot: '#f59e0b' },
        rejected: { bg: 'rgba(239, 68, 68, 0.08)', text: '#ef4444', dot: '#ef4444' },
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                    {t('admin.dashboard')}
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {t('admin.welcome_message', { defaultValue: 'Aquí tienes un resumen de tu tienda hoy.' })}
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((card, i) => (
                    <div
                        key={i}
                        className="glass-card p-6 relative overflow-hidden"
                        style={{ cursor: 'default' }}
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className="space-y-4">
                                <div
                                    className="p-3 rounded-xl inline-block"
                                    style={{
                                        background: card.gradient,
                                        boxShadow: `0 4px 16px ${card.glow}`,
                                    }}
                                >
                                    <card.icon size={22} color="#fff" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                                        {card.title}
                                    </p>
                                    <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                                        {card.value}
                                    </h3>
                                </div>
                            </div>
                            <div
                                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                                style={{
                                    background: card.glow,
                                    color: card.gradient.includes('#10b981') ? '#10b981' :
                                        card.gradient.includes('#6366f1') ? '#818cf8' :
                                            card.gradient.includes('#f59e0b') ? '#f59e0b' : '#a78bfa',
                                }}
                            >
                                {card.change} <ArrowUpRight size={14} />
                            </div>
                        </div>
                        {/* Background decoration */}
                        <div
                            className="absolute -right-4 -bottom-4 opacity-[0.04]"
                            style={{ transition: 'opacity 0.5s ease' }}
                        >
                            <card.icon size={100} />
                        </div>
                        {/* Top gradient line */}
                        <div
                            className="absolute top-0 left-0 right-0 h-[2px]"
                            style={{ background: card.gradient, opacity: 0.6 }}
                        />
                    </div>
                ))}
            </div>

            {/* Recent Transactions Table */}
            <div className="glass-card overflow-hidden">
                {/* Table header */}
                <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                            <ShoppingCart size={18} style={{ color: '#818cf8' }} />
                        </div>
                        <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{t('admin.recentOrders')}</h3>
                    </div>
                    <button
                        onClick={() => navigate('/sales')}
                        className="text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        style={{ color: '#818cf8' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#a5b4fc'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#818cf8'}
                    >
                        {t('admin.viewAll', { defaultValue: 'Ver todos' })} <ChevronRight size={14} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                                {[t('admin.orderId'), t('admin.userName'), t('admin.amount'), t('admin.status'), t('admin.date')].map((h, i) => (
                                    <th key={i} className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentPayments.map((p) => (
                                <tr key={p.id} className="table-row-hover" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm font-bold" style={{ color: '#818cf8' }}>#{p.orderId}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                                                style={{
                                                    background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
                                                }}
                                            >
                                                {p.userName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{p.userName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{formatPrice(p.amount, currency)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div
                                            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold"
                                            style={{
                                                background: statusStyles[p.status]?.bg,
                                                color: statusStyles[p.status]?.text,
                                            }}
                                        >
                                            <span
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: statusStyles[p.status]?.dot }}
                                            />
                                            {t(`admin.${p.status === 'approved' ? 'paid' : p.status === 'pending' ? 'pendingStatus' : 'failed'}`)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                                        {new Date(p.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}