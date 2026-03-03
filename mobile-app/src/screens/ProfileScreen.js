import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    User,
    Settings,
    ShoppingBag,
    HelpCircle,
    LogOut,
    ChevronRight,
    Bell,
    Globe,
    Heart,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ProfileScreen = ({ navigation }) => {    const { user, logout } = useAuth();
    const { t, locale, toggleLanguage } = useLanguage();

    const handleLogout = () => {
        Alert.alert(
            t('profile.signOut') || 'Sign Out',
            t('profile.signOutConfirm') || 'Are you sure you want to sign out?',
            [
                { text: t('common.cancel') || 'Cancel', style: 'cancel' },
                {
                    text: t('profile.signOut') || 'Sign Out',
                    style: 'destructive',
                    onPress: logout,
                },
            ],
        );
    };

    const menuItems = [
        {
            icon: ShoppingBag,
            label: t('profile.myOrders') || 'My Orders',
            onPress: () => navigation.navigate('MyOrders'),
        },
        {
            icon: Heart,
            label: t('profile.favorites') || 'Favorites',
            onPress: () => navigation.navigate('Favorites'),
        },
        {
            icon: Bell,
            label: t('profile.notifications') || 'Notifications',
            onPress: () => navigation.navigate('Notifications'),
        },
        {
            icon: Settings,
            label: t('profile.settings') || 'Settings',
            onPress: () => navigation.navigate('Settings'),
        },
        {
            icon: HelpCircle,
            label: t('profile.helpSupport') || 'Help & Support',
            onPress: () => navigation.navigate('Support'),
        },
        {
            icon: Globe,
            label: t('profile.language') || 'Language',
            badge: locale.toUpperCase(),
            onPress: toggleLanguage,
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{t('profile.title') || 'Profile'}</Text>
                </View>

                {/* User Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatar}>
                        <User size={28} color={COLORS.black} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.name || 'User'}</Text>
                        <Text style={styles.userEmail}>{user?.email || ''}</Text>
                    </View>
                </View>

                {/* Menu */}
                <View style={styles.menuCard}>
                    {menuItems.map((item, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[
                                styles.menuItem,
                                idx < menuItems.length - 1 && styles.menuItemBorder,
                            ]}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuLeft}>
                                <View style={styles.menuIcon}>
                                    <item.icon size={18} color={COLORS.black} />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                {item.badge && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{item.badge}</Text>
                                    </View>
                                )}
                                <ChevronRight size={18} color={COLORS.textSecondary} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <LogOut size={18} color={COLORS.danger} />
                    <Text style={styles.logoutText}>{t('profile.signOut') || 'Sign Out'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
    },
    headerTitle: {
        color: COLORS.textPrimary,
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginHorizontal: 16,
        backgroundColor: COLORS.card,
        borderRadius: 16,
        marginBottom: 24,
        gap: 14,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
    userEmail: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
    },
    menuCard: {
        marginHorizontal: 16,
        backgroundColor: COLORS.card,
        borderRadius: 16,
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    menuItemBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
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
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuLabel: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        paddingVertical: 16,
        gap: 8,
        backgroundColor: 'rgba(229, 57, 53, 0.06)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(229, 57, 53, 0.15)',
    },
    logoutText: {
        color: COLORS.danger,
        fontSize: 15,
        fontWeight: '700',
    },
    badge: {
        backgroundColor: COLORS.black,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
export default ProfileScreen;
