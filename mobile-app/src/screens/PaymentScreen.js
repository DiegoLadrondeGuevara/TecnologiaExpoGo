import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ChevronLeft, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { createPaymentPreference, MP_CALLBACK_URLS } from '../api/paymentService';

const PaymentScreen = ({ route, navigation }) => {
    const { orderId } = route.params || {};
    const { clearCart } = useCart();
    const { t } = useLanguage();
    const [initPoint, setInitPoint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentResult, setPaymentResult] = useState(null); // 'success' | 'failure' | 'pending'

    useEffect(() => {
        const initPayment = async () => {
            try {
                if (!orderId) {
                    setPaymentResult('failure');
                    return;
                }
                const preference = await createPaymentPreference(orderId);
                setInitPoint(preference.sandbox_init_point || preference.init_point);
            } catch (error) {
                console.error('Error creating payment preference:', error);
                setPaymentResult('failure');
            } finally {
                setLoading(false);
            }
        };
        initPayment();
    }, [orderId]);

    const handleNavigationStateChange = (navState) => {
        const { url } = navState;

        if (url.includes(MP_CALLBACK_URLS.success) || url.includes('status=approved')) {
            setPaymentResult('success');
            clearCart();
        } else if (url.includes(MP_CALLBACK_URLS.failure) || url.includes('status=rejected')) {
            setPaymentResult('failure');
        } else if (url.includes(MP_CALLBACK_URLS.pending) || url.includes('status=in_process')) {
            setPaymentResult('pending');
        }
    };

    // Payment Result Screen
    if (paymentResult) {
        const configs = {
            success: {
                icon: <CheckCircle size={64} color={COLORS.success} />,
                title: t('payment.success'),
                message: t('payment.successMessage'),
                buttonText: t('payment.returnHome'),
                buttonAction: () => navigation.navigate('HomeTab'),
                color: COLORS.success,
            },
            failure: {
                icon: <XCircle size={64} color={COLORS.danger} />,
                title: t('payment.failure'),
                message: t('payment.failureMessage'),
                buttonText: t('payment.tryAgain'),
                buttonAction: () => navigation.goBack(),
                color: COLORS.danger,
            },
            pending: {
                icon: <Clock size={64} color={COLORS.warning} />,
                title: t('payment.pending'),
                message: t('payment.pendingMessage'),
                buttonText: t('payment.returnHome'),
                buttonAction: () => navigation.navigate('HomeTab'),
                color: COLORS.warning,
            },
        };

        const config = configs[paymentResult];

        return (
            <SafeAreaView style={styles.resultContainer}>
                <View style={styles.resultContent}>
                    {config.icon}
                    <Text style={styles.resultTitle}>{config.title}</Text>
                    <Text style={styles.resultMessage}>{config.message}</Text>
                    <TouchableOpacity
                        style={[styles.resultButton, { backgroundColor: config.color }]}
                        onPress={config.buttonAction}
                    >
                        <Text style={styles.resultButtonText}>{config.buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Loading
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('payment.processing')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    // WebView for Mercado Pago
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={22} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('payment.title')}</Text>
                <View style={{ width: 40 }} />
            </View>
            <WebView
                source={{ uri: initPoint }}
                style={styles.webview}
                onNavigationStateChange={handleNavigationStateChange}
                startInLoadingState
                renderLoading={() => (
                    <View style={styles.webviewLoading}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                )}
            />
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
    webview: {
        flex: 1,
    },
    webviewLoading: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    loadingText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontWeight: '500',
    },
    resultContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    resultContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 16,
    },
    resultTitle: {
        color: COLORS.textPrimary,
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        marginTop: 8,
    },
    resultMessage: {
        color: COLORS.textSecondary,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
    resultButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginTop: 16,
    },
    resultButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default PaymentScreen;
