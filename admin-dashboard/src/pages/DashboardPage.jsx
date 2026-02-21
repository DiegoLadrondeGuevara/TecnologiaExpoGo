import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Users, Package, ShoppingCart, ArrowUpRight } from 'lucide-react';
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
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-accent-blue)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    const statCards = [
        { title: t('admin.totalSales'), value: formatPrice(stats.totalSales, currency), icon: TrendingUp, change: '+12.5%', color: 'var(--color-status-success)' },
        { title: t('admin.activeUsers'), value: stats.activeUsers, icon: Users, change: '+3', color: 'var(--color-accent-blue)' },
        { title: t('admin.totalProducts'), value: stats.totalProducts, icon: Package, change: '+2', color: 'var(--color-status-warning)' },
        { title: t('admin.recentOrders'), value: stats.totalOrders, icon: ShoppingCart, change: '+4', color: 'var(--color-status-info)' },
    ];

    const statusStyles = {
        approved: { bg: 'rgba(52, 199, 89, 0.12)', color: 'var(--color-status-success)' },
        pending: { bg: 'rgba(255, 149, 0, 0.12)', color: 'var(--color-status-warning)' },
        rejected: { bg: 'rgba(255, 59, 48, 0.12)', color: 'var(--color-status-danger)' },
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                {t('admin.dashboard')}
            </h2>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, i) => (
                    <div key={i} className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]"
                        style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                                <card.icon size={20} color={card.color} />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: card.color }}>
                                {card.change} <ArrowUpRight size={12} />
                            </span>
                        </div>
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>{card.title}</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Transactions */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('admin.recentOrders')}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {[t('admin.orderId'), t('admin.userName'), t('admin.amount'), t('admin.status'), t('admin.date')].map((h, i) => (
                                    <th key={i} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentPayments.map((p, i) => (
                                <tr key={p.id} className="transition-colors duration-200" style={{ borderBottom: i < stats.recentPayments.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-card-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--color-accent-blue)' }}>{p.orderId}</td>
                                    <td className="px-5 py-3.5" style={{ color: 'var(--color-text-primary)' }}>{p.userName}</td>
                                    <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatPrice(p.amount, currency)}</td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: statusStyles[p.status]?.bg, color: statusStyles[p.status]?.color }}>
                                            {t(`admin.${p.status === 'approved' ? 'paid' : p.status === 'pending' ? 'pendingStatus' : 'failed'}`)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{new Date(p.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
