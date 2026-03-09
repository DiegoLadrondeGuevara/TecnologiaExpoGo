import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Tag, X, Layers, Check } from 'lucide-react';
import { fetchCategories, createCategory, deleteCategory } from '../services/api';

const PRESET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#facc15', '#22c55e'];

export default function CategoriesPage() {
    const { t, i18n } = useTranslation();
    const isEs = i18n.language === 'es';
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
                <div className="modern-spinner" />
                <p className="font-medium animate-pulse" style={{ color: 'var(--color-text-muted)' }}>{t('admin.loading')}...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{t('admin.categories')}</h2>
                    <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>{isEs ? 'Organiza tus productos por grupos y colores.' : 'Organize your products by groups and colors.'}</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
                    style={{
                        background: showForm
                            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                            : 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
                        boxShadow: showForm
                            ? '0 4px 16px rgba(239, 68, 68, 0.3)'
                            : '0 4px 16px rgba(99, 102, 241, 0.3)',
                        transition: 'all 0.3s ease',
                    }}
                >
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? t('common.cancel') : t('admin.addCategory')}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="glass-card p-7">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-muted)' }}>{t('admin.categoryName')}</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--color-text-muted)' }} />
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. Smartphones"
                                    className="glass-input w-full rounded-xl py-3 pl-10 pr-4 text-white font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-muted)' }}>{isEs ? 'Tema de Color' : 'Color Theme'}</label>
                            <div className="flex flex-wrap gap-3 p-2 rounded-xl" style={{ background: 'rgba(18,18,26,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                {PRESET_COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setNewColor(c)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center relative hover-scale"
                                        style={{
                                            backgroundColor: c,
                                            boxShadow: newColor === c ? `0 0 16px ${c}60` : 'none',
                                            transform: newColor === c ? 'scale(1.15)' : 'scale(1)',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {newColor === c && <Check size={16} className="text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={!newName.trim()}
                            className="font-bold py-3.5 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </div>
            )}

            {/* Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((cat, i) => (
                    <div
                        key={cat.id}
                        className="group relative glass-card p-7 overflow-hidden card-hover"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div
                                className="p-3 rounded-xl"
                                style={{
                                    background: `${cat.color}12`,
                                    boxShadow: `0 0 20px ${cat.color}10`,
                                }}
                            >
                                <Layers size={24} style={{ color: cat.color }} />
                            </div>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="p-2.5 rounded-xl opacity-0 group-hover:opacity-100"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    color: '#f87171',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.color = '#f87171'; }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }}>{cat.name}</h3>
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                                {cat.productCount} {t('admin.products')}
                            </p>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-6">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                <span>{isEs ? 'Densidad' : 'Density'}</span>
                                <span>{Math.min(Math.round((cat.productCount / 20) * 100), 100)}%</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        backgroundColor: cat.color,
                                        width: `${Math.min((cat.productCount / 20) * 100, 100)}%`,
                                        boxShadow: `0 0 12px ${cat.color}40`,
                                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Background decoration */}
                        <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.06]" style={{ transition: 'opacity 0.3s ease' }}>
                            <Tag size={80} style={{ color: cat.color }} />
                        </div>

                        {/* Top gradient line */}
                        <div
                            className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100"
                            style={{
                                background: `linear-gradient(90deg, ${cat.color}, transparent)`,
                                transition: 'opacity 0.3s ease',
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}