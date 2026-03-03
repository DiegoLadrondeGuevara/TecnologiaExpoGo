import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    ChevronRight,
    User,
    MapPin,
    Save,
    Sun,
    Moon,
    Monitor,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../../../shared-logic/apiClient';

const SettingsScreen = ({ navigation }) => {
    const { user, setUser } = useAuth();
    const { t } = useLanguage();
    const { mode: themeMode, setTheme, isDark } = useTheme();
    const [editingField, setEditingField] = useState(null); // null | 'name'
    const [value, setValue] = useState('');
    const [saving, setSaving] = useState(false);

    // Parse saved address
    const savedAddress = useMemo(() => {
        if (!user?.address) return null;
        try {
            return JSON.parse(user.address);
        } catch {
            return { label: '', address: user.address };
        }
    }, [user?.address]);

    const openEdit = (field) => {
        if (field === 'address') {
            // Navigate to ShippingAddressScreen in settings mode
            navigation.navigate('ShippingAddress', { mode: 'settings' });
            return;
        }
        setEditingField(field);
        setValue(user?.name || '');
    };

    const handleSave = async () => {
        if (!value.trim()) {
            Alert.alert('Error', t('settings.nameRequired') || 'Name is required');
            return;
        }
        setSaving(true);
        try {
            const res = await apiClient.patch('/users/me', { name: value.trim() });
            if (setUser) setUser(res);
            Alert.alert('✓', t('settings.saved') || 'Updated successfully');
            setEditingField(null);
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    // ─── Edit Name Screen ───
    if (editingField === 'name') {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => setEditingField(null)}
                        >
                            <ChevronLeft size={22} color={COLORS.black} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>
                            {t('settings.name') || 'Full Name'}
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                {t('settings.name') || 'Full Name'}
                            </Text>
                            <View style={styles.inputWrapper}>
                                <User
                                    size={18}
                                    color={COLORS.textSecondary}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={setValue}
                                    placeholder="John Doe"
                                    placeholderTextColor={COLORS.textSecondary}
                                    autoCapitalize="words"
                                    autoFocus
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                            onPress={handleSave}
                            activeOpacity={0.85}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color={COLORS.white} size="small" />
                            ) : (
                                <>
                                    <Save size={18} color={COLORS.white} />
                                    <Text style={styles.saveBtnText}>
                                        {t('settings.save') || 'Save Changes'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // ─── Main Settings Menu ───
    const addressDisplay = savedAddress
        ? `${savedAddress.label || 'Address'}  •  ${savedAddress.address || ''}`
        : (t('settings.notSet') || 'Not set');

    const menuItems = [
        {
            icon: User,
            label: t('settings.name') || 'Full Name',
            value: user?.name || '—',
            onPress: () => openEdit('name'),
        },
        {
            icon: MapPin,
            label: t('address.shippingAddress') || 'Shipping Address',
            value: addressDisplay,
            onPress: () => openEdit('address'),
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={22} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {t('profile.settings') || 'Settings'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
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
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                    <Text
                                        style={styles.menuValue}
                                        numberOfLines={1}
                                    >
                                        {item.value}
                                    </Text>
                                </View>
                            </View>
                            <ChevronRight size={18} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Theme Toggle */}
                <View style={styles.themeSection}>
                    <Text style={styles.themeSectionTitle}>
                        {t('settings.theme') || 'Appearance'}
                    </Text>
                    <View style={styles.themeToggle}>
                        {[
                            { key: 'light', label: t('settings.light') || 'Light', Icon: Sun },
                            { key: 'dark', label: t('settings.dark') || 'Dark', Icon: Moon },
                            { key: 'system', label: t('settings.system') || 'System', Icon: Monitor },
                        ].map((opt) => (
                            <TouchableOpacity
                                key={opt.key}
                                style={[
                                    styles.themeOption,
                                    themeMode === opt.key && styles.themeOptionActive,
                                ]}
                                onPress={() => setTheme(opt.key)}
                            >
                                <opt.Icon
                                    size={16}
                                    color={
                                        themeMode === opt.key
                                            ? COLORS.accent
                                            : COLORS.textSecondary
                                    }
                                />
                                <Text
                                    style={[
                                        styles.themeOptionText,
                                        themeMode === opt.key && styles.themeOptionTextActive,
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: 20,
        gap: 20,
    },
    menuCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    menuItemBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
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
    menuValue: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 14,
        height: 52,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '500',
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.black,
        borderRadius: 14,
        height: 52,
        gap: 8,
        marginTop: 8,
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    themeSection: {
        gap: 10,
    },
    themeSectionTitle: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 4,
    },
    themeToggle: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 4,
    },
    themeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
    },
    themeOptionActive: {
        backgroundColor: COLORS.primary,
    },
    themeOptionText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    themeOptionTextActive: {
        color: COLORS.accent,
    },
});
export default SettingsScreen;
