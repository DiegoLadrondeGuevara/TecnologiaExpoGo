import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { formatPrice } from 'shared-logic/currency';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ProductCard = ({ product, onPress, currency: currencyProp }) => {
    const { t, currency: contextCurrency } = useLanguage();
    const activeCurrency = currencyProp || contextCurrency;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(product)}
            activeOpacity={0.8}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: product.image_url }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{product.category}</Text>
                </View>
            </View>
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>{formatPrice(product.price, activeCurrency)}</Text>
                    {product.stock <= 5 && (
                        <Text style={styles.lowStock}>{t('home.lowStock')}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.card,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: CARD_WIDTH * 0.85,
        backgroundColor: COLORS.cardLight,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    categoryBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    categoryText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    info: {
        padding: 12,
    },
    name: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        lineHeight: 18,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '800',
    },
    lowStock: {
        color: COLORS.warning,
        fontSize: 10,
        fontWeight: '600',
    },
});

export default ProductCard;
