import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon, Box, AlertCircle, ExternalLink, Search } from 'lucide-react';
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
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-blue-500 animate-spin" />
                <p className="text-gray-400 font-medium">{t('admin.loading')}...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-white">{t('admin.products')}</h2>
                    <p className="text-gray-500 text-sm mt-1">{t('admin.manage_inventory', { defaultValue: 'Control total sobre tu catálogo de productos.' })}</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Plus size={18} strokeWidth={3} /> {t('admin.addProduct')}
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-[#1c1c1e] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500"></th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{t('admin.productName')}</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{t('admin.price')}</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{t('admin.stock')}</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{t('admin.category')}</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.map((p) => (
                                <tr key={p.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="px-6 py-4 w-20">
                                        <div className="relative group/img">
                                            <img src={p.image_url} alt="" className="w-14 h-14 rounded-2xl object-cover bg-gray-800 border border-white/10" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 rounded-2xl transition-opacity flex items-center justify-center">
                                                <ExternalLink size={14} className="text-white" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors">{i18n.language === 'es' ? p.name_es : p.name_en}</p>
                                            <p className="text-xs text-gray-500 font-medium line-clamp-1 max-w-xs">{i18n.language === 'es' ? p.description_es : p.description_en}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-white">{formatPrice(p.price, currency)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p.stock <= 5 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                                            }`}>
                                            <div className={`w-1 h-1 rounded-full ${p.stock <= 5 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                            {p.stock} Units
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[11px] font-bold text-gray-400">
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button onClick={() => openEdit(p)} className="p-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl transition-all">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all">
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

            {/* Premium Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />

                    <div className="relative w-full max-w-3xl bg-[#1c1c1e] rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.01]">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                                    <Box size={20} className="text-white" />
                                </div>
                                <h3 className="text-xl font-black text-white">{editingId ? t('admin.editProduct') : t('admin.addProduct')}</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Side: Image Preview */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Previsualización</label>
                                    <div className="aspect-square rounded-[2rem] bg-[#2c2c2e] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative group">
                                        {form.image_url ? (
                                            <img src={form.image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        ) : (
                                            <div className="text-center space-y-2">
                                                <ImageIcon size={48} className="mx-auto text-gray-700" />
                                                <p className="text-xs font-bold text-gray-600">No Image Selected</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={form.image_url}
                                        onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                                        placeholder="URL de la imagen..."
                                        className="w-full bg-[#2c2c2e] border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>

                                {/* Right Side: Info */}
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 gap-5">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">{t('admin.productNameEn')}</label>
                                            <input type="text" value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} className="w-full bg-[#2c2c2e] border border-white/5 rounded-2xl py-3 px-4 text-white focus:border-blue-500/50 outline-none mt-1.5 font-bold" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">{t('admin.productNameEs')}</label>
                                            <input type="text" value={form.name_es} onChange={e => setForm(f => ({ ...f, name_es: e.target.value }))} className="w-full bg-[#2c2c2e] border border-white/5 rounded-2xl py-3 px-4 text-white focus:border-blue-500/50 outline-none mt-1.5 font-bold" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">{t('admin.price')}</label>
                                                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full bg-[#2c2c2e] border border-white/5 rounded-2xl py-3 px-4 text-white focus:border-blue-500/50 outline-none mt-1.5 font-black" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">{t('admin.stock')}</label>
                                                <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full bg-[#2c2c2e] border border-white/5 rounded-2xl py-3 px-4 text-white focus:border-blue-500/50 outline-none mt-1.5 font-black" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">{t('admin.category')}</label>
                                            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-[#2c2c2e] border border-white/5 rounded-2xl py-3 px-4 text-white focus:border-blue-500/50 outline-none mt-1.5 cursor-pointer font-bold appearance-none">
                                                <option value="">-- Seleccionar --</option>
                                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom inputs spanning 2 columns */}
                                <div className="col-span-1 md:col-span-2 space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">{t('admin.descriptionEn')}</label>
                                            <textarea rows={3} value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} className="w-full bg-[#2c2c2e] border border-white/5 rounded-2xl py-3 px-4 text-white focus:border-blue-500/50 outline-none mt-1.5 text-sm resize-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">{t('admin.descriptionEs')}</label>
                                            <textarea rows={3} value={form.description_es} onChange={e => setForm(f => ({ ...f, description_es: e.target.value }))} className="w-full bg-[#2c2c2e] border border-white/5 rounded-2xl py-3 px-4 text-white focus:border-blue-500/50 outline-none mt-1.5 text-sm resize-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">{t('admin.specs')} (Separado por comas)</label>
                                        <input type="text" value={form.specs} onChange={e => setForm(f => ({ ...f, specs: e.target.value }))} placeholder="Ej: 16GB RAM, 512GB SSD..." className="w-full bg-[#2c2c2e] border border-white/5 rounded-2xl py-3 px-4 text-white focus:border-blue-500/50 outline-none mt-1.5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-end gap-4">
                            <button onClick={() => setShowModal(false)} className="px-8 py-3.5 rounded-2xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest">{t('common.cancel')}</button>
                            <button onClick={handleSave} className="flex items-center gap-2 px-10 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest">
                                <Save size={18} /> {t('common.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}