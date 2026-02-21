import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from 'shared-logic/currency';
import CartItem from '../components/CartItem';
import CustomButton from '../components/CustomButton';
import EmptyState from '../components/EmptyState';

const CartScreen = ({ navigation }) => {
    const {
        cartItems,
        subtotal,
        tax,
        total,
        updateQuantity,
        removeFromCart,
    } = useCart();
    const { t, currency } = useLanguage();

    const handleCheckout = () => {
        navigation.navigate('Payment', { total });
    };

    const handleRemove = (productId) => {
        Alert.alert(t('cart.removeItem'), t('cart.removeConfirm'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('cart.remove'),
                style: 'destructive',
                onPress: () => removeFromCart(productId),
            },
        ]);
    };

    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Text style={styles.screenTitle}>{t('cart.title')}</Text>
                <EmptyState type="cart" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerRow}>
                <Text style={styles.screenTitle}>{t('cart.title')}</Text>
                <Text style={styles.itemCount}>
                    {cartItems.length === 1
                        ? t('cart.item', { count: cartItems.length })
                        : t('cart.items', { count: cartItems.length })}
                </Text>
            </View>

            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <CartItem
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={handleRemove}
                        currency={currency}
                    />
                )}
                ListFooterComponent={() => (
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>{t('cart.orderSummary')}</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
                            <Text style={styles.summaryValue}>
                                {formatPrice(subtotal, currency)}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{t('cart.tax')}</Text>
                            <Text style={styles.summaryValue}>{formatPrice(tax, currency)}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>{t('cart.total')}</Text>
                            <Text style={styles.totalValue}>{formatPrice(total, currency)}</Text>
                        </View>
                    </View>
                )}
            />

            <View style={styles.checkoutBar}>
                <CustomButton
                    title={t('cart.checkout')}
                    onPress={handleCheckout}
                    icon={<CreditCard size={18} color={COLORS.white} />}
                    style={styles.checkoutBtn}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
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
    itemCount: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    summaryCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
        marginTop: 8,
    },
    summaryTitle: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    summaryValue: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.border,
        marginVertical: 10,
    },
    totalLabel: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '800',
    },
    totalValue: {
        color: COLORS.primary,
        fontSize: 22,
        fontWeight: '800',
    },
    checkoutBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 34,
        backgroundColor: COLORS.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.border,
    },
    checkoutBtn: {
        width: '100%',
    },
});

export default CartScreen;
