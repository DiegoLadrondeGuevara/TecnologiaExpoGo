import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Mail, Calendar, ShoppingBag, DollarSign, Search,
    ArrowUpRight, X, Package, Clock,
    CheckCircle, Truck, PackageCheck, XCircle
} from 'lucide-react';
import { fetchUsers, fetchOrders } from '../services/api';
import { formatPrice } from '../../../shared-logic/currency';

export default function UsersPage() {
    const { t, i18n } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const currency = i18n.language === 'es' ? 'PEN' : 'USD';
    const isEs = i18n.language === 'es';

    // Detail modal state
    const [selectedUser, setSelectedUser] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
        fetchUsers().then(data => { setUsers(data); setLoading(false); });
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openUserDetail = async (user) => {
        setSelectedUser(user);
        setLoadingOrders(true);
        setUserOrders([]);
        try {
            const allOrders = await fetchOrders();
            setUserOrders(allOrders.filter(o => o.userId === user.id));
        } catch {
            setUserOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const closeModal = () => {
        setSelectedUser(null);
        setUserOrders([]);
    };

    const orderStatusConfig = {
        pending: { label: isEs ? 'Pendiente' : 'Pending', icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
        paid: { label: isEs ? 'Pagado' : 'Paid', icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
        shipped: { label: isEs ? 'Enviado' : 'Shipped', icon: Truck, color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
        delivered: { label: isEs ? 'Entregado' : 'Delivered', icon: PackageCheck, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
        cancelled: { label: isEs ? 'Cancelado' : 'Cancelled', icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="modern-spinner" />
                <p className="font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('admin.loading')}...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header + Search */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
                        {t('admin.users')}
                        <span
                            className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
                            style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.15)' }}
                        >
                            {users.length} Total
                        </span>
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {isEs ? 'Monitorea la actividad y el gasto de tus clientes.' : 'Monitor your customers\' activity and spending.'}
                    </p>
                </div>

                <div className="relative max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder={isEs ? 'Buscar por nombre o email...' : 'Search by name or email...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="glass-input w-full rounded-xl py-3.5 pl-12 pr-4 text-sm text-white"
                    />
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="glass-card p-6 relative overflow-hidden card-hover">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                                        style={{ background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))' }}
                                    >
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div
                                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full"
                                        style={{ backgroundColor: '#10b981', border: '3px solid var(--color-bg-card)' }}
                                        title={isEs ? 'Usuario Activo' : 'Active User'}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{user.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                        <Mail size={12} />
                                        <span className="text-xs font-medium truncate max-w-[140px]">{user.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: ShoppingBag, value: user.orders, label: isEs ? 'Pedidos' : 'Orders', color: '#818cf8' },
                                { icon: DollarSign, value: formatPrice(user.totalSpent, currency).split('.')[0], label: isEs ? 'Gastado' : 'Spent', color: '#10b981' },
                                { icon: Calendar, value: new Date(user.registeredAt).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }), label: isEs ? 'Fecha' : 'Date', color: '#f59e0b' },
                            ].map(({ icon: Icon, value, label, color }, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl p-3 flex flex-col items-center justify-center text-center"
                                    style={{ background: 'rgba(18,18,26,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}
                                >
                                    <Icon size={16} style={{ color, marginBottom: '6px' }} />
                                    <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                                    <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* View Details Button */}
                        <button
                            onClick={() => openUserDetail(user)}
                            className="w-full mt-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 cursor-pointer card-hover"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: 'var(--color-text-muted)', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-tertiary))';
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.color = 'var(--color-text-muted)';
                            }}
                        >
                            {isEs ? 'Detalles del Cliente' : 'Customer Details'}
                            <ArrowUpRight size={14} />
                        </button>

                        {/* Top gradient line */}
                        <div
                            className="absolute top-0 left-0 right-0 h-[2px]"
                            style={{ background: 'linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary))', opacity: 0, transition: 'opacity 0.2s ease' }}
                        />
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
                <div className="py-20 text-center">
                    <p className="font-semibold italic" style={{ color: 'var(--color-text-muted)' }}>
                        {isEs
                            ? `No se encontraron usuarios que coincidan con "${searchTerm}"`
                            : `No users found matching "${searchTerm}"`}
                    </p>
                </div>
            )}

            {/* ═══ USER DETAIL MODAL ═══ */}
            {selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0"
                        style={{ background: 'rgba(0,0,0,0.7)' }}
                        onClick={closeModal}
                    />

                    <div
                        className="relative w-full max-w-4xl glass-card overflow-hidden"
                        style={{
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white"
                                    style={{ background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))' }}
                                >
                                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                        {selectedUser.name}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                        <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                                            <Mail size={11} /> {selectedUser.email}
                                        </span>
                                        <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                                            <Calendar size={11} /> {isEs ? 'Miembro desde' : 'Member since'} {new Date(selectedUser.registeredAt).toLocaleDateString(isEs ? 'es' : 'en', { month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-lg cursor-pointer"
                                style={{ color: 'var(--color-text-muted)', transition: 'all 0.2s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto flex-1">
                            {loadingOrders ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4">
                                    <div className="modern-spinner" />
                                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                                        {isEs ? 'Cargando historial...' : 'Loading history...'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        {[
                                            { icon: ShoppingBag, label: isEs ? 'Total Pedidos' : 'Total Orders', value: userOrders.length, color: '#818cf8', bg: 'rgba(99,102,241,0.08)' },
                                            { icon: DollarSign, label: isEs ? 'Dinero Gastado' : 'Money Spent', value: formatPrice(userOrders.reduce((sum, o) => sum + o.total, 0), currency), color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                                            { icon: CheckCircle, label: isEs ? 'Pagados' : 'Paid', value: userOrders.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status)).length, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
                                            { icon: Truck, label: isEs ? 'En Envío' : 'Shipping', value: userOrders.filter(o => o.status === 'shipped').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                                        ].map(({ icon: Icon, label, value, color, bg }, idx) => (
                                            <div key={idx} className="rounded-xl p-4 flex items-center gap-3" style={{ background: bg, border: '1px solid rgba(255,255,255,0.04)' }}>
                                                <div className="p-2.5 rounded-lg" style={{ background: `${color}20` }}>
                                                    <Icon size={18} style={{ color }} />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order History */}
                                    <div>
                                        <h4 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                                            <Package size={16} style={{ color: '#818cf8' }} />
                                            {isEs ? 'Historial de Pedidos' : 'Order History'}
                                        </h4>

                                        {userOrders.length === 0 ? (
                                            <div className="py-12 text-center rounded-xl" style={{ background: 'rgba(18,18,26,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                <ShoppingBag size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                                                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                                                    {isEs ? 'Este cliente aún no tiene pedidos' : 'This customer has no orders yet'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                                            {[
                                                                isEs ? 'Pedido' : 'Order',
                                                                'Items',
                                                                'Total',
                                                                isEs ? 'Estado' : 'Status',
                                                                isEs ? 'Fecha' : 'Date',
                                                            ].map((h, i) => (
                                                                <th key={i} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {userOrders.map((order) => {
                                                            const sc = orderStatusConfig[order.status] || orderStatusConfig.pending;
                                                            return (
                                                                <tr key={order.id} className="table-row-hover" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                                                    <td className="px-5 py-3">
                                                                        <span className="font-mono text-sm font-bold" style={{ color: '#818cf8' }}>#{order.id.slice(0, 8)}</span>
                                                                    </td>
                                                                    <td className="px-5 py-3">
                                                                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg w-fit" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                                            <Package size={12} style={{ color: '#818cf8', opacity: 0.7 }} />
                                                                            <span className="text-[11px] font-medium truncate max-w-[200px]" style={{ color: 'var(--color-text-muted)' }}>
                                                                                {order.items.map(i => `${i.productName} x${i.quantity}`).join(', ')}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-5 py-3">
                                                                        <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{formatPrice(order.total, currency)}</span>
                                                                    </td>
                                                                    <td className="px-5 py-3">
                                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ background: sc.bg, color: sc.color }}>
                                                                            <sc.icon size={11} />
                                                                            {sc.label}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-5 py-3">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                                                                {new Date(order.createdAt).toLocaleDateString(isEs ? 'es' : 'en', { day: '2-digit', month: 'short' })}
                                                                            </span>
                                                                            <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                                                                                {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}