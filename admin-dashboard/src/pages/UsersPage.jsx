import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import { fetchUsers } from '../services/api';
import { formatPrice } from '../../../shared-logic/currency';

export default function UsersPage() {
    const { t, i18n } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const currency = i18n.language === 'es' ? 'PEN' : 'USD';

    useEffect(() => {
        fetchUsers().then(data => { setUsers(data); setLoading(false); });
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-accent-blue)', borderTopColor: 'transparent' }} /></div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{t('admin.users')}</h2>
                <span className="text-sm font-medium px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-accent-glow)', color: 'var(--color-accent-blue)' }}>
                    {users.length} {t('admin.users').toLowerCase()}
                </span>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user, i) => (
                    <div key={user.id} className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                        style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', animationDelay: `${i * 50}ms` }}>

                        {/* Avatar + Name */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'var(--color-accent-glow)', color: 'var(--color-accent-blue)' }}>
                                {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{user.name}</p>
                                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    <Mail size={11} /> {user.email}
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-lg px-3 py-2 text-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                                <ShoppingBag size={14} className="mx-auto mb-1" color="var(--color-accent-blue)" />
                                <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{user.orders}</p>
                                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{t('profile.orders')}</p>
                            </div>
                            <div className="rounded-lg px-3 py-2 text-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                                <DollarSign size={14} className="mx-auto mb-1" color="var(--color-status-success)" />
                                <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{formatPrice(user.totalSpent, currency)}</p>
                                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{t('profile.spent')}</p>
                            </div>
                            <div className="rounded-lg px-3 py-2 text-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                                <Calendar size={14} className="mx-auto mb-1" color="var(--color-status-warning)" />
                                <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{new Date(user.registeredAt).toLocaleDateString()}</p>
                                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{t('admin.date')}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
