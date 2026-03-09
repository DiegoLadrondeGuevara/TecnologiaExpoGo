import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon, Box, AlertCircle, ExternalLink, Search, Upload, Loader2 } from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories } from '../services/api';
import { formatPrice } from '../../../shared-logic/currency';
import { uploadImage, isCloudinaryConfigured } from '../services/cloudinaryUpload';

const emptyForm = { name_en: '', name_es: '', description_en: '', description_es: '', price: '', stock: '', categoryId: '', image_url: '', specs: '' };

export default function ProductsPage() {
    const { t, i18n } = useTranslation();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const currency = i18n.language === 'es' ? 'PEN' : 'USD';
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        Promise.all([fetchProducts(), fetchCategories()])
            .then(([p, c]) => {
                setProducts(p);
                setCategories(c);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
    const openEdit = (p) => {
        setForm({ ...p, categoryId: p.categoryId || '', specs: (p.specs || []).join(', '), price: String(p.price), stock: String(p.stock) });
        setEditingId(p.id);
        setShowModal(true);
    };

    const handleSave = async () => {
        setError('');
        try {
            const data = { ...form, price: Number(form.price), stock: Number(form.stock), specs: form.specs.split(',').map(s => s.trim()).filter(Boolean) };
            if (editingId) {
                const updated = await updateProduct(editingId, data);
                setProducts(prev => prev.map(p => p.id === editingId ? updated : p));
            } else {
                const created = await createProduct(data);
                setProducts(prev => [created, ...prev]);
            }
            setShowModal(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadImage(file);
            setForm(f => ({ ...f, image_url: url }));
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.confirmDelete'))) return;
        await deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{t('admin.products')}</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{t('admin.manage_inventory', { defaultValue: 'Control total sobre tu catálogo de productos.' })}</p>
                </div>
                <button
                    onClick={openCreate}
                    className="btn-gradient flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm"
                >
                    <Plus size={18} strokeWidth={3} /> {t('admin.addProduct')}
                </button>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}></th>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>{t('admin.productName')}</th>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>{t('admin.price')}</th>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>{t('admin.stock')}</th>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>{t('admin.category')}</th>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-right" style={{ color: 'var(--color-text-muted)' }}>{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id} className="group table-row-hover" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td className="px-6 py-4 w-20">
                                        <img
                                            src={p.image_url}
                                            alt=""
                                            className="w-14 h-14 rounded-xl object-cover"
                                            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="font-bold" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }}>{i18n.language === 'es' ? p.name_es : p.name_en}</p>
                                            <p className="text-xs font-medium line-clamp-1 max-w-xs" style={{ color: 'var(--color-text-muted)' }}>{i18n.language === 'es' ? p.description_es : p.description_en}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{formatPrice(p.price, currency)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div
                                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                            style={{
                                                background: p.stock <= 5 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                                color: p.stock <= 5 ? '#f59e0b' : '#10b981',
                                            }}
                                        >
                                            <div
                                                className="w-1 h-1 rounded-full"
                                                style={{
                                                    backgroundColor: p.stock <= 5 ? '#f59e0b' : '#10b981',
                                                    animation: p.stock <= 5 ? 'glowPulse 2s ease-in-out infinite' : 'none',
                                                }}
                                            />
                                            {p.stock} Units
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className="px-3 py-1 rounded-lg text-[11px] font-semibold"
                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                color: 'var(--color-text-secondary)',
                                            }}
                                        >
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="p-2.5 rounded-xl"
                                                style={{
                                                    background: 'rgba(99, 102, 241, 0.08)',
                                                    color: '#818cf8',
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'; e.currentTarget.style.color = '#818cf8'; }}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="p-2.5 rounded-xl"
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.08)',
                                                    color: '#f87171',
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.color = '#f87171'; }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ═══ MODAL ═══ */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 animate-fade-in"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setShowModal(false)}
                    />

                    <div
                        className="relative w-full max-w-3xl glass-card overflow-hidden animate-scale-in"
                        style={{
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
                        }}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2.5 rounded-xl"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
                                        boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                                    }}
                                >
                                    <Box size={18} className="text-white" />
                                </div>
                                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                    {editingId ? t('admin.editProduct') : t('admin.addProduct')}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-lg"
                                style={{ color: 'var(--color-text-muted)', transition: 'all 0.2s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            {error && (
                                <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6 text-sm font-medium animate-slide-down"
                                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}>
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left: Image Preview */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-muted)' }}>Previsualización</label>
                                    <div
                                        className="aspect-square rounded-2xl flex items-center justify-center overflow-hidden relative group"
                                        style={{
                                            background: 'rgba(18,18,26,0.5)',
                                            border: '2px dashed rgba(255,255,255,0.08)',
                                        }}
                                    >
                                        {form.image_url ? (
                                            <img src={form.image_url} alt="" className="w-full h-full object-cover" style={{ transition: 'transform 0.3s ease' }} />
                                        ) : (
                                            <div className="text-center space-y-2">
                                                <ImageIcon size={48} style={{ color: 'var(--color-text-muted)' }} className="mx-auto" />
                                                <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>No Image Selected</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={form.image_url}
                                        onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                                        placeholder="URL de la imagen..."
                                        className="glass-input w-full rounded-xl py-3 px-4 text-sm text-white"
                                    />
                                    {isCloudinaryConfigured() && (
                                        <label
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-xs font-bold mt-2"
                                            style={{
                                                background: 'rgba(99, 102, 241, 0.08)',
                                                border: '1px solid rgba(99, 102, 241, 0.15)',
                                                color: '#818cf8',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                            {uploading ? 'Uploading...' : 'Upload Image'}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                                        </label>
                                    )}
                                </div>

                                {/* Right: Fields */}
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-muted)' }}>{t('admin.productNameEn')}</label>
                                        <input type="text" value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} className="glass-input w-full rounded-xl py-3 px-4 text-white font-bold mt-1.5" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-muted)' }}>{t('admin.productNameEs')}</label>
                                        <input type="text" value={form.name_es} onChange={e => setForm(f => ({ ...f, name_es: e.target.value }))} className="glass-input w-full rounded-xl py-3 px-4 text-white font-bold mt-1.5" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-muted)' }}>{t('admin.price')}</label>
                                            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="glass-input w-full rounded-xl py-3 px-4 text-white font-bold mt-1.5" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-muted)' }}>{t('admin.stock')}</label>
                                            <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="glass-input w-full rounded-xl py-3 px-4 text-white font-bold mt-1.5" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-muted)' }}>{t('admin.category')}</label>
                                        <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="glass-input w-full rounded-xl py-3 px-4 text-white font-bold mt-1.5 cursor-pointer appearance-none">
                                            <option value="">-- Seleccionar --</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Bottom spanning 2 columns */}
                                <div className="col-span-1 md:col-span-2 space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-muted)' }}>{t('admin.descriptionEn')}</label>
                                            <textarea rows={3} value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} className="glass-input w-full rounded-xl py-3 px-4 text-white text-sm resize-none mt-1.5" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-muted)' }}>{t('admin.descriptionEs')}</label>
                                            <textarea rows={3} value={form.description_es} onChange={e => setForm(f => ({ ...f, description_es: e.target.value }))} className="glass-input w-full rounded-xl py-3 px-4 text-white text-sm resize-none mt-1.5" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-muted)' }}>{t('admin.specs')} (Separado por comas)</label>
                                        <input type="text" value={form.specs} onChange={e => setForm(f => ({ ...f, specs: e.target.value }))} placeholder="Ej: 16GB RAM, 512GB SSD..." className="glass-input w-full rounded-xl py-3 px-4 text-white mt-1.5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 flex justify-end gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest"
                                style={{ color: 'var(--color-text-muted)', transition: 'all 0.2s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-gradient flex items-center gap-2 px-10 py-3 rounded-xl text-sm uppercase tracking-widest"
                            >
                                <Save size={18} /> {t('common.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}