import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    ShoppingCart,
    Plus,
    Minus,
    Package,
    Shield,
    Truck,
    Heart,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { getProductById } from '../api/productService';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { formatPrice } from 'shared-logic/currency';
import ReviewSection from '../components/ReviewSection';

const { width } = Dimensions.get('window');

const DetailsScreen = ({ route, navigation }) => {    const { productId } = route.params;
    const { addToCart } = useCart();
    const { t, currency } = useLanguage();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { addRecentlyViewed } = useRecentlyViewed();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const data = await getProductById(productId);
                setProduct(data);
                // Track this product as recently viewed
                if (data) addRecentlyViewed(data);
            } catch (error) {
                console.error('Error loading product:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [productId]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2500);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={COLORS.black} />
                </View>
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingWrap}>
                    <Text style={styles.errorText}>Product not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const specs = product.specs || {};

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Image Section */}
                <View style={styles.imageSection}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft size={22} color={COLORS.black} />
                    </TouchableOpacity>
                    {product && (
                        <TouchableOpacity
                            style={styles.favBtn}
                            onPress={() => toggleFavorite(product)}
                        >
                            <Heart
                                size={22}
                                color={isFavorite(product.id) ? '#e53935' : COLORS.textSecondary}
                                fill={isFavorite(product.id) ? '#e53935' : 'none'}
                            />
                        </TouchableOpacity>
                    )}
                    <Image
                        source={{ uri: product.image_url }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <View style={styles.categoryPill}>
                            <Text style={styles.categoryText}>{product.category}</Text>
                        </View>
                        {product.stock <= 5 && (
                            <Text style={styles.lowStock}>
                                {t('home.lowStock')} ({product.stock})
                            </Text>
                        )}
                    </View>

                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.price}>{formatPrice(product.price, currency)}</Text>

                    <Text style={styles.description}>{product.description}</Text>

                    {/* Specs */}
                    {Object.keys(specs).length > 0 && (
                        <View style={styles.specsCard}>
                            <Text style={styles.sectionTitle}>{t('details.specifications')}</Text>
                            {Object.entries(specs).map(([key, value]) => (
                                <View key={key} style={styles.specRow}>
                                    <Text style={styles.specKey}>{key}</Text>
                                    <Text style={styles.specValue}>{String(value)}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Features */}
                    <View style={styles.features}>
                        {[
                            { icon: Package, label: t('details.freeReturns') || 'Free Returns' },
                            { icon: Shield, label: t('details.warranty') || '1 Year Warranty' },
                            { icon: Truck, label: t('details.fastShipping') || 'Fast Shipping' },
                        ].map((item, idx) => (
                            <View key={idx} style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <item.icon size={16} color={COLORS.black} />
                                </View>
                                <Text style={styles.featureText}>{item.label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Reviews */}
                    <ReviewSection productId={productId} />
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.quantityControl}>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                        <Minus size={16} color={COLORS.black} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                    >
                        <Plus
                            size={16}
                            color={quantity >= product.stock ? COLORS.textSecondary : COLORS.black}
                        />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={[styles.addToCartBtn, addedToCart && styles.addedBtn]}
                    onPress={handleAddToCart}
                    activeOpacity={0.85}
                    disabled={product.stock === 0}
                >
                    <ShoppingCart size={18} color={COLORS.white} />
                    <Text style={styles.addToCartText}>
                        {addedToCart ? t('details.added') || 'Added!' : t('details.addToCart') || 'Add to Cart'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    imageSection: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    backBtn: {
        position: 'absolute',
        top: 12,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    favBtn: {
        position: 'absolute',
        top: 12,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: '80%',
        height: '80%',
    },
    content: {
        padding: 20,
        paddingBottom: 120,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    categoryPill: {
        backgroundColor: COLORS.black,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    lowStock: {
        color: COLORS.warning,
        fontSize: 12,
        fontWeight: '600',
    },
    name: {
        color: COLORS.textPrimary,
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    price: {
        color: COLORS.black,
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 16,
    },
    description: {
        color: COLORS.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 24,
    },
    specsCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
    },
    specKey: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    specValue: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    features: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    featureItem: {
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingBottom: 34,
        backgroundColor: COLORS.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.border,
        gap: 12,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 12,
        paddingHorizontal: 8,
        height: 48,
        gap: 12,
    },
    qtyBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '700',
        minWidth: 20,
        textAlign: 'center',
    },
    addToCartBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.black,
        borderRadius: 12,
        height: 48,
        gap: 8,
    },
    addedBtn: {
        backgroundColor: COLORS.success,
    },
    addToCartText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});
export default DetailsScreen;
