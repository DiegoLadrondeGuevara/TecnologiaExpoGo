import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, CheckCircle, Clock, XCircle, Package } from 'lucide-react';
import { fetchPayments } from '../services/api';
import { formatPrice } from '../../../shared-logic/currency';

export default function PaymentsPage() {
    const { t, i18n } = useTranslation();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const currency = i18n.language === 'es' ? 'PEN' : 'USD';

    useEffect(() => {
        fetchPayments().then(data => { setPayments(data); setLoading(false); });
    }, []);

    const statusConfig = {
        approved: { label: t('admin.paid'), icon: CheckCircle, bg: 'rgba(52, 199, 89, 0.12)', color: 'var(--color-status-success)' },
        pending: { label: t('admin.pendingStatus'), icon: Clock, bg: 'rgba(255, 149, 0, 0.12)', color: 'var(--color-status-warning)' },
        rejected: { label: t('admin.failed'), icon: XCircle, bg: 'rgba(255, 59, 48, 0.12)', color: 'var(--color-status-danger)' },
    };

    const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
    const totalApproved = payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0);

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-accent-blue)', borderTopColor: 'transparent' }} /></div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{t('admin.payments')}</h2>
                <div className="flex items-center gap-2">
                    <CreditCard size={18} color="var(--color-status-success)" />
                    <span className="text-sm font-bold" style={{ color: 'var(--color-status-success)' }}>{formatPrice(totalApproved, currency)}</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-5">
                {['all', 'approved', 'pending', 'rejected'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                        style={{
                            backgroundColor: filter === f ? 'var(--color-accent-blue)' : 'var(--color-bg-card)',
                            color: filter === f ? '#fff' : 'var(--color-text-secondary)',
                        }}>
                        {f === 'all' ? (i18n.language === 'es' ? 'Todos' : 'All') : statusConfig[f]?.label}
                    </button>
                ))}
            </div>

            {/* Payments Table */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {[t('admin.orderId'), t('admin.userName'), t('admin.amount'), t('admin.status'), 'Items', t('admin.date')].map((h, i) => (
                                    <th key={i} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p, i) => {
                                const sc = statusConfig[p.status];
                                return (
                                    <tr key={p.id} className="transition-colors duration-200" style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-card-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--color-accent-blue)' }}>{p.orderId}</td>
                                        <td className="px-5 py-3.5" style={{ color: 'var(--color-text-primary)' }}>{p.userName}</td>
                                        <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatPrice(p.amount, currency)}</td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color }}>
                                                <sc.icon size={12} /> {sc.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                                <Package size={12} /> <span className="text-xs">{p.items.join(', ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{new Date(p.date).toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
