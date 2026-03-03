import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    FlatList,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ShoppingBag,
    Zap,
    Shield,
    ChevronRight,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = 'techstore_onboarding_done';

const slides = [
    {
        id: '1',
        icon: ShoppingBag,
        title: 'Welcome to TechStore',
        titleEs: 'Bienvenido a TechStore',
        subtitle: 'Discover the latest tech products at the best prices.',
        subtitleEs: 'Descubre los últimos productos tecnológicos al mejor precio.',
        color: '#000',
    },
    {
        id: '2',
        icon: Zap,
        title: 'Fast & Easy Shopping',
        titleEs: 'Compras Rápidas y Fáciles',
        subtitle: 'Add to cart, pay with MercadoPago, and get it delivered.',
        subtitleEs: 'Agrega al carrito, paga con MercadoPago y recibe en casa.',
        color: '#000',
    },
    {
        id: '3',
        icon: Shield,
        title: 'Secure & Reliable',
        titleEs: 'Seguro y Confiable',
        subtitle: 'Your data is safe with us. Shop with confidence.',
        subtitleEs: 'Tus datos están seguros. Compra con confianza.',
        color: '#000',
    },
];

const OnboardingScreen = ({ onFinish }) => {    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            completeOnboarding();
        }
    };

    const handleSkip = () => {
        completeOnboarding();
    };

    const completeOnboarding = async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        onFinish();
    };

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    const renderSlide = ({ item }) => {
        const Icon = item.icon;
        return (
            <View style={[styles.slide, { width }]}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Icon size={48} color={COLORS.white} />
                    </View>
                    {/* Decorative rings */}
                    <View style={[styles.ring, styles.ring1]} />
                    <View style={[styles.ring, styles.ring2]} />
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
        );
    };

    const isLast = currentIndex === slides.length - 1;

    return (
        <SafeAreaView style={styles.container}>
            {/* Skip */}
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false },
                )}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            />

            {/* Bottom */}
            <View style={styles.bottom}>
                {/* Dots */}
                <View style={styles.dots}>
                    {slides.map((_, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.dot,
                                idx === currentIndex && styles.dotActive,
                            ]}
                        />
                    ))}
                </View>

                {/* Next / Get Started */}
                <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={handleNext}
                    activeOpacity={0.85}
                >
                    <Text style={styles.nextBtnText}>
                        {isLast ? 'Get Started' : 'Next'}
                    </Text>
                    {!isLast && <ChevronRight size={18} color={COLORS.white} />}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Check if onboarding has been seen
export const hasSeenOnboarding = async () => {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    skipBtn: {
        position: 'absolute',
        top: 60,
        right: 24,
        zIndex: 10,
    },
    skipText: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontWeight: '600',
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 140,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.black,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    ring: {
        position: 'absolute',
        borderWidth: 1.5,
        borderColor: 'rgba(0,0,0,0.08)',
        borderRadius: 999,
    },
    ring1: {
        width: 120,
        height: 120,
    },
    ring2: {
        width: 140,
        height: 140,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 12,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 24,
    },
    bottom: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 24,
    },
    dots: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.border,
    },
    dotActive: {
        width: 24,
        backgroundColor: COLORS.black,
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.black,
        borderRadius: 16,
        height: 56,
        gap: 6,
    },
    nextBtnText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '700',
    },
});
export default OnboardingScreen;
