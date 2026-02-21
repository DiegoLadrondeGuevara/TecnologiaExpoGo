import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, HelpCircle, LogOut, Globe } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

const ProfileScreen = () => {
    const { t, locale, currency, toggleLanguage } = useLanguage();

    const menuItems = [
        { icon: Bell, label: t('profile.notifications'), badge: '3' },
        { icon: Globe, label: t('profile.switchLanguage'), subtitle: `${locale.toUpperCase()} / ${currency}`, onPress: toggleLanguage },
        { icon: Settings, label: t('profile.settings') },
        { icon: HelpCircle, label: t('profile.helpSupport') },
        { icon: LogOut, label: t('profile.signOut'), danger: true },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Text style={styles.screenTitle}>{t('profile.title')}</Text>

            {/* Avatar Section */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                    <User size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.userName}>Tech Shopper</Text>
                <Text style={styles.userEmail}>user@techstore.com</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>{t('profile.orders')}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>3</Text>
                    <Text style={styles.statLabel}>{t('profile.wishlist')}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>$4.2k</Text>
                    <Text style={styles.statLabel}>{t('profile.spent')}</Text>
                </View>
            </View>

            {/* Menu */}
            <View style={styles.menuSection}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        activeOpacity={0.7}
                        onPress={item.onPress}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, item.danger && styles.menuIconDanger]}>
                                <item.icon
                                    size={18}
                                    color={item.danger ? COLORS.danger : COLORS.primary}
                                />
                            </View>
                            <View>
                                <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                                    {item.label}
                                </Text>
                                {item.subtitle && (
                                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                )}
                            </View>
                        </View>
                        {item.badge && (
                            <View style={styles.menuBadge}>
                                <Text style={styles.menuBadgeText}>{item.badge}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* App Info */}
            <Text style={styles.version}>{t('profile.version')}</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    screenTitle: {
        color: COLORS.textPrimary,
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    userName: {
        color: COLORS.textPrimary,
        fontSize: 22,
        fontWeight: '800',
    },
    userEmail: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        marginHorizontal: 16,
        borderRadius: 16,
        paddingVertical: 16,
        marginTop: 8,
        marginBottom: 24,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: '800',
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    statDivider: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.border,
    },
    menuSection: {
        paddingHorizontal: 16,
        gap: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.card,
        padding: 14,
        borderRadius: 12,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 122, 255, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIconDanger: {
        backgroundColor: 'rgba(255, 59, 48, 0.12)',
    },
    menuLabel: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    menuLabelDanger: {
        color: COLORS.danger,
    },
    menuSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    menuBadge: {
        backgroundColor: COLORS.danger,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    menuBadgeText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '700',
    },
    version: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 24,
    },
});

export default ProfileScreen;
