import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    Modal,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Clock, SlidersHorizontal, Check, X } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { getProducts, getCategories } from '../api/productService';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { formatPrice } from 'shared-logic/currency';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import CategorySelector from '../components/CategorySelector';
import EmptyState from '../components/EmptyState';

const { width } = Dimensions.get('window');
const RECENT_CARD_W = 120;

const HomeScreen = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [showSortModal, setShowSortModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { t, currency } = useLanguage();
    const { user, justLoggedIn, setJustLoggedIn } = useAuth();
    const { showNotification } = useNotification();
    const { recentItems, clearRecentlyViewed } = useRecentlyViewed();

    // ─── Sort options ───
    const sortOptions = [
        { key: 'default', label: t('home.sortDefault') || 'Default' },
        { key: 'price_asc', label: t('home.sortPriceLow') || 'Price: Low to High' },
        { key: 'price_desc', label: t('home.sortPriceHigh') || 'Price: High to Low' },
        { key: 'name_asc', label: t('home.sortAZ') || 'Name: A → Z' },
        { key: 'name_desc', label: t('home.sortZA') || 'Name: Z → A' },
        { key: 'top_rated', label: t('home.sortTopRated') || 'Top Rated' },
    ];

    const currentSortLabel = sortOptions.find((s) => s.key === sortBy)?.label || 'Sort';

    // ─── Welcome notification on login ───
    useEffect(() => {
        if (justLoggedIn && user) {
            showNotification({
                title: `👋 ${t('notification.welcome') || 'Welcome back!'}`,
                message: user.name
                    ? `${t('notification.welcomeMessage') || 'Great to see you'}, ${user.name}`
                    : t('notification.welcomeMessage') || 'Great to see you!',
                type: 'success',
                duration: 4000,
            });
            setJustLoggedIn(false);
        }
    }, [justLoggedIn]);

    const fetchData = useCallback(async () => {
        try {
            const [productData, categoryData] = await Promise.all([
                getProducts(),
                getCategories(),
            ]);
            setProducts(productData);
            setFilteredProducts(productData);
            setCategories(categoryData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    // Filter + sort
    useEffect(() => {
        let results = products;

        if (activeCategory !== 'All') {
            results = results.filter((p) => p.category === activeCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            results = results.filter(
                (p) =>
                    (p.name || '').toLowerCase().includes(q) ||
                    (p.category || '').toLowerCase().includes(q),
            );
        }

        // Apply sort
        const sorted = [...results];
        switch (sortBy) {
            case 'price_asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'name_asc':
                sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'name_desc':
                sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
            case 'top_rated':
                sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                break;
            default:
                break;
        }

        setFilteredProducts(sorted);
    }, [activeCategory, searchQuery, products, sortBy]);

    const handleCategorySelect = (category) => {
        setActiveCategory(category);
    };

    const handleProductPress = (product) => {
        navigation.navigate('Details', { productId: product.id });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('home.greeting_morning');
        if (hour < 18) return t('home.greeting_afternoon');
        return t('home.greeting_evening');
    };

    // ─── Recently Viewed Section ───
    const renderRecentlyViewed = () => {
        if (!recentItems || recentItems.length === 0) return null;
        return (
            <View style={styles.recentSection}>
                <View style={styles.recentHeader}>
                    <View style={styles.recentHeaderLeft}>
                        <Clock size={14} color={COLORS.textSecondary} />
                        <Text style={styles.recentTitle}>
                            {t('home.recentlyViewed') || 'Recently Viewed'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.clearBtn}
                        onPress={clearRecentlyViewed}
                        activeOpacity={0.7}
                    >
                        <X size={14} color={COLORS.textSecondary} />
                        <Text style={styles.clearBtnText}>
                            {t('home.clearRecent') || 'Clear'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recentList}
                >
                    {recentItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.recentCard}
                            onPress={() => handleProductPress(item)}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={{ uri: item.image_url || item.imageUrl }}
                                style={styles.recentImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.recentName} numberOfLines={1}>
                                {item.name || item.nameEn}
                            </Text>
                            <Text style={styles.recentPrice}>
                                {formatPrice(item.price, currency)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    // ─── Sort Dropdown Modal ───
    const renderSortModal = () => (
        <Modal
            visible={showSortModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowSortModal(false)}
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowSortModal(false)}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        {t('home.sortBy') || 'Sort by'}
                    </Text>
                    {sortOptions.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                styles.modalOption,
                                sortBy === option.key && styles.modalOptionActive,
                            ]}
                            onPress={() => {
                                setSortBy(option.key);
                                setShowSortModal(false);
                            }}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.modalOptionText,
                                    sortBy === option.key && styles.modalOptionTextActive,
                                ]}
                            >
                                {option.label}
                            </Text>
                            {sortBy === option.key && (
                                <Check size={18} color={COLORS.white} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </Pressable>
        </Modal>
    );

    // ─── List Header (scrolls with products) ───
    const renderListHeader = () => (
        <>
            {/* Recently Viewed */}
            {renderRecentlyViewed()}

            {/* Sort Button */}
            <View style={styles.sortBar}>
                <TouchableOpacity
                    style={[
                        styles.sortButton,
                        sortBy !== 'default' && styles.sortButtonActive,
                    ]}
                    onPress={() => setShowSortModal(true)}
                    activeOpacity={0.7}
                >
                    <SlidersHorizontal size={16} color={sortBy !== 'default' ? COLORS.white : COLORS.textPrimary} />
                    <Text style={[
                        styles.sortButtonText,
                        sortBy !== 'default' && styles.sortButtonTextActive,
                    ]}>
                        {currentSortLabel}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.black} />
                    <Text style={styles.loadingText}>{t('home.loadingProducts')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Fixed header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{getGreeting()}</Text>
                    <Text style={styles.title}>{t('home.exploreTitle')}</Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{products.length}</Text>
                    <Text style={styles.badgeLabel}>{t('home.products')}</Text>
                </View>
            </View>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
            <CategorySelector
                categories={categories}
                activeCategory={activeCategory}
                onSelect={handleCategorySelect}
            />

            {filteredProducts.length === 0 ? (
                <EmptyState type="search" />
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={renderListHeader}
                    renderItem={({ item }) => (
                        <ProductCard product={item} onPress={handleProductPress} currency={currency} />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.black}
                        />
                    }
                />
            )}

            {/* Sort Modal */}
            {renderSortModal()}
        </SafeAreaView>
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
        gap: 16,
    },
    loadingText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
    },
    greeting: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    badge: {
        backgroundColor: COLORS.card,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    badgeText: {
        color: COLORS.black,
        fontSize: 18,
        fontWeight: '800',
    },
    badgeLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: '600',
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    list: {
        paddingBottom: 100,
    },
    // ─── Sort Button ─────────────────────────────
    sortBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 14,
        paddingTop: 4,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sortButtonActive: {
        backgroundColor: COLORS.black,
        borderColor: COLORS.black,
    },
    sortButtonText: {
        color: COLORS.textPrimary,
        fontSize: 13,
        fontWeight: '600',
    },
    sortButtonTextActive: {
        color: COLORS.white,
    },
    // ─── Sort Modal ──────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 4,
    },
    modalOptionActive: {
        backgroundColor: COLORS.black,
    },
    modalOptionText: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    modalOptionTextActive: {
        color: COLORS.white,
    },
    // ─── Recently Viewed ─────────────────────────
    recentSection: {
        paddingTop: 4,
        paddingBottom: 16,
    },
    recentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    recentHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    recentTitle: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '700',
    },
    clearBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: COLORS.card,
    },
    clearBtnText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    recentList: {
        paddingHorizontal: 16,
        gap: 10,
    },
    recentCard: {
        width: RECENT_CARD_W,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        overflow: 'hidden',
    },
    recentImage: {
        width: RECENT_CARD_W,
        height: RECENT_CARD_W,
        backgroundColor: COLORS.white,
    },
    recentName: {
        color: COLORS.textPrimary,
        fontSize: 11,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingTop: 6,
    },
    recentPrice: {
        color: COLORS.black,
        fontSize: 13,
        fontWeight: '800',
        paddingHorizontal: 8,
        paddingBottom: 8,
        paddingTop: 2,
    },
});
export default HomeScreen;
