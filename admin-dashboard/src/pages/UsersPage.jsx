import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Calendar, ShoppingBag, DollarSign, UserCheck, Search, MoreHorizontal, ArrowUpRight } from 'lucide-react';
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
                <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-blue-500 animate-spin" />
                <p className="text-gray-400 font-medium animate-pulse">{t('admin.loading')}...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header + Search */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        {t('admin.users')}
                        <span className="text-xs font-black px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 uppercase tracking-widest">
                            {users.length} Total
                        </span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{t('admin.manage_users_desc', { defaultValue: 'Monitorea la actividad y el gasto de tus clientes.' })}</p>
                </div>

                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder={t('admin.search_user', { defaultValue: 'Buscar por nombre o email...' })}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1c1c1e] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user, i) => (
                    <div
                        key={user.id}
                        className="group relative bg-[#2c2c2e] rounded-[2rem] p-6 border border-white/5 transition-all duration-300 hover:bg-[#323235] hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
                        style={{ animationDelay: `${i * 40}ms` }}
                    >
                        {/* Glass Overlay Background (Decorative) */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />

                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-lg font-black text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-[#2c2c2e] rounded-full" title="Active User" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white group-hover:text-blue-400 transition-colors leading-tight">{user.name}</h3>
                                    <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                                        <Mail size={12} />
                                        <span className="text-xs font-medium truncate max-w-[140px]">{user.email}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 text-gray-600 hover:text-white transition-colors">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[#1c1c1e] rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center text-center">
                                <ShoppingBag size={16} className="text-blue-500 mb-1.5" />
                                <p className="text-sm font-black text-white">{user.orders}</p>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">{t('profile.orders')}</p>
                            </div>

                            <div className="bg-[#1c1c1e] rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center text-center">
                                <DollarSign size={16} className="text-emerald-500 mb-1.5" />
                                <p className="text-sm font-black text-white leading-none mb-1">{formatPrice(user.totalSpent, currency).split('.')[0]}</p>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">{t('profile.spent')}</p>
                            </div>

                            <div className="bg-[#1c1c1e] rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center text-center">
                                <Calendar size={16} className="text-amber-500 mb-1.5" />
                                <p className="text-[10px] font-black text-white">{new Date(user.registeredAt).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}</p>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">{t('admin.date')}</p>
                            </div>
                        </div>

                        {/* View Profile Action */}
                        <button className="w-full mt-6 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-blue-600 hover:border-blue-600 text-[11px] font-black text-gray-400 hover:text-white uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group/btn">
                            {t('admin.view_details', { defaultValue: 'Detalles del Cliente' })}
                            <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-gray-500 font-bold italic">No se encontraron usuarios que coincidan con "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
}