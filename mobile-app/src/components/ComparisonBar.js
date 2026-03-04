import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { ArrowRight, X, Trash2 } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useComparison } from '../context/ComparisonContext';
import { useLanguage } from '../context/LanguageContext';

const THUMB_SIZE = 44;

const ComparisonBar = ({ onCompare }) => {
    const { comparisonItems, removeFromComparison, clearComparison, comparisonCount } =
        useComparison();
    const { t } = useLanguage();
    const slideAnim = useRef(new Animated.Value(120)).current;

    const isVisible = comparisonCount > 0;
    const canCompare = comparisonCount >= 2;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: isVisible ? 0 : 120,
            useNativeDriver: true,
            tension: 80,
            friction: 14,
        }).start();
    }, [isVisible]);

    if (!isVisible) return null;

    const emptySlots = 3 - comparisonCount;

    return (
        <Animated.View style={[styles.bar, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.topRow}>
                {/* Thumbnails */}
                <View style={styles.thumbs}>
                    {comparisonItems.map((item) => (
                        <View key={item.id} style={styles.thumbWrap}>
                            <Image
                                source={{ uri: item.image_url }}
                                style={styles.thumb}
                                resizeMode="contain"
                            />
                            <TouchableOpacity
                                style={styles.thumbRemove}
                                onPress={() => removeFromComparison(item.id)}
                                hitSlop={6}
                            >
                                <X size={10} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                        <View key={`empty-${i}`} style={styles.thumbEmpty} />
                    ))}
                </View>

                {/* Counter */}
                <Text style={styles.counter}>
                    {t('comparison.counter', { count: comparisonCount })}
                </Text>

                {/* Clear */}
                <TouchableOpacity onPress={clearComparison} style={styles.clearBtn} hitSlop={8}>
                    <Trash2 size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* CTA */}
            <TouchableOpacity
                style={[styles.ctaBtn, !canCompare && styles.ctaBtnDisabled]}
                onPress={canCompare ? onCompare : undefined}
                activeOpacity={canCompare ? 0.85 : 1}
            >
                <Text style={[styles.ctaText, !canCompare && styles.ctaTextDisabled]}>
                    {t('comparison.compare')}
                </Text>
                <ArrowRight size={18} color={canCompare ? COLORS.white : COLORS.textSecondary} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    bar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.border,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 34,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    thumbs: {
        flexDirection: 'row',
        gap: 8,
        flex: 1,
    },
    thumbWrap: {
        position: 'relative',
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: 10,
        backgroundColor: COLORS.card,
        borderWidth: 1.5,
        borderColor: COLORS.black,
    },
    thumbRemove: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: COLORS.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbEmpty: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    counter: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '700',
        marginRight: 8,
    },
    clearBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.black,
        borderRadius: 12,
        height: 48,
        gap: 8,
    },
    ctaBtnDisabled: {
        backgroundColor: COLORS.card,
    },
    ctaText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    ctaTextDisabled: {
        color: COLORS.textSecondary,
    },
});

export default ComparisonBar;
