import React, { useMemo } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useComparison } from '../context/ComparisonContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from 'shared-logic/currency';

const { width } = Dimensions.get('window');

// ─── Helpers ───

/** Capitalize each word: "battery life" → "Battery Life" */
const capitalize = (str) =>
    str.replace(/(^|\s)\S/g, (c) => c.toUpperCase());

/** Normalize any specs shape into a flat { key: value } object */
const normalizeSpecs = (specs) => {
    if (!specs) return {};
    // Already an object → return as-is
    if (!Array.isArray(specs) && typeof specs === 'object') return specs;
    // Array of objects → merge into one object
    if (Array.isArray(specs)) {
        const merged = {};
        specs.forEach((item) => {
            if (item && typeof item === 'object') {
                Object.entries(item).forEach(([k, v]) => {
                    merged[k] = v;
                });
            }
        });
        return merged;
    }
    return {};
};

const ComparisonScreen = ({ navigation }) => {
    const { comparisonItems, clearComparison } = useComparison();
    const { t, currency } = useLanguage();

    const productCount = comparisonItems.length;
    const COL_WIDTH = productCount === 2
        ? (width - 16 - 100) / 2
        : (width - 16 - 100) / 3;

    // ─── Normalize all product specs ───
    const normalizedProducts = useMemo(() =>
        comparisonItems.map((p) => ({
            ...p,
            _specs: normalizeSpecs(p.specs),
        })),
        [comparisonItems]
    );

    // ─── Collect ALL unique spec keys across all products ───
    const allSpecKeys = useMemo(() => {
        const keySet = new Set();
        normalizedProducts.forEach((p) => {
            Object.keys(p._specs).forEach((k) => keySet.add(k));
        });
        return Array.from(keySet);
    }, [normalizedProducts]);

    // ─── Translate boolean values ───
    const translateValue = (val) => {
        if (val === null || val === undefined) return null;
        const str = String(val);
        const lower = str.toLowerCase();
        if (lower === 'true' || lower === 'yes' || lower === 'sí' || lower === 'si') {
            return t('comparison.yes');
        }
        if (lower === 'false' || lower === 'no') {
            return t('comparison.no');
        }
        return str;
    };

    // ─── Translate spec key: try i18n key first, fallback to capitalize ───
    const translateSpecKey = (key) => {
        const i18nKey = `comparison.specs.${key}`;
        const translated = t(i18nKey);
        // If i18next returns the key itself, it means no translation exists
        if (translated === i18nKey || !translated) {
            return capitalize(key);
        }
        return translated;
    };

    // ─── Get spec value for a product ───
    const getSpecValue = (product, key) => {
        const val = product._specs[key];
        return val !== undefined && val !== null ? String(val) : null;
    };

    // ─── Check if values differ across products ───
    const isDifferent = (key) => {
        const values = normalizedProducts.map((p) => getSpecValue(p, key));
        return !values.every((v) => v === values[0]);
    };

    // ─── Basic fields to compare (non-spec) ───
    const basicFields = [
        {
            label: t('comparison.price'),
            getValue: (p) => formatPrice(p.price, currency),
            isDiff: () => {
                const prices = normalizedProducts.map((p) => p.price);
                return !prices.every((v) => v === prices[0]);
            },
        },
        {
            label: t('comparison.category'),
            getValue: (p) => p.category || '—',
            isDiff: () => {
                const cats = normalizedProducts.map((p) => p.category);
                return !cats.every((v) => v === cats[0]);
            },
        },
        {
            label: t('comparison.stock'),
            getValue: (p) => String(p.stock ?? 0),
            isDiff: () => {
                const stocks = normalizedProducts.map((p) => p.stock);
                return !stocks.every((v) => v === stocks[0]);
            },
        },
    ];

    if (productCount < 2) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <ChevronLeft size={22} color={COLORS.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {t('comparison.title')}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.emptyWrap}>
                    <Text style={styles.emptyText}>
                        {t('comparison.needTwo')}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ChevronLeft size={22} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {t('comparison.title')} ({productCount})
                </Text>
                <TouchableOpacity
                    style={styles.clearHeaderBtn}
                    onPress={() => { clearComparison(); navigation.goBack(); }}
                    hitSlop={8}
                >
                    <Trash2 size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* ─── Product Cards Row ─── */}
                <View style={styles.productsRow}>
                    <View style={styles.labelCol} />
                    {normalizedProducts.map((product) => (
                        <View key={product.id} style={[styles.productCol, { width: COL_WIDTH }]}>
                            <View style={styles.productImageWrap}>
                                <Image
                                    source={{ uri: product.image_url }}
                                    style={styles.productImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.productName} numberOfLines={2}>
                                {product.name}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* ─── Basic Fields Table ─── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {t('comparison.general')}
                    </Text>
                </View>
                {basicFields.map((field, idx) => {
                    const diff = field.isDiff();
                    return (
                        <View
                            key={`basic-${idx}`}
                            style={[styles.tableRow, diff && styles.tableRowDiff]}
                        >
                            <View style={styles.labelCol}>
                                <Text style={styles.labelText}>{field.label}</Text>
                            </View>
                            {normalizedProducts.map((product) => (
                                <View
                                    key={product.id}
                                    style={[styles.valueCol, { width: COL_WIDTH }]}
                                >
                                    <Text
                                        style={[
                                            styles.valueText,
                                            diff && styles.valueTextDiff,
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {field.getValue(product)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    );
                })}

                {/* ─── Specs Table (dynamic from backend) ─── */}
                {allSpecKeys.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {t('details.specifications')}
                            </Text>
                        </View>
                        {allSpecKeys.map((key) => {
                            const diff = isDifferent(key);
                            return (
                                <View
                                    key={key}
                                    style={[styles.tableRow, diff && styles.tableRowDiff]}
                                >
                                    <View style={styles.labelCol}>
                                        <Text style={styles.labelText}>
                                            {translateSpecKey(key)}
                                        </Text>
                                    </View>
                                    {normalizedProducts.map((product) => {
                                        const rawVal = getSpecValue(product, key);
                                        const displayVal = rawVal !== null
                                            ? translateValue(rawVal)
                                            : t('comparison.notAvailable');
                                        return (
                                            <View
                                                key={product.id}
                                                style={[styles.valueCol, { width: COL_WIDTH }]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.valueText,
                                                        rawVal === null && styles.valueEmpty,
                                                        diff && styles.valueTextDiff,
                                                    ]}
                                                    numberOfLines={2}
                                                >
                                                    {displayVal}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            );
                        })}
                    </>
                )}

                <View style={{ height: 40 }} />
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
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    clearHeaderBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    productsRow: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
    },
    labelCol: {
        width: 100,
        justifyContent: 'center',
        paddingRight: 4,
        paddingLeft: 8,
    },
    productCol: {
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    productImageWrap: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        overflow: 'hidden',
    },
    productImage: {
        width: '78%',
        height: '78%',
    },
    productName: {
        color: COLORS.textPrimary,
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 16,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 8,
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
    },
    tableRowDiff: {
        backgroundColor: 'rgba(255, 159, 10, 0.08)',
    },
    labelText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    valueCol: {
        paddingHorizontal: 4,
        justifyContent: 'center',
    },
    valueText: {
        color: COLORS.textPrimary,
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    valueTextDiff: {
        color: COLORS.warning,
        fontWeight: '800',
    },
    valueEmpty: {
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
});

export default ComparisonScreen;
