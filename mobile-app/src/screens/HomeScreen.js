import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { getProducts, getCategories } from '../api/productService';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import CategorySelector from '../components/CategorySelector';
import EmptyState from '../components/EmptyState';

const HomeScreen = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { t, currency } = useLanguage();

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

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        let results = products;

        if (activeCategory !== 'All') {
            results = results.filter((p) => p.category === activeCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            results = results.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query)
            );
        }

        setFilteredProducts(results);
    }, [activeCategory, searchQuery, products]);

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

    const renderHeader = () => (
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
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('home.loadingProducts')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}
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
                    renderItem={({ item }) => (
                        <ProductCard product={item} onPress={handleProductPress} currency={currency} />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                        />
                    }
                />
            )}
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
    },
    badgeText: {
        color: COLORS.primary,
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
});

export default HomeScreen;
