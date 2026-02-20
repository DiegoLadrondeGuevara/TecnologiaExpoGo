import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShoppingBag, Search } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

const EmptyState = ({ type = 'cart', message }) => {
    const icon =
        type === 'cart' ? (
            <ShoppingBag size={64} color={COLORS.textSecondary} strokeWidth={1} />
        ) : (
            <Search size={64} color={COLORS.textSecondary} strokeWidth={1} />
        );

    const defaultMessage =
        type === 'cart'
            ? 'Your cart is empty'
            : 'No products found';

    const subtitle =
        type === 'cart'
            ? 'Add some products to get started!'
            : 'Try a different search term or category';

    return (
        <View style={styles.container}>
            {icon}
            <Text style={styles.message}>{message || defaultMessage}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 12,
    },
    message: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default EmptyState;
