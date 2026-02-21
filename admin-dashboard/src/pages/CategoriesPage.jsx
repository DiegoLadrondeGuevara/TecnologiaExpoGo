import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Tag, X } from 'lucide-react';
import { fetchCategories, createCategory, deleteCategory } from '../services/api';

const PRESET_COLORS = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF2D55', '#5AC8FA', '#FFD60A', '#30D158'];

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
        return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-accent-blue)', borderTopColor: 'transparent' }} /></div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{t('admin.categories')}</h2>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 cursor-pointer" style={{ backgroundColor: 'var(--color-accent-blue)' }}>
                    <Plus size={16} /> {t('admin.addCategory')}
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="rounded-xl p-5 mb-6 animate-fade-in" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('admin.addCategory')}</h3>
                        <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg cursor-pointer" style={{ backgroundColor: 'var(--color-bg-primary)' }}><X size={14} color="var(--color-text-secondary)" /></button>
                    </div>
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>{t('admin.categoryName')}</label>
                            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Wearables"
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Color</label>
                            <div className="flex gap-1.5">
                                {PRESET_COLORS.map(c => (
                                    <button key={c} onClick={() => setNewColor(c)} className="w-7 h-7 rounded-full transition-transform duration-200 cursor-pointer"
                                        style={{ backgroundColor: c, transform: newColor === c ? 'scale(1.2)' : 'scale(1)', outline: newColor === c ? '2px solid white' : 'none', outlineOffset: '2px' }} />
                                ))}
                            </div>
                        </div>
                        <button onClick={handleCreate} className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: 'var(--color-accent-blue)' }}>{t('common.save')}</button>
                    </div>
                </div>
            )}

            {/* Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat, i) => (
                    <div key={cat.id} className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                        style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', animationDelay: `${i * 50}ms` }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                                    <Tag size={18} color={cat.color} />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{cat.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{cat.productCount} {t('admin.products').toLowerCase()}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg transition-colors duration-200 cursor-pointer" style={{ backgroundColor: 'rgba(255, 59, 48, 0.08)' }}>
                                <Trash2 size={14} color="var(--color-status-danger)" />
                            </button>
                        </div>
                        {/* Color bar */}
                        <div className="mt-4 h-1 rounded-full" style={{ backgroundColor: `${cat.color}30` }}>
                            <div className="h-full rounded-full" style={{ backgroundColor: cat.color, width: `${Math.min((cat.productCount / 5) * 100, 100)}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
