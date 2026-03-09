import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, CheckCircle, Clock, XCircle, Package, Filter, Search } from 'lucide-react';
import { fetchPayments } from '../services/api';
import { formatPrice } from '../../../shared-logic/currency';

export default function PaymentsPage() {
    const { t, i18n } = useTranslation();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const currency = i18n.language === 'es' ? 'PEN' : 'USD';
    const isEs = i18n.language === 'es';

    useEffect(() => {
        fetchPayments().then(data => {
            setPayments(data);
            setLoading(false);
        });
    }, []);

    const statusConfig = {
        approved: { label: t('admin.paid'), icon: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
        pending: { label: t('admin.pendingStatus'), icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
        rejected: { label: t('admin.failed'), icon: XCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
    };

    const filtered = payments
        .filter(p => filter === 'all' ? true : p.status === filter)
        .filter(p => {
            if (!searchTerm) return true;
            const s = searchTerm.toLowerCase();
            return (
                String(p.orderId).toLowerCase().includes(s) ||
                p.userName.toLowerCase().includes(s) ||
                p.items.some(item => item.toLowerCase().includes(s))
            );
        });
    const totalApproved = payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="modern-spinner" />
                <p className="font-medium animate-pulse" style={{ color: 'var(--color-text-muted)' }}>{t('admin.loading')}...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{t('admin.payments')}</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{isEs ? 'Historial completo de transacciones y estados.' : 'Complete transaction history and statuses.'}</p>
                </div>

                {/* Total Collected Card */}
                <div className="glass-card p-4 flex items-center gap-4" style={{ minWidth: '220px' }}>
                    <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
                        <CreditCard size={22} color="#fff" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>{isEs ? 'Total Cobrado' : 'Total Collected'}</p>
                        <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{formatPrice(totalApproved, currency)}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex p-1 rounded-xl" style={{ background: 'rgba(20,20,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    {['all', 'approved', 'pending', 'rejected'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className="px-5 py-2 rounded-lg text-xs font-bold"
                            style={{
                                background: filter === f ? 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-tertiary))' : 'transparent',
                                color: filter === f ? '#fff' : 'var(--color-text-muted)',
                                boxShadow: filter === f ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {f === 'all' ? (isEs ? 'Todos' : 'All') : statusConfig[f]?.label}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('admin.search_order', { defaultValue: 'Buscar pedido...' })}
                        className="glass-input rounded-xl py-2 pl-10 pr-4 text-sm text-white w-64"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                                {[t('admin.orderId'), t('admin.userName'), t('admin.amount'), t('admin.status'), 'Items', t('admin.date')].map((h, i) => (
                                    <th key={i} className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => {
                                const sc = statusConfig[p.status];
                                return (
                                    <tr key={p.id} className="table-row-hover" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.color, boxShadow: `0 0 6px ${sc.color}40` }} />
                                                <span className="font-mono text-sm font-bold" style={{ color: '#818cf8' }}>#{p.orderId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #374151, #1f2937)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    {p.userName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{p.userName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{formatPrice(p.amount, currency)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider" style={{ background: sc.bg, color: sc.color }}>
                                                <sc.icon size={12} />
                                                {sc.label}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                <Package size={14} style={{ color: '#818cf8', opacity: 0.7 }} />
                                                <span className="text-[11px] font-medium truncate max-w-[150px]" style={{ color: 'var(--color-text-muted)' }}>{p.items.join(', ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{new Date(p.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                                                <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>{new Date(p.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <Filter size={32} style={{ color: 'var(--color-text-muted)' }} />
                        </div>
                        <h3 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{t('admin.no_results', { defaultValue: 'No se encontraron transacciones' })}</h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{t('admin.try_another_filter', { defaultValue: 'Prueba cambiando el filtro o término de búsqueda.' })}</p>
                    </div>
                )}
            </div>
        </div>
    );
}