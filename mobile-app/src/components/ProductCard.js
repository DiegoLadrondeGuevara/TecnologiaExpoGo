import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Heart } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { formatPrice } from 'shared-logic/currency';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ProductCard = ({ product, onPress, currency: currencyProp }) => {    const { t, currency: contextCurrency } = useLanguage();
    const { toggleFavorite, isFavorite } = useFavorites();
    const activeCurrency = currencyProp || contextCurrency;
    const faved = isFavorite(product.id);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(product)}
            activeOpacity={0.85}
        >
            {/* 1:1 Image Container */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: product.image_url }}
                    style={styles.image}
                    resizeMode="contain"
                />
                {/* Bottom gradient for depth */}
                <View style={styles.imageGradient} />
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{product.category}</Text>
                </View>
                <TouchableOpacity
                    style={styles.favBadge}
                    onPress={(e) => { e.stopPropagation?.(); toggleFavorite(product); }}
                    hitSlop={8}
                >
                    <Heart
                        size={14}
                        color={faved ? '#e53935' : COLORS.textSecondary}
                        fill={faved ? '#e53935' : 'none'}
                    />
                </TouchableOpacity>
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
        // Subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    image: {
        width: '80%',
        height: '80%',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: 'transparent',
        // Subtle bottom shadow effect
        borderBottomWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
    },
    categoryBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: COLORS.black,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    categoryText: {
        color: COLORS.white,
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    favBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
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
        color: COLORS.black,
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
