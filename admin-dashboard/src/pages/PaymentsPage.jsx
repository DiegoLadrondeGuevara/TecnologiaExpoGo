import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, CheckCircle, Clock, XCircle, Package, Filter, ChevronRight, Search } from 'lucide-react';
import { fetchPayments } from '../services/api';
import { formatPrice } from '../../../shared-logic/currency';

export default function PaymentsPage() {
    const { t, i18n } = useTranslation();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const currency = i18n.language === 'es' ? 'PEN' : 'USD';

    useEffect(() => {
        fetchPayments().then(data => {
            setPayments(data);
            setLoading(false);
        });
    }, []);

    const statusConfig = {
        approved: { label: t('admin.paid'), icon: CheckCircle, bg: 'bg-emerald-500/10', color: 'text-emerald-500', dot: 'bg-emerald-500' },
        pending: { label: t('admin.pendingStatus'), icon: Clock, bg: 'bg-amber-500/10', color: 'text-amber-500', dot: 'bg-amber-500' },
        rejected: { label: t('admin.failed'), icon: XCircle, bg: 'bg-rose-500/10', color: 'text-rose-500', dot: 'bg-rose-500' },
    };

    const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
    const totalApproved = payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-blue-500 animate-spin" />
                <p className="text-gray-400 font-medium animate-pulse">{t('admin.loading')}...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header con Stats Rápidas */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white">{t('admin.payments')}</h2>
                    <p className="text-gray-400 text-sm mt-1">{t('admin.manage_transactions', { defaultValue: 'Historial completo de transacciones y estados.' })}</p>
                </div>

                <div className="bg-[#2c2c2e] p-4 rounded-2xl border border-white/5 flex items-center gap-4 shadow-xl">
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                        <CreditCard size={24} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('admin.total_collected', { defaultValue: 'Total Cobrado' })}</p>
                        <p className="text-xl font-black text-white">{formatPrice(totalApproved, currency)}</p>
                    </div>
                </div>
            </div>

            {/* Barra de Filtros Estilo "Pill" */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex p-1 bg-[#2c2c2e] rounded-xl border border-white/5">
                    {['all', 'approved', 'pending', 'rejected'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${filter === f
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {f === 'all' ? (i18n.language === 'es' ? 'Todos' : 'All') : statusConfig[f]?.label}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder={t('admin.search_order', { defaultValue: 'Buscar pedido...' })}
                        className="bg-[#2c2c2e] border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all w-64"
                    />
                </div>
            </div>

            {/* Tabla de Pagos */}
            <div className="rounded-2xl border border-white/5 overflow-hidden shadow-2xl bg-[#1c1c1e]">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                {[t('admin.orderId'), t('admin.userName'), t('admin.amount'), t('admin.status'), 'Items', t('admin.date')].map((h, i) => (
                                    <th key={i} className="text-left px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-gray-500 border-b border-white/5">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((p) => {
                                const sc = statusConfig[p.status];
                                return (
                                    <tr key={p.id} className="group hover:bg-white/[0.02] transition-all duration-200">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                <span className="font-mono text-sm font-bold text-blue-400">#{p.orderId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center text-[11px] font-black text-white shadow-inner">
                                                    {p.userName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-200">{p.userName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-white">{formatPrice(p.amount, currency)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ${sc.bg} ${sc.color}`}>
                                                <sc.icon size={12} />
                                                {sc.label}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                                                <Package size={14} className="text-blue-500/70" />
                                                <span className="text-[11px] font-medium truncate max-w-[150px]">{p.items.join(', ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-300">
                                                    {new Date(p.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-medium">
                                                    {new Date(p.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer de la tabla / Empty State */}
                {filtered.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Filter size={32} className="text-gray-600" />
                        </div>
                        <h3 className="text-white font-bold">{t('admin.no_results', { defaultValue: 'No se encontraron transacciones' })}</h3>
                        <p className="text-gray-500 text-sm mt-1">{t('admin.try_another_filter', { defaultValue: 'Prueba cambiando el filtro o término de búsqueda.' })}</p>
                    </div>
                )}
            </div>
        </div>
    );
}