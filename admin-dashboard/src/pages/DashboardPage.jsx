import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Users, Package, ShoppingCart, ArrowUpRight, Calendar, ChevronRight } from 'lucide-react';
import { fetchDashboardStats } from '../services/api';
import { formatPrice } from '../../../shared-logic/currency';

export default function DashboardPage() {
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const currency = i18n.language === 'es' ? 'PEN' : 'USD';

    useEffect(() => {
        fetchDashboardStats().then(data => { setStats(data); setLoading(false); });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-blue-500 animate-spin" />
                <p className="text-gray-400 font-medium animate-pulse">{t('admin.loading')}...</p>
            </div>
        );
    }

    const statCards = [
        { title: t('admin.totalSales'), value: formatPrice(stats.totalSales, currency), icon: TrendingUp, change: '+12.5%', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        { title: t('admin.activeUsers'), value: stats.activeUsers, icon: Users, change: '+3.2%', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
        { title: t('admin.totalProducts'), value: stats.totalProducts, icon: Package, change: '+2', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        { title: t('admin.recentOrders'), value: stats.totalOrders, icon: ShoppingCart, change: '+18%', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    ];

    const statusStyles = {
        approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' },
        pending: { bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500' },
        rejected: { bg: 'bg-rose-500/10', text: 'text-rose-500', dot: 'bg-rose-500' },
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header con Bienvenida */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white">
                        {t('admin.dashboard')}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {t('admin.welcome_message', { defaultValue: 'Aquí tienes un resumen de tu tienda hoy.' })}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-[#2c2c2e] px-4 py-2 rounded-lg border border-white/5 shadow-sm">
                    <Calendar size={18} className="text-blue-400" />
                    <span className="text-sm font-medium text-gray-200">
                        {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <div
                        key={i}
                        className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/5"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl inline-block" style={{ backgroundColor: card.bg }}>
                                    <card.icon size={24} style={{ color: card.color }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{card.title}</p>
                                    <h3 className="text-3xl font-bold text-white mt-1">{card.value}</h3>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-white/5`} style={{ color: card.color }}>
                                {card.change} <ArrowUpRight size={14} />
                            </div>
                        </div>
                        {/* Decoración sutil de fondo */}
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <card.icon size={100} style={{ color: card.color }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Transactions Table */}
            <div className="rounded-2xl border border-white/5 overflow-hidden shadow-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <div className="px-6 py-5 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={20} className="text-blue-500" />
                        <h3 className="text-lg font-bold text-white">{t('admin.recentOrders')}</h3>
                    </div>
                    <button className="text-sm font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
                        {t('admin.viewAll', { defaultValue: 'Ver todos' })} <ChevronRight size={16} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                {[t('admin.orderId'), t('admin.userName'), t('admin.amount'), t('admin.status'), t('admin.date')].map((h, i) => (
                                    <th key={i} className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats.recentPayments.map((p) => (
                                <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm font-bold text-blue-400">#{p.orderId}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                                                {p.userName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm font-medium text-gray-200">{p.userName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-white">{formatPrice(p.amount, currency)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${statusStyles[p.status]?.bg} ${statusStyles[p.status]?.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyles[p.status]?.dot}`} />
                                            {t(`admin.${p.status === 'approved' ? 'paid' : p.status === 'pending' ? 'pendingStatus' : 'failed'}`)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400 font-medium">
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