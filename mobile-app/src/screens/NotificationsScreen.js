import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    Sparkles,
    ShoppingBag,
    TrendingUp,
    ChevronRight,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import apiClient from '../../../shared-logic/apiClient';

const NotificationsScreen = ({ navigation }) => {    const { t, locale, currency, exchangeRate } = useLanguage();
    const { cartItems } = useCart();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecommendations();
    }, []);

    const loadRecommendations = async () => {
        try {
            const products = await apiClient.get('/products');
            const allProducts = Array.isArray(products) ? products : [];

            // Get categories from cart items
            const cartCategoryIds = cartItems
                .map((item) => item.categoryId)
                .filter(Boolean);

            let recommended = [];

            if (cartCategoryIds.length > 0) {
                // Recommend products from same categories as cart items
                const cartProductIds = cartItems.map((i) => i.id);
                recommended = allProducts.filter(
                    (p) =>
                        cartCategoryIds.includes(p.categoryId) &&
                        !cartProductIds.includes(p.id),
                );
            }

            // Fill with popular/random products if not enough
            if (recommended.length < 6) {
                const existingIds = new Set(recommended.map((p) => p.id));
                const cartIds = new Set(cartItems.map((i) => i.id));
                const fillers = allProducts.filter(
                    (p) => !existingIds.has(p.id) && !cartIds.has(p.id),
                );
                recommended = [...recommended, ...fillers].slice(0, 8);
            }

            setRecommendations(recommended);
        } catch (err) {
            console.warn('Could not load recommendations:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (currency === 'PEN') {
            return `S/ ${(price * exchangeRate).toFixed(2)}`;
        }
        return `$${price.toFixed(2)}`;
    };

    const getProductName = (p) => (locale === 'es' ? p.nameEs : p.nameEn);

    const sectionTitle = cartItems.length > 0
        ? (t('notifications.basedOnCart') || 'Based on your cart')
        : (t('notifications.trending') || 'Trending Now');

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
                    {t('profile.notifications') || 'Notifications'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Promo Banner */}
                <View style={styles.promoBanner}>
                    <View style={styles.promoIcon}>
                        <Sparkles size={24} color={COLORS.black} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.promoTitle}>
                            {t('notifications.promoTitle') || 'Deals for You'}
                        </Text>
                        <Text style={styles.promoSubtitle}>
                            {t('notifications.promoSubtitle') ||
                                'Products you might love based on your activity.'}
                        </Text>
                    </View>
                </View>

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionLeft}>
                        {cartItems.length > 0 ? (
                            <ShoppingBag size={16} color={COLORS.black} />
                        ) : (
                            <TrendingUp size={16} color={COLORS.black} />
                        )}
                        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
                    </View>
                    <Text style={styles.sectionCount}>
                        {recommendations.length} {t('common.items') || 'items'}
                    </Text>
                </View>

                {/* Loading */}
                {loading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color={COLORS.black} />
                    </View>
                ) : recommendations.length === 0 ? (
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyText}>
                            {t('notifications.noRecommendations') ||
                                'No recommendations yet. Start browsing!'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.productList}>
                        {recommendations.map((product, idx) => (
                            <TouchableOpacity
                                key={product.id}
                                style={[
                                    styles.productCard,
                                    idx < recommendations.length - 1 &&
                                    styles.productCardBorder,
                                ]}
                                activeOpacity={0.7}
                                onPress={() =>
                                    navigation.navigate('HomeTab', {
                                        screen: 'Details',
                                        params: { product },
                                    })
                                }
                            >
                                <Image
                                    source={{ uri: product.imageUrl }}
                                    style={styles.productImage}
                                />
                                <View style={styles.productInfo}>
                                    <Text
                                        style={styles.productName}
                                        numberOfLines={2}
                                    >
                                        {getProductName(product)}
                                    </Text>
                                    <Text style={styles.productPrice}>
                                        {formatPrice(product.price)}
                                    </Text>
                                    {product.stock <= 5 && product.stock > 0 && (
                                        <Text style={styles.lowStock}>
                                            {t('notifications.fewLeft') ||
                                                `Only ${product.stock} left!`}
                                        </Text>
                                    )}
                                </View>
                                <ChevronRight
                                    size={18}
                                    color={COLORS.textSecondary}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
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
    scrollContent: {
        padding: 16,
        gap: 16,
    },
    promoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        gap: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    promoIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    promoTitle: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    promoSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    sectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    sectionCount: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '500',
    },
    loadingWrap: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyWrap: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    productList: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        overflow: 'hidden',
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    productCardBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
    },
    productImage: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: COLORS.white,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    productPrice: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '800',
        marginTop: 4,
    },
    lowStock: {
        color: '#e53935',
        fontSize: 11,
        fontWeight: '700',
        marginTop: 2,
    },
});
export default NotificationsScreen;
