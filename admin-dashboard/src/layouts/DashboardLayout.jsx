import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Users,
    CreditCard,
    Tags,
    Globe,
    LogOut,
    ShoppingCart,
    Settings,
    ChevronLeft,
    ChevronRight,
    Menu,
} from 'lucide-react';
import { logout } from '../services/authService';

const NAV_ITEMS = [
    { path: '/', icon: LayoutDashboard, labelKey: 'admin.dashboard' },
    { path: '/products', icon: Package, labelKey: 'admin.products' },
    { path: '/users', icon: Users, labelKey: 'admin.users' },
    { path: '/payments', icon: CreditCard, labelKey: 'admin.payments' },
    { path: '/sales', icon: ShoppingCart, labelKey: 'admin.sales' },
    { path: '/categories', icon: Tags, labelKey: 'admin.categories' },
    { path: '/settings', icon: Settings, labelKey: 'admin.settings' },
];

export default function DashboardLayout() {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(true);
    const [hovered, setHovered] = useState(false);

    const isExpanded = !collapsed || hovered;

    const toggleLanguage = () => {
        i18n.changeLanguage(currentLang === 'en' ? 'es' : 'en');
    };

    // Get current page title
    const currentNav = NAV_ITEMS.find(item =>
        item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
    );

    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>

            {/* ═══ SIDEBAR ═══ */}
            <aside
                className="glass-sidebar flex-shrink-0 flex flex-col h-full relative z-20"
                style={{
                    width: isExpanded ? 'var(--sidebar-expanded)' : 'var(--sidebar-collapsed)',
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Logo Area */}
                <div
                    className="flex items-center gap-3 px-5 py-5"
                    style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        minHeight: '72px',
                    }}
                >
                    <div
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
                            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                        }}
                    >
                        <Package size={20} color="#fff" />
                    </div>
                    <div
                        style={{
                            opacity: isExpanded ? 1 : 0,
                            width: isExpanded ? 'auto' : 0,
                            overflow: 'hidden',
                            transition: 'opacity 0.25s ease, width 0.3s ease',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <h1 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            TechStore
                        </h1>
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                            Admin Panel
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
                    {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === '/'}
                            className="group relative"
                        >
                            {({ isActive }) => (
                                <div
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative"
                                    style={{
                                        backgroundColor: isActive
                                            ? 'rgba(99, 102, 241, 0.1)'
                                            : 'transparent',
                                        color: isActive
                                            ? '#818cf8'
                                            : 'var(--color-text-secondary)',
                                        transition: 'all 0.25s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                                            e.currentTarget.style.color = 'var(--color-text-primary)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                                        }
                                    }}
                                >
                                    {/* Active indicator bar */}
                                    {isActive && <div className="nav-active-indicator" />}

                                    <Icon size={20} className="flex-shrink-0" />

                                    <span
                                        style={{
                                            opacity: isExpanded ? 1 : 0,
                                            width: isExpanded ? 'auto' : 0,
                                            overflow: 'hidden',
                                            transition: 'opacity 0.25s ease',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {t(labelKey)}
                                    </span>

                                    {/* Tooltip when collapsed */}
                                    {!isExpanded && (
                                        <div className="sidebar-tooltip">
                                            {t(labelKey)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="px-3 pb-2 flex flex-col gap-1">
                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer group relative"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: 'var(--color-text-secondary)',
                            transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                        }}
                    >
                        <Globe size={20} className="flex-shrink-0" />
                        <span
                            style={{
                                opacity: isExpanded ? 1 : 0,
                                width: isExpanded ? 'auto' : 0,
                                overflow: 'hidden',
                                transition: 'opacity 0.25s ease',
                                whiteSpace: 'nowrap',
                                flex: 1,
                                textAlign: 'left',
                            }}
                        >
                            {currentLang === 'en' ? 'Español' : 'English'}
                        </span>
                        {isExpanded && (
                            <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                                style={{
                                    background: 'rgba(99, 102, 241, 0.15)',
                                    color: '#818cf8',
                                }}
                            >
                                {currentLang.toUpperCase()}
                            </span>
                        )}
                        {!isExpanded && (
                            <div className="sidebar-tooltip">
                                {currentLang === 'en' ? 'Español' : 'English'}
                            </div>
                        )}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer group relative"
                        style={{
                            color: 'var(--color-text-secondary)',
                            transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                            e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                        }}
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        <span
                            style={{
                                opacity: isExpanded ? 1 : 0,
                                width: isExpanded ? 'auto' : 0,
                                overflow: 'hidden',
                                transition: 'opacity 0.25s ease',
                                whiteSpace: 'nowrap',
                                flex: 1,
                                textAlign: 'left',
                            }}
                        >
                            {t('admin.logout') || 'Log Out'}
                        </span>
                        {!isExpanded && (
                            <div className="sidebar-tooltip">
                                {t('admin.logout') || 'Log Out'}
                            </div>
                        )}
                    </button>
                </div>

                {/* Collapse Toggle */}
                <div className="px-3 pb-4">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center py-2 rounded-xl cursor-pointer"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: 'var(--color-text-muted)',
                            transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.color = 'var(--color-text-muted)';
                        }}
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>
            </aside>

            {/* ═══ MAIN CONTENT AREA ═══ */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Top Header Bar */}
                <header
                    className="flex items-center justify-between px-8 py-4 flex-shrink-0"
                    style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        backgroundColor: 'rgba(10, 10, 15, 0.8)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))' }}
                        />
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                            {currentNav ? t(currentNav.labelKey) : 'Dashboard'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                            {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-tertiary))',
                                color: '#fff',
                            }}
                        >
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'transparent' }}>
                    <div className="p-8 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
