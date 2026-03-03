import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    MapPin,
    Navigation,
    ChevronLeft,
    Truck,
    Tag,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { COLORS } from '../theme/colors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { createOrder } from '../api/paymentService';
import apiClient from '../../../shared-logic/apiClient';

/**
 * ShippingAddressScreen
 *
 * Two modes:
 * - "checkout" (default): from cart flow → creates order + goes to payment
 * - "settings": from Settings → just saves address to user profile and goes back
 *
 * Pass route.params.mode = 'settings' to use settings mode.
 */
const ShippingAddressScreen = ({ navigation, route }) => {    const mode = route?.params?.mode || 'checkout';
    const { cartItems } = useCart();
    const { user, setUser } = useAuth();
    const { t, currency, exchangeRate } = useLanguage();

    // Parse saved address (stored as JSON: { label, address })
    const savedAddress = React.useMemo(() => {
        if (!user?.address) return null;
        try {
            return JSON.parse(user.address);
        } catch {
            return { label: '', address: user.address };
        }
    }, [user?.address]);

    const [label, setLabel] = useState(savedAddress?.label || '');
    const [address, setAddress] = useState(savedAddress?.address || '');
    const [locating, setLocating] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Reload if user data changes (e.g. coming back from another screen)
    useEffect(() => {
        if (savedAddress) {
            setLabel(savedAddress.label || '');
            setAddress(savedAddress.address || '');
        }
    }, [savedAddress?.label, savedAddress?.address]);

    const handleUseMyLocation = useCallback(async () => {
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    t('address.permissionDenied') || 'Permission Denied',
                    t('address.permissionMessage') || 'Please enable location permissions in your device settings.',
                );
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const [reverseGeo] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (reverseGeo) {
                const parts = [
                    reverseGeo.street,
                    reverseGeo.streetNumber,
                    reverseGeo.district,
                    reverseGeo.city,
                    reverseGeo.region,
                    reverseGeo.postalCode,
                    reverseGeo.country,
                ].filter(Boolean);
                setAddress(parts.join(', '));
            }
        } catch (error) {
            console.error('Location error:', error);
            Alert.alert(
                'Error',
                t('address.locationError') || 'Could not get your location. Please enter the address manually.',
            );
        } finally {
            setLocating(false);
        }
    }, [t]);

    /**
     * Save address to user profile (used in both modes)
     */
    const saveAddressToProfile = async () => {
        const addressData = JSON.stringify({
            label: label.trim() || 'Home',
            address: address.trim(),
        });

        try {
            const res = await apiClient.patch('/users/me', { address: addressData });
            if (setUser) setUser(res);
        } catch (err) {
            console.warn('Could not save address to profile:', err.message);
        }
    };

    const handleContinue = useCallback(async () => {
        if (!address.trim()) {
            Alert.alert(
                t('address.required') || 'Address Required',
                t('address.requiredMessage') || 'Please enter a shipping address to continue.',
            );
            return;
        }

        setSubmitting(true);
        try {
            // Save to user profile
            await saveAddressToProfile();

            if (mode === 'settings') {
                // Settings mode — just save and go back
                Alert.alert('✓', t('settings.saved') || 'Address saved successfully');
                navigation.goBack();
            } else {
                // Checkout mode — create order and go to payment
                const fullAddress = label.trim()
                    ? `[${label.trim()}] ${address.trim()}`
                    : address.trim();

                const order = await createOrder(
                    cartItems,
                    currency,
                    currency === 'PEN' ? exchangeRate : 1,
                    fullAddress,
                );

                navigation.replace('Payment', { orderId: order.id });
            }
        } catch (error) {
            Alert.alert(
                'Error',
                error.message || 'Something went wrong. Please try again.',
            );
        } finally {
            setSubmitting(false);
        }
    }, [address, label, cartItems, currency, exchangeRate, navigation, mode, t]);

    const isSettingsMode = mode === 'settings';
    const buttonText = isSettingsMode
        ? (t('settings.save') || 'Save Address')
        : (t('address.continue') || 'Continue to Payment');

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft size={22} color={COLORS.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {t('address.title') || 'Shipping Address'}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Illustration */}
                    <View style={styles.iconContainer}>
                        <Truck size={48} color={COLORS.black} />
                    </View>

                    <Text style={styles.title}>
                        {isSettingsMode
                            ? (t('address.editTitle') || 'Edit your shipping address')
                            : (t('address.whereToShip') || '¿Where should we deliver your order?')}
                    </Text>
                    <Text style={styles.subtitle}>
                        {t('address.subtitle') || 'Enter your shipping address or use GPS to auto-fill.'}
                    </Text>

                    {/* Address Label Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            {t('address.labelName') || 'Address Label'}
                        </Text>
                        <View style={styles.labelInputWrapper}>
                            <Tag size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('address.labelPlaceholder') || 'e.g. Casa, Oficina, Trabajo...'}
                                placeholderTextColor={COLORS.textSecondary}
                                value={label}
                                onChangeText={setLabel}
                                autoCapitalize="words"
                                editable={!submitting}
                                maxLength={30}
                            />
                        </View>
                        <Text style={styles.labelHint}>
                            {t('address.labelHint') || 'Give your address a name so you remember it easily'}
                        </Text>
                    </View>

                    {/* GPS Button */}
                    <TouchableOpacity
                        style={styles.gpsButton}
                        onPress={handleUseMyLocation}
                        disabled={locating}
                        activeOpacity={0.7}
                    >
                        {locating ? (
                            <ActivityIndicator size="small" color={COLORS.black} />
                        ) : (
                            <Navigation size={18} color={COLORS.black} />
                        )}
                        <Text style={styles.gpsButtonText}>
                            {locating
                                ? (t('address.locating') || 'Getting your location...')
                                : (t('address.useMyLocation') || 'Use my current location')}
                        </Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>
                            {t('address.orEnterManually') || 'or enter manually'}
                        </Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Address Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            {t('address.label') || 'Full Address'}
                        </Text>
                        <View style={styles.inputWrapper}>
                            <MapPin size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('address.placeholder') || 'Street, number, city, zip code...'}
                                placeholderTextColor={COLORS.textSecondary}
                                value={address}
                                onChangeText={setAddress}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                editable={!submitting}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Continue / Save Button */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={[styles.continueBtn, (!address.trim() || submitting) && styles.continueBtnDisabled]}
                        onPress={handleContinue}
                        disabled={!address.trim() || submitting}
                        activeOpacity={0.8}
                    >
                        {submitting ? (
                            <ActivityIndicator color={COLORS.white} size="small" />
                        ) : (
                            <Text style={styles.continueBtnText}>{buttonText}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flex: {
        flex: 1,
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
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 120,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -0.3,
        marginBottom: 8,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    inputGroup: {
        gap: 8,
        marginBottom: 16,
    },
    label: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    labelInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 14,
        height: 52,
    },
    labelHint: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
        fontStyle: 'italic',
    },
    gpsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 20,
    },
    gpsButtonText: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 14,
        paddingVertical: 14,
        minHeight: 100,
    },
    inputIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    input: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 22,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingVertical: 16,
        paddingBottom: 34,
        backgroundColor: COLORS.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.border,
    },
    continueBtn: {
        backgroundColor: COLORS.black,
        borderRadius: 14,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    continueBtnDisabled: {
        opacity: 0.5,
    },
    continueBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});
export default ShippingAddressScreen;
