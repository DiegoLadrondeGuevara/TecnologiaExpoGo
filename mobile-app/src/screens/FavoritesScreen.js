import React from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Heart, Trash2 } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from 'shared-logic/currency';

const FavoritesScreen = ({ navigation }) => {    const { favorites, toggleFavorite } = useFavorites();
    const { t, currency } = useLanguage();

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() =>
                navigation.navigate('HomeTab', {
                    screen: 'Details',
                    params: { productId: item.id },
                })
            }
        >
            <Image
                source={{ uri: item.image_url || item.imageUrl }}
                style={styles.image}
            />
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                    {item.name || item.nameEn}
                </Text>
                <Text style={styles.price}>
                    {formatPrice(item.price, currency)}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => toggleFavorite(item)}
                hitSlop={10}
            >
                <Trash2 size={16} color={COLORS.danger} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={22} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {t('profile.favorites') || 'Favorites'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {favorites.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <View style={styles.emptyIcon}>
                        <Heart size={40} color={COLORS.textSecondary} />
                    </View>
                    <Text style={styles.emptyTitle}>
                        {t('favorites.empty') || 'No favorites yet'}
                    </Text>
                    <Text style={styles.emptyMsg}>
                        {t('favorites.emptyMessage') ||
                            'Tap the heart icon on any product to save it here.'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
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
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        gap: 12,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: COLORS.white,
    },
    info: {
        flex: 1,
    },
    name: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    price: {
        color: COLORS.black,
        fontSize: 16,
        fontWeight: '800',
        marginTop: 4,
    },
    removeBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(229, 57, 53, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyMsg: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: 'center',
    },
});
export default FavoritesScreen;
