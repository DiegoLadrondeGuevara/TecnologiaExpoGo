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
            bg: 'bg-emerald-500/10',
            color: 'text-emerald-500',
            dot: 'bg-emerald-500',
            border: 'border-emerald-500/20',
            glow: 'shadow-emerald-500/5',
        },
        pending: {
            label: i18n.language === 'es' ? 'Pendiente' : 'Pending',
            icon: Clock,
            bg: 'bg-amber-500/10',
            color: 'text-amber-500',
            dot: 'bg-amber-500',
            border: 'border-amber-500/20',
            glow: 'shadow-amber-500/5',
        },
    };

    // Filter & search
    const filtered = orders
        .filter((o) => (filter === 'all' ? true : o.status === filter))
        .filter((o) => {
            if (!searchTerm) return true;
            const s = searchTerm.toLowerCase();
            return (
                o.id.toLowerCase().includes(s) ||
                o.userName.toLowerCase().includes(s)
            );
        });

    // KPIs
    const totalRevenue = orders
        .filter((o) => o.status === 'paid')
        .reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.status === 'paid').length;
    const uniqueCustomers = new Set(orders.map((o) => o.userName)).size;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-blue-500 animate-spin" />
                <p className="text-gray-400 font-medium animate-pulse">
                    {t('admin.loading')}...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white">
                        {i18n.language === 'es' ? 'Ventas' : 'Sales'}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {i18n.language === 'es'
                            ? 'Historial completo de pedidos y ventas.'
                            : 'Complete order and sales history.'}
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        icon: DollarSign,
                        label: i18n.language === 'es' ? 'Ingresos Totales' : 'Total Revenue',
                        value: formatPrice(totalRevenue, currency),
                        color: 'emerald',
                    },
                    {
                        icon: ShoppingCart,
                        label: i18n.language === 'es' ? 'Total Pedidos' : 'Total Orders',
                        value: totalOrders,
                        color: 'blue',
                    },
                    {
                        icon: TrendingUp,
                        label: i18n.language === 'es' ? 'Pagados' : 'Paid',
                        value: paidOrders,
                        color: 'violet',
                    },
                    {
                        icon: Users,
                        label: i18n.language === 'es' ? 'Clientes' : 'Customers',
                        value: uniqueCustomers,
                        color: 'amber',
                    },
                ].map(({ icon: Icon, label, value, color }, idx) => (
                    <div
                        key={idx}
                        className={`bg-[#2c2c2e] p-5 rounded-2xl border border-white/5 flex items-center gap-4 shadow-xl hover:shadow-${color}-500/5 transition-shadow`}
                    >
                        <div className={`p-3 bg-${color}-500/10 rounded-xl`}>
                            <Icon size={22} className={`text-${color}-500`} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {label}
                            </p>
                            <p className="text-xl font-black text-white">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex p-1 bg-[#2c2c2e] rounded-xl border border-white/5">
                    {['all', 'paid', 'pending'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${filter === f
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {f === 'all'
                                ? i18n.language === 'es'
                                    ? 'Todos'
                                    : 'All'
                                : statusConfig[f]?.label}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"
                        size={16}
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={
                            i18n.language === 'es'
                                ? 'Buscar pedido o cliente...'
                                : 'Search order or customer...'
                        }
                        className="bg-[#2c2c2e] border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all w-64"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl border border-white/5 overflow-hidden shadow-2xl bg-[#1c1c1e]">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02]">
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
                                    <th
                                        key={i}
                                        className="text-left px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-gray-500 border-b border-white/5"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((order) => {
                                const sc =
                                    statusConfig[order.status] || statusConfig.pending;
                                const isPaid = order.status === 'paid';
                                return (
                                    <tr
                                        key={order.id}
                                        className={`group transition-all duration-200 ${isPaid
                                                ? 'hover:bg-emerald-500/[0.04] bg-emerald-500/[0.02]'
                                                : 'hover:bg-white/[0.02]'
                                            }`}
                                    >
                                        {/* Order ID */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-1.5 h-1.5 rounded-full ${isPaid
                                                            ? 'bg-emerald-500'
                                                            : 'bg-amber-500 animate-pulse'
                                                        }`}
                                                />
                                                <span className="font-mono text-sm font-bold text-blue-400">
                                                    #{order.id.slice(0, 8)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center text-[11px] font-black text-white shadow-inner">
                                                    {order.userName
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .join('')}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-semibold text-gray-200 block">
                                                        {order.userName}
                                                    </span>
                                                    {order.userEmail && (
                                                        <span className="text-[10px] text-gray-500">
                                                            {order.userEmail}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Items */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                                                <Package
                                                    size={14}
                                                    className="text-blue-500/70"
                                                />
                                                <span className="text-[11px] font-medium truncate max-w-[150px]">
                                                    {order.items
                                                        .map((i) => i.productName)
                                                        .join(', ')}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Subtotal */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-400">
                                                {formatPrice(order.subtotal, currency)}
                                            </span>
                                        </td>

                                        {/* Tax */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-500">
                                                {formatPrice(order.tax, currency)}
                                            </span>
                                        </td>

                                        {/* Total */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`text-sm font-black ${isPaid
                                                        ? 'text-emerald-400'
                                                        : 'text-white'
                                                    }`}
                                            >
                                                {formatPrice(order.total, currency)}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <div
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ${sc.bg} ${sc.color}`}
                                            >
                                                <sc.icon size={12} />
                                                {sc.label}
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-300">
                                                    {new Date(
                                                        order.createdAt,
                                                    ).toLocaleDateString(undefined, {
                                                        day: '2-digit',
                                                        month: 'short',
                                                    })}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-medium">
                                                    {new Date(
                                                        order.createdAt,
                                                    ).toLocaleTimeString(undefined, {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filtered.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Filter size={32} className="text-gray-600" />
                        </div>
                        <h3 className="text-white font-bold">
                            {i18n.language === 'es'
                                ? 'No se encontraron pedidos'
                                : 'No orders found'}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                            {i18n.language === 'es'
                                ? 'Prueba cambiando el filtro o término de búsqueda.'
                                : 'Try changing the filter or search term.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
