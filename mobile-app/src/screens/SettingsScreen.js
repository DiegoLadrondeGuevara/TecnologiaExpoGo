import React, { useState } from 'react';
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
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import apiClient from '../../../shared-logic/apiClient';

const SettingsScreen = ({ navigation }) => {
    const { user, setUser } = useAuth();
    const { t } = useLanguage();
    const [editingField, setEditingField] = useState(null); // null | 'name' | 'address'
    const [value, setValue] = useState('');
    const [saving, setSaving] = useState(false);

    const openEdit = (field) => {
        setEditingField(field);
        setValue(field === 'name' ? (user?.name || '') : (user?.address || ''));
    };

    const handleSave = async () => {
        if (editingField === 'name' && !value.trim()) {
            Alert.alert('Error', t('settings.nameRequired') || 'Name is required');
            return;
        }
        setSaving(true);
        try {
            const payload = editingField === 'name'
                ? { name: value.trim() }
                : { address: value.trim() };
            const res = await apiClient.patch('/users/me', payload);
            if (setUser) setUser(res);
            Alert.alert('✓', t('settings.saved') || 'Updated successfully');
            setEditingField(null);
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    // ─── Edit Screen (Name or Address) ───
    if (editingField) {
        const isName = editingField === 'name';
        const Icon = isName ? User : MapPin;
        const label = isName
            ? (t('settings.name') || 'Full Name')
            : (t('settings.address') || 'Address');

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
                        <Text style={styles.headerTitle}>{label}</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{label}</Text>
                            <View style={[
                                styles.inputWrapper,
                                !isName && { height: 100, alignItems: 'flex-start', paddingTop: 14 },
                            ]}>
                                <Icon
                                    size={18}
                                    color={COLORS.textSecondary}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[
                                        styles.input,
                                        !isName && { textAlignVertical: 'top' },
                                    ]}
                                    value={value}
                                    onChangeText={setValue}
                                    placeholder={isName ? 'John Doe' : '123 Main St, City...'}
                                    placeholderTextColor={COLORS.textSecondary}
                                    autoCapitalize={isName ? 'words' : 'sentences'}
                                    multiline={!isName}
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
    const menuItems = [
        {
            icon: User,
            label: t('settings.name') || 'Full Name',
            value: user?.name || '—',
            onPress: () => openEdit('name'),
        },
        {
            icon: MapPin,
            label: t('settings.address') || 'Address',
            value: user?.address || t('settings.notSet') || 'Not set',
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
});

export default SettingsScreen;
