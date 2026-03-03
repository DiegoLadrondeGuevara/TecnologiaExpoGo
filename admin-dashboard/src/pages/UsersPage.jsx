import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Calendar, ShoppingBag, DollarSign, Search, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { fetchUsers } from '../services/api';
import { formatPrice } from '../../../shared-logic/currency';

export default function UsersPage() {
    const { t, i18n } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const currency = i18n.language === 'es' ? 'PEN' : 'USD';

    useEffect(() => {
        fetchUsers().then(data => { setUsers(data); setLoading(false); });
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            {/* Header + Search */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 animate-fade-in-up">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
                        {t('admin.users')}
                        <span
                            className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
                            style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: '#818cf8',
                                border: '1px solid rgba(99, 102, 241, 0.15)',
                            }}
                        >
                            {users.length} Total
                        </span>
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{t('admin.manage_users_desc', { defaultValue: 'Monitorea la actividad y el gasto de tus clientes.' })}</p>
                </div>

                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s ease' }} />
                    <input
                        type="text"
                        placeholder={t('admin.search_user', { defaultValue: 'Buscar por nombre o email...' })}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="glass-input w-full rounded-xl py-3.5 pl-12 pr-4 text-sm text-white"
                    />
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredUsers.map((user, i) => (
                    <div
                        key={user.id}
                        className={`group glass-card glass-card-hover hover-lift p-6 relative overflow-hidden animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                    >
                        {/* Ambient decoration */}
                        <div
                            className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100"
                            style={{
                                background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                                transition: 'opacity 0.5s ease',
                            }}
                        />

                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                                        style={{
                                            background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
                                            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                                            transition: 'transform 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div
                                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full"
                                        style={{
                                            backgroundColor: '#10b981',
                                            border: '3px solid var(--color-bg-card)',
                                            boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
                                        }}
                                        title="Active User"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold leading-tight" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }}>{user.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                        <Mail size={12} />
                                        <span className="text-xs font-medium truncate max-w-[140px]">{user.email}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="p-2 rounded-lg"
                                style={{ color: 'var(--color-text-muted)', transition: 'all 0.2s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                            >
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 relative z-10">
                            {[
                                { icon: ShoppingBag, value: user.orders, label: t('profile.orders'), color: '#818cf8' },
                                { icon: DollarSign, value: formatPrice(user.totalSpent, currency).split('.')[0], label: t('profile.spent'), color: '#10b981' },
                                { icon: Calendar, value: new Date(user.registeredAt).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }), label: t('admin.date'), color: '#f59e0b' },
                            ].map(({ icon: Icon, value, label, color }, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl p-3 flex flex-col items-center justify-center text-center"
                                    style={{
                                        background: 'rgba(18, 18, 26, 0.5)',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                    }}
                                >
                                    <Icon size={16} style={{ color, marginBottom: '6px' }} />
                                    <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                                    <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* View Details Button */}
                        <button
                            className="w-full mt-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 group/btn"
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                color: 'var(--color-text-muted)',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-tertiary))';
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.color = '#fff';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.color = 'var(--color-text-muted)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {t('admin.view_details', { defaultValue: 'Detalles del Cliente' })}
                            <ArrowUpRight size={14} />
                        </button>

                        {/* Top gradient line on hover */}
                        <div
                            className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100"
                            style={{
                                background: 'linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary))',
                                transition: 'opacity 0.3s ease',
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
                <div className="py-20 text-center">
                    <p className="font-semibold italic" style={{ color: 'var(--color-text-muted)' }}>No se encontraron usuarios que coincidan con "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
}