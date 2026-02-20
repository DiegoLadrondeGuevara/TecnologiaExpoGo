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
import CartItem from '../components/CartItem';
import CustomButton from '../components/CustomButton';
import EmptyState from '../components/EmptyState';

const CartScreen = () => {
    const {
        cartItems,
        subtotal,
        tax,
        total,
        updateQuantity,
        removeFromCart,
        clearCart,
    } = useCart();

    const handleCheckout = () => {
        Alert.alert(
            'Checkout 🎉',
            `Your order of $${total.toFixed(2)} has been placed successfully!\n\nThank you for shopping with us.`,
            [
                {
                    text: 'OK',
                    onPress: () => clearCart(),
                },
            ]
        );
    };

    const handleRemove = (productId) => {
        Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => removeFromCart(productId),
            },
        ]);
    };

    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Text style={styles.screenTitle}>Shopping Cart</Text>
                <EmptyState type="cart" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerRow}>
                <Text style={styles.screenTitle}>Shopping Cart</Text>
                <Text style={styles.itemCount}>
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
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
                    />
                )}
                ListFooterComponent={() => (
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Order Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>
                                ${subtotal.toFixed(2)}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>IVA (16%)</Text>
                            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                        </View>
                    </View>
                )}
            />

            <View style={styles.checkoutBar}>
                <CustomButton
                    title="Checkout"
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
