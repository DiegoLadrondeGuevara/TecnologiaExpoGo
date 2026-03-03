import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    BackHandler,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ChevronLeft, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { createPaymentPreference, confirmPayment, cancelOrder } from '../api/paymentService';

const PaymentScreen = ({ route, navigation }) => {    const { orderId } = route.params || {};
    const { clearCart } = useCart();
    const { t } = useLanguage();
    const { showNotification } = useNotification();
    const [initPoint, setInitPoint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentResult, setPaymentResult] = useState(null);
    const processedRef = useRef(false);
    const cancelledRef = useRef(false);

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

    /**
     * Cancel the pending order when user exits without completing payment.
     */
    const handleCancelAndGoBack = useCallback(async () => {
        if (cancelledRef.current || processedRef.current) {
            navigation.goBack();
            return;
        }
        cancelledRef.current = true;

        try {
            await cancelOrder(orderId);
            console.log('🗑️ Pending order cancelled:', orderId);
        } catch (err) {
            console.warn('Could not cancel order:', err.message);
        }
        navigation.goBack();
    }, [orderId, navigation]);

    // Handle Android hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (!paymentResult) {
                handleCancelAndGoBack();
                return true;
            }
            return false;
        });
        return () => backHandler.remove();
    }, [paymentResult, handleCancelAndGoBack]);

    const getParam = (url, name) => {
        const match = url.match(new RegExp('[?&]' + name + '=([^&]+)'));
        return match ? decodeURIComponent(match[1]) : null;
    };

    const processPaymentUrl = async (url) => {
        if (processedRef.current) return;
        processedRef.current = true;

        const collectionStatus = getParam(url, 'collection_status');
        const status = getParam(url, 'status');
        const paymentId = getParam(url, 'payment_id');
        const externalRef = getParam(url, 'external_reference');
        const effectiveStatus = collectionStatus || status;

        console.log('📦 Processing payment result:', effectiveStatus, 'paymentId:', paymentId);

        if (effectiveStatus === 'approved') {
            setPaymentResult('success');
            clearCart();
            showNotification({
                title: '✅ ' + (t('payment.success') || 'Payment Successful'),
                message: t('payment.successMessage') || 'Your order has been confirmed!',
                type: 'success',
                duration: 5000,
            });
            // Confirm with backend → marks order as paid + decrements stock
            try {
                await confirmPayment(externalRef || orderId, paymentId || 'unknown', 'approved');
                console.log('✅ Payment confirmed with backend');
            } catch (err) {
                console.warn('Could not confirm with backend:', err.message);
            }
        } else if (effectiveStatus === 'rejected' || url.includes('/failure')) {
            setPaymentResult('failure');
            // Cancel the failed order
            try {
                await cancelOrder(orderId);
            } catch (err) {
                console.warn('Could not cancel failed order:', err.message);
            }
        } else if (effectiveStatus === 'in_process' || effectiveStatus === 'pending') {
            setPaymentResult('pending');
            // Keep the order as pending — MP is genuinely processing
        } else {
            // Determine by URL path
            if (url.includes('/success')) {
                setPaymentResult('success');
                clearCart();
            } else if (url.includes('/failure')) {
                setPaymentResult('failure');
                try { await cancelOrder(orderId); } catch (_) { }
            } else if (url.includes('/pending')) {
                setPaymentResult('pending');
            }
        }
    };

    const handleShouldStartLoad = (request) => {
        const { url } = request;

        if (url.includes('techstore.app/payment/')) {
            processPaymentUrl(url);
            return false;
        }

        if (url.startsWith('techstore://')) {
            processPaymentUrl(url);
            return false;
        }

        if (url.includes('collection_status=') && !url.includes('mercadopago.com')) {
            processPaymentUrl(url);
            return false;
        }

        return true;
    };

    const handleNavigationStateChange = (navState) => {
        const { url } = navState;
        if (url.includes('techstore.app/payment/') || url.includes('techstore://')) {
            processPaymentUrl(url);
        }
    };

    // ─── Payment Result Screen ─────────────────────────────────────
    if (paymentResult) {
        const configs = {
            success: {
                icon: <CheckCircle size={64} color={COLORS.success} />,
                title: t('payment.success') || 'Payment Successful',
                message: t('payment.successMessage') || 'Your order has been confirmed!',
                buttonText: t('payment.returnHome') || 'Return Home',
                buttonAction: () => navigation.navigate('HomeTab'),
                color: COLORS.success,
            },
            failure: {
                icon: <XCircle size={64} color={COLORS.danger} />,
                title: t('payment.failure') || 'Payment Failed',
                message: t('payment.failureMessage') || 'Something went wrong. Please try again.',
                buttonText: t('payment.tryAgain') || 'Try Again',
                buttonAction: () => navigation.goBack(),
                color: COLORS.danger,
            },
            pending: {
                icon: <Clock size={64} color={COLORS.warning} />,
                title: t('payment.pending') || 'Payment Pending',
                message: t('payment.pendingMessage') || 'Your payment is being processed.',
                buttonText: t('payment.returnHome') || 'Return Home',
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

    // ─── Loading ───────────────────────────────────────────────────
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.black} />
                    <Text style={styles.loadingText}>{t('payment.processing') || 'Processing...'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ─── WebView ───────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={handleCancelAndGoBack}
                >
                    <ChevronLeft size={22} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('payment.title') || 'Payment'}</Text>
                <View style={{ width: 40 }} />
            </View>
            <WebView
                source={{ uri: initPoint }}
                style={styles.webview}
                originWhitelist={['https://*', 'http://*', 'techstore://*']}
                onShouldStartLoadWithRequest={handleShouldStartLoad}
                onNavigationStateChange={handleNavigationStateChange}
                startInLoadingState
                renderLoading={() => (
                    <View style={styles.webviewLoading}>
                        <ActivityIndicator size="large" color={COLORS.black} />
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
