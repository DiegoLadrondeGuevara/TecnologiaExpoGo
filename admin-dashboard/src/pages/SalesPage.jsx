import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ShoppingCart,
    CheckCircle,
    Clock,
    Package,
    Filter,
    Search,
    TrendingUp,
    DollarSign,
    Users,
} from 'lucide-react';
import { fetchOrders } from '../services/api';
import { formatPrice } from '../../../shared-logic/currency';

export default function SalesPage() {
    const { t, i18n } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const currency = i18n.language === 'es' ? 'PEN' : 'USD';

    useEffect(() => {
        fetchOrders().then((data) => {
            setOrders(data);
            setLoading(false);
        });
    }, []);

    const statusConfig = {
        paid: {
            label: i18n.language === 'es' ? 'Pagado' : 'Paid',
            icon: CheckCircle,
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.08)',
        },
        pending: {
            label: i18n.language === 'es' ? 'Pendiente' : 'Pending',
            icon: Clock,
            color: '#f59e0b',
            bg: 'rgba(245, 158, 11, 0.08)',
        },
    };

    const filtered = orders
        .filter((o) => (filter === 'all' ? true : o.status === filter))
        .filter((o) => {
            if (!searchTerm) return true;
            const s = searchTerm.toLowerCase();
            return o.id.toLowerCase().includes(s) || o.userName.toLowerCase().includes(s);
        });

    const totalRevenue = orders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.status === 'paid').length;
    const uniqueCustomers = new Set(orders.map((o) => o.userName)).size;

    const kpis = [
        { icon: DollarSign, label: i18n.language === 'es' ? 'Ingresos Totales' : 'Total Revenue', value: formatPrice(totalRevenue, currency), gradient: 'linear-gradient(135deg, #10b981, #059669)', glow: 'rgba(16, 185, 129, 0.15)' },
        { icon: ShoppingCart, label: i18n.language === 'es' ? 'Total Pedidos' : 'Total Orders', value: totalOrders, gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', glow: 'rgba(99, 102, 241, 0.15)' },
        { icon: TrendingUp, label: i18n.language === 'es' ? 'Pagados' : 'Paid', value: paidOrders, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', glow: 'rgba(139, 92, 246, 0.15)' },
        { icon: Users, label: i18n.language === 'es' ? 'Clientes' : 'Customers', value: uniqueCustomers, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245, 158, 11, 0.15)' },
    ];

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
            <div className="animate-fade-in-up">
                <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                    {i18n.language === 'es' ? 'Ventas' : 'Sales'}
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {i18n.language === 'es' ? 'Historial completo de pedidos y ventas.' : 'Complete order and sales history.'}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {kpis.map(({ icon: Icon, label, value, gradient, glow }, idx) => (
                    <div
                        key={idx}
                        className={`glass-card glass-card-hover hover-lift p-5 flex items-center gap-4 relative overflow-hidden animate-fade-in-up stagger-${idx + 1}`}
                    >
                        <div className="p-3 rounded-xl" style={{ background: gradient, boxShadow: `0 4px 16px ${glow}` }}>
                            <Icon size={22} color="#fff" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                            <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                        </div>
                        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: gradient, opacity: 0.5 }} />
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-up stagger-5">
                <div className="flex p-1 rounded-xl" style={{ background: 'rgba(20,20,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    {['all', 'paid', 'pending'].map((f) => (
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
                            {f === 'all' ? (i18n.language === 'es' ? 'Todos' : 'All') : statusConfig[f]?.label}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s ease' }} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={i18n.language === 'es' ? 'Buscar pedido o cliente...' : 'Search order or customer...'}
                        className="glass-input rounded-xl py-2 pl-10 pr-4 text-sm text-white w-64"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="glass-card overflow-hidden animate-fade-in-up stagger-6">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                                {[
                                    i18n.language === 'es' ? 'Pedido' : 'Order',
                                    i18n.language === 'es' ? 'Cliente' : 'Customer',
                                    'Items',
                                    'Subtotal',
                                    i18n.language === 'es' ? 'Impuesto' : 'Tax',
                                    'Total',
                                    i18n.language === 'es' ? 'Estado' : 'Status',
                                    i18n.language === 'es' ? 'Fecha' : 'Date',
                                ].map((h, i) => (
                                    <th key={i} className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((order) => {
                                const sc = statusConfig[order.status] || statusConfig.pending;
                                const isPaid = order.status === 'paid';
                                return (
                                    <tr
                                        key={order.id}
                                        className="table-row-hover"
                                        style={{
                                            borderTop: '1px solid rgba(255,255,255,0.03)',
                                            background: isPaid ? 'rgba(16, 185, 129, 0.02)' : 'transparent',
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.color, boxShadow: !isPaid ? `0 0 6px ${sc.color}60` : 'none' }} />
                                                <span className="font-mono text-sm font-bold" style={{ color: '#818cf8' }}>#{order.id.slice(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #374151, #1f2937)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    {order.userName.split(' ').map((n) => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-semibold block" style={{ color: 'var(--color-text-primary)' }}>{order.userName}</span>
                                                    {order.userEmail && <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{order.userEmail}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                <Package size={14} style={{ color: '#818cf8', opacity: 0.7 }} />
                                                <span className="text-[11px] font-medium truncate max-w-[150px]" style={{ color: 'var(--color-text-muted)' }}>
                                                    {order.items.map((i) => i.productName).join(', ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{formatPrice(order.subtotal, currency)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{formatPrice(order.tax, currency)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold" style={{ color: isPaid ? '#10b981' : 'var(--color-text-primary)' }}>{formatPrice(order.total, currency)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider" style={{ background: sc.bg, color: sc.color }}>
                                                <sc.icon size={12} />
                                                {sc.label}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{new Date(order.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                                                <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>{new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
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
                        <h3 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {i18n.language === 'es' ? 'No se encontraron pedidos' : 'No orders found'}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            {i18n.language === 'es' ? 'Prueba cambiando el filtro o término de búsqueda.' : 'Try changing the filter or search term.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
