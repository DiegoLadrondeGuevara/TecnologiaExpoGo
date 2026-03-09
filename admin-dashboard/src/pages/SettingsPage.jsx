import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Phone, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const isEs = i18n.language === 'es';
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchPhone = async () => {
            try {
                const res = await api.get('/store-settings/SUPPORT_PHONE');
                setPhone(res.data?.value || '');
            } catch (err) {
                console.warn('Could not load support phone:', err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPhone();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            await api.put('/store-settings/SUPPORT_PHONE', { value: phone });
            setMessage('success');
        } catch (err) {
            setMessage('error:' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 4000);
        }
    };

    const isSuccess = message === 'success';
    const errorMsg = message.startsWith('error:') ? message.slice(6) : '';

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                    {t('settings', 'Settings')}
                </h2>
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                    {isEs ? 'Gestiona la configuración de la tienda y soporte.' : 'Manage store configuration and support settings.'}
                </p>
            </div>

            {/* Support Phone Card */}
            <div className="glass-card p-8 max-w-xl relative overflow-hidden">
                {/* Top gradient line */}
                <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: 'linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary))', opacity: 0.6 }}
                />

                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="p-3 rounded-xl"
                        style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                        }}
                    >
                        <Phone size={20} color="#fff" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{isEs ? 'Soporte WhatsApp' : 'WhatsApp Support'}</h3>
                        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                            {isEs ? 'Configura el número de teléfono para soporte por WhatsApp.' : 'Configure the phone number for WhatsApp support.'}
                        </p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label
                            htmlFor="support-phone"
                            className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            {isEs ? 'Número de Soporte' : 'Support Phone Number'}
                        </label>
                        <p className="text-xs mb-3 ml-1" style={{ color: 'var(--color-text-muted)' }}>
                            {isEs ? 'Incluye código de país sin "+" (ej. 51987654321).' : 'Include country code without "+" (e.g. 51987654321).'}
                        </p>
                        <input
                            id="support-phone"
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="51987654321"
                            disabled={loading}
                            className="glass-input w-full rounded-xl py-3.5 px-4 text-white font-medium text-sm disabled:opacity-40"
                        />
                    </div>

                    {/* Feedback */}
                    {(isSuccess || errorMsg) && (
                        <div
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium animate-slide-down"
                            style={{
                                background: isSuccess ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                                color: isSuccess ? '#10b981' : '#f87171',
                            }}
                        >
                            {isSuccess ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {isSuccess ? (isEs ? 'Teléfono de soporte guardado correctamente' : 'Support phone saved successfully') : `Error: ${errorMsg}`}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="btn-gradient flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar Cambios' : 'Save Changes')}
                    </button>
                </div>
            </div>
        </div>
    );
}
