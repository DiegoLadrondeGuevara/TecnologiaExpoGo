import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { Minus, Plus, ShoppingCart, ChevronLeft, Package } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { getProductById } from '../api/productService';
import { useCart } from '../context/CartContext';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');

const DetailsScreen = ({ route, navigation }) => {
    const { productId } = route.params;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductById(productId);
                setProduct(data);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            Alert.alert(
                'Added to Cart ✓',
                `${quantity}x ${product.name} added to your cart`,
                [
                    { text: 'Continue Shopping', style: 'cancel' },
                    {
                        text: 'Go to Cart',
                        onPress: () => navigation.navigate('CartTab'),
                    },
                ]
            );
        }
    };

    const incrementQty = () => {
        if (product && quantity < product.stock) {
            setQuantity((q) => q + 1);
        }
    };

    const decrementQty = () => {
        if (quantity > 1) {
            setQuantity((q) => q - 1);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>Product not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: product.image_url }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <SafeAreaView style={styles.backBtnContainer} edges={['top']}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <ChevronLeft size={22} color={COLORS.white} />
                        </TouchableOpacity>
                    </SafeAreaView>
                    <View style={styles.heroOverlay} />
                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>{product.category}</Text>
                    </View>
                </View>

                {/* Product Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>
                        ${product.price.toLocaleString()}
                    </Text>
                    <View style={styles.stockRow}>
                        <Package size={14} color={COLORS.success} />
                        <Text style={styles.stockText}>
                            {product.stock} units in stock
                        </Text>
                    </View>
                    <Text style={styles.description}>{product.description}</Text>

                    {/* Specs */}
                    {product.specs && product.specs.length > 0 && (
                        <View style={styles.specsSection}>
                            <Text style={styles.specsTitle}>Specifications</Text>
                            {product.specs.map((spec, index) => (
                                <View key={index} style={styles.specRow}>
                                    <View style={styles.specDot} />
                                    <Text style={styles.specText}>{spec}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Quantity Selector */}
                    <View style={styles.quantitySection}>
                        <Text style={styles.quantityLabel}>Quantity</Text>
                        <View style={styles.quantityControls}>
                            <TouchableOpacity
                                style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                                onPress={decrementQty}
                                disabled={quantity <= 1}
                            >
                                <Minus
                                    size={18}
                                    color={quantity <= 1 ? COLORS.textSecondary : COLORS.white}
                                />
                            </TouchableOpacity>
                            <Text style={styles.quantityValue}>{quantity}</Text>
                            <TouchableOpacity
                                style={[
                                    styles.qtyBtn,
                                    quantity >= product.stock && styles.qtyBtnDisabled,
                                ]}
                                onPress={incrementQty}
                                disabled={quantity >= product.stock}
                            >
                                <Plus
                                    size={18}
                                    color={
                                        quantity >= product.stock
                                            ? COLORS.textSecondary
                                            : COLORS.white
                                    }
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Floating Add to Cart */}
            <View style={styles.floatingBar}>
                <View style={styles.floatingPrice}>
                    <Text style={styles.floatingLabel}>Total</Text>
                    <Text style={styles.floatingTotal}>
                        ${(product.price * quantity).toLocaleString()}
                    </Text>
                </View>
                <CustomButton
                    title="Add to Cart"
                    onPress={handleAddToCart}
                    icon={<ShoppingCart size={18} color={COLORS.white} />}
                    style={styles.addButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    heroContainer: {
        width: width,
        height: width * 0.85,
        backgroundColor: COLORS.cardLight,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    backBtnContainer: {
        position: 'absolute',
        top: 0,
        left: 16,
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    categoryTag: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
        zIndex: 10,
    },
    categoryTagText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
    },
    infoSection: {
        padding: 20,
        paddingBottom: 120,
    },
    productName: {
        color: COLORS.textPrimary,
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    productPrice: {
        color: COLORS.primary,
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    stockText: {
        color: COLORS.success,
        fontSize: 13,
        fontWeight: '600',
    },
    description: {
        color: COLORS.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 24,
    },
    specsSection: {
        marginBottom: 24,
    },
    specsTitle: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    specRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
        gap: 10,
    },
    specDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
    },
    specText: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '500',
    },
    quantitySection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 16,
    },
    quantityLabel: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    qtyBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.cardLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyBtnDisabled: {
        opacity: 0.5,
    },
    quantityValue: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '800',
        minWidth: 24,
        textAlign: 'center',
    },
    floatingBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 34,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.border,
    },
    floatingPrice: {
        gap: 2,
    },
    floatingLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    floatingTotal: {
        color: COLORS.textPrimary,
        fontSize: 22,
        fontWeight: '800',
    },
    addButton: {
        paddingHorizontal: 28,
    },
});

export default DetailsScreen;
