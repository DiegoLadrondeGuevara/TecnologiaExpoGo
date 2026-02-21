import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories } from '../services/api';
import { formatPrice } from '../../../shared-logic/currency';

const emptyForm = { name_en: '', name_es: '', description_en: '', description_es: '', price: '', stock: '', category: '', image_url: '', specs: '' };

export default function ProductsPage() {
    const { t, i18n } = useTranslation();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const currency = i18n.language === 'es' ? 'PEN' : 'USD';

    useEffect(() => {
        Promise.all([fetchProducts(), fetchCategories()]).then(([p, c]) => {
            setProducts(p);
            setCategories(c);
            setLoading(false);
        });
    }, []);

    const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
    const openEdit = (p) => {
        setForm({ ...p, specs: (p.specs || []).join(', '), price: String(p.price), stock: String(p.stock) });
        setEditingId(p.id);
        setShowModal(true);
    };

    const handleSave = async () => {
        const data = { ...form, price: Number(form.price), stock: Number(form.stock), specs: form.specs.split(',').map(s => s.trim()).filter(Boolean) };
        if (editingId) {
            const updated = await updateProduct(editingId, data);
            setProducts(prev => prev.map(p => p.id === editingId ? updated : p));
        } else {
            const created = await createProduct(data);
            setProducts(prev => [created, ...prev]);
        }
        setShowModal(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.confirmDelete'))) return;
        await deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-accent-blue)', borderTopColor: 'transparent' }} /></div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{t('admin.products')}</h2>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 cursor-pointer" style={{ backgroundColor: 'var(--color-accent-blue)' }}>
                    <Plus size={16} /> {t('admin.addProduct')}
                </button>
            </div>

            {/* Products Table */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {['', t('admin.productName'), t('admin.price'), t('admin.stock'), t('admin.category'), t('admin.actions')].map((h, i) => (
                                    <th key={i} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p, i) => (
                                <tr key={p.id} className="transition-colors duration-200" style={{ borderBottom: i < products.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-card-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td className="px-5 py-3">
                                        <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" style={{ backgroundColor: 'var(--color-bg-card-hover)' }} />
                                    </td>
                                    <td className="px-5 py-3">
                                        <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{i18n.language === 'es' ? p.name_es : p.name_en}</p>
                                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-text-secondary)' }}>{i18n.language === 'es' ? p.description_es : p.description_en}</p>
                                    </td>
                                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--color-accent-blue)' }}>{formatPrice(p.price, currency)}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full`}
                                            style={{ backgroundColor: p.stock <= 5 ? 'rgba(255, 149, 0, 0.12)' : 'rgba(52, 199, 89, 0.12)', color: p.stock <= 5 ? 'var(--color-status-warning)' : 'var(--color-status-success)' }}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-accent-glow)', color: 'var(--color-accent-blue)' }}>{p.category}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(p)} className="p-2 rounded-lg transition-colors duration-200 cursor-pointer" style={{ backgroundColor: 'var(--color-accent-glow)' }}><Pencil size={14} color="var(--color-accent-blue)" /></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg transition-colors duration-200 cursor-pointer" style={{ backgroundColor: 'rgba(255, 59, 48, 0.12)' }}><Trash2 size={14} color="var(--color-status-danger)" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="w-full max-w-2xl rounded-xl p-6 max-h-[90vh] overflow-y-auto animate-fade-in" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{editingId ? t('admin.editProduct') : t('admin.addProduct')}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg cursor-pointer" style={{ backgroundColor: 'var(--color-bg-card)' }}><X size={16} color="var(--color-text-secondary)" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { key: 'name_en', label: t('admin.productNameEn'), span: 1 },
                                { key: 'name_es', label: t('admin.productNameEs'), span: 1 },
                                { key: 'description_en', label: t('admin.descriptionEn'), span: 2, multi: true },
                                { key: 'description_es', label: t('admin.descriptionEs'), span: 2, multi: true },
                                { key: 'price', label: t('admin.price'), span: 1, type: 'number' },
                                { key: 'stock', label: t('admin.stock'), span: 1, type: 'number' },
                                { key: 'image_url', label: t('admin.imageUrl'), span: 2 },
                                { key: 'specs', label: t('admin.specs') + ' (comma-separated)', span: 2 },
                            ].map(({ key, label, span, multi, type }) => (
                                <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>{label}</label>
                                    {multi ? (
                                        <textarea rows={2} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors duration-200 resize-none"
                                            style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }} />
                                    ) : (
                                        <input type={type || 'text'} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors duration-200"
                                            style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }} />
                                    )}
                                </div>
                            ))}
                            {/* Category Select */}
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>{t('admin.category')}</label>
                                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
                                    <option value="">--</option>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-secondary)' }}>{t('common.cancel')}</button>
                            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: 'var(--color-accent-blue)' }}>
                                <Save size={14} /> {t('common.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
