import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Users,
    CreditCard,
    Tags,
    Globe,
    ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
    { path: '/', icon: LayoutDashboard, labelKey: 'admin.dashboard' },
    { path: '/products', icon: Package, labelKey: 'admin.products' },
    { path: '/users', icon: Users, labelKey: 'admin.users' },
    { path: '/payments', icon: CreditCard, labelKey: 'admin.payments' },
    { path: '/categories', icon: Tags, labelKey: 'admin.categories' },
];

export default function DashboardLayout() {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;

    const toggleLanguage = () => {
        i18n.changeLanguage(currentLang === 'en' ? 'es' : 'en');
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col"
                style={{ backgroundColor: 'var(--color-bg-secondary)', borderRight: '1px solid var(--color-border)' }}>

                {/* Logo */}
                <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-blue)' }}>
                        <Package size={20} color="#fff" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>TechStore</h1>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Admin Panel</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
                    {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'text-white' : ''
                                }`
                            }
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? 'var(--color-accent-glow)' : 'transparent',
                                color: isActive ? 'var(--color-accent-blue-light)' : 'var(--color-text-secondary)',
                            })}
                        >
                            <Icon size={18} />
                            <span className="flex-1">{t(labelKey)}</span>
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </NavLink>
                    ))}
                </nav>

                {/* Language Toggle */}
                <div className="px-3 pb-4">
                    <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                        style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-secondary)' }}
                    >
                        <Globe size={18} />
                        <span className="flex-1 text-left">{currentLang === 'en' ? 'Español' : 'English'}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-accent-glow)', color: 'var(--color-accent-blue)' }}>
                            {currentLang.toUpperCase()}
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="p-8 max-w-7xl mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
