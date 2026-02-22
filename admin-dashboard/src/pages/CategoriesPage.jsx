import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Tag, X, Layers, Check } from 'lucide-react';
import { fetchCategories, createCategory, deleteCategory } from '../services/api';

const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#facc15', '#22c55e'];

export default function CategoriesPage() {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

    useEffect(() => {
        fetchCategories().then(data => { setCategories(data); setLoading(false); });
    }, []);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const created = await createCategory({ name: newName.trim(), color: newColor });
        setCategories(prev => [created, ...prev]);
        setNewName('');
        setShowForm(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.confirmDelete'))) return;
        await deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
    };

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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white">{t('admin.categories')}</h2>
                    <p className="text-gray-400 text-sm mt-1">{t('admin.manage_categories_desc', { defaultValue: 'Organiza tus productos por grupos y colores.' })}</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg ${showForm ? 'bg-rose-500 shadow-rose-500/20' : 'bg-blue-600 shadow-blue-600/20 hover:bg-blue-500'
                        } text-white`}
                >
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? t('common.cancel') : t('admin.addCategory')}
                </button>
            </div>

            {/* Formulario de Creación con Estilo Premium */}
            {showForm && (
                <div className="bg-[#2c2c2e] rounded-2xl p-6 border border-white/5 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">{t('admin.categoryName')}</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. Smartphones"
                                    className="w-full bg-[#1c1c1e] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Color Theme</label>
                            <div className="flex flex-wrap gap-3 p-1 bg-[#1c1c1e] rounded-xl border border-white/5 w-fit">
                                {PRESET_COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setNewColor(c)}
                                        className="w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center group relative"
                                        style={{ backgroundColor: c }}
                                    >
                                        {newColor === c && <Check size={16} className="text-white" />}
                                        <div className="absolute -bottom-1 w-0 h-0.5 bg-white rounded-full group-hover:w-4 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={!newName.trim()}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </div>
            )}

            {/* Grid de Categorías */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((cat, i) => (
                    <div
                        key={cat.id}
                        className="group relative bg-[#2c2c2e] rounded-2xl p-6 border border-white/5 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl shadow-black/40"
                        style={{ animationDelay: `${i * 50}ms` }}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-3 rounded-2xl shadow-inner" style={{ backgroundColor: `${cat.color}15` }}>
                                <Layers size={24} style={{ color: cat.color }} />
                            </div>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {cat.productCount} {t('admin.products')}
                            </p>
                        </div>

                        {/* Visualizer Bar */}
                        <div className="mt-6">
                            <div className="flex justify-between text-[10px] font-black text-gray-600 uppercase tracking-tighter mb-2">
                                <span>Density</span>
                                <span>{Math.min(Math.round((cat.productCount / 20) * 100), 100)}%</span>
                            </div>
                            <div className="h-2 bg-black/20 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                    style={{
                                        backgroundColor: cat.color,
                                        width: `${Math.min((cat.productCount / 20) * 100, 100)}%`,
                                        boxShadow: `0 0 15px ${cat.color}40`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Decorative Background Icon */}
                        <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <Tag size={80} style={{ color: cat.color }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}