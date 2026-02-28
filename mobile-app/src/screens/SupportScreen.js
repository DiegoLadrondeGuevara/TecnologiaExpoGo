import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    MessageCircle,
    Phone,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import apiClient from '../../../shared-logic/apiClient';

const SupportScreen = ({ navigation }) => {
    const { t } = useLanguage();
    const [phone, setPhone] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhone = async () => {
            try {
                const res = await apiClient.get('/store-settings/SUPPORT_PHONE');
                setPhone(res?.value || null);
            } catch (err) {
                console.warn('Could not fetch support phone:', err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPhone();
    }, []);

    const openWhatsApp = () => {
        if (!phone) return;
        const cleanNumber = phone.replace(/[^0-9]/g, '');
        const message = encodeURIComponent(
            t('support.whatsappMessage') || 'Hello! I need help with TechStore.'
        );
        Linking.openURL(`https://wa.me/${cleanNumber}?text=${message}`);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={22} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {t('profile.helpSupport') || 'Help & Support'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <MessageCircle size={40} color={COLORS.black} />
                </View>
                <Text style={styles.title}>
                    {t('support.title') || 'Need help?'}
                </Text>
                <Text style={styles.subtitle}>
                    {t('support.subtitle') || 'Chat with us on WhatsApp for quick support.'}
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.black} style={{ marginTop: 30 }} />
                ) : phone ? (
                    <TouchableOpacity
                        style={styles.whatsappBtn}
                        onPress={openWhatsApp}
                        activeOpacity={0.85}
                    >
                        <Phone size={18} color={COLORS.white} />
                        <Text style={styles.whatsappBtnText}>
                            {t('support.contactWhatsApp') || 'Contact via WhatsApp'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.unavailable}>
                        {t('support.unavailable') || 'Support phone not configured.'}
                    </Text>
                )}
            </View>
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
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    whatsappBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#25D366',
        borderRadius: 14,
        height: 52,
        paddingHorizontal: 28,
        gap: 10,
    },
    whatsappBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    unavailable: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        marginTop: 16,
    },
});

export default SupportScreen;
