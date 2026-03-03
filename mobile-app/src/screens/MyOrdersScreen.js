import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
    Package,
    CheckCircle,
    Clock,
    ChevronLeft,
    ShoppingBag,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from 'shared-logic/currency';
import { fetchMyOrders } from '../api/paymentService';

const STATUS_CONFIG = {
    paid: {
        label: 'Paid',
        labelEs: 'Pagado',
        icon: CheckCircle,
        color: '#34C759',
        bg: 'rgba(52, 199, 89, 0.12)',
        step: 1,
    },
    shipped: {
        label: 'Shipped',
        labelEs: 'Enviado',
        icon: Package,
        color: '#007AFF',
        bg: 'rgba(0, 122, 255, 0.12)',
        step: 2,
    },
    delivered: {
        label: 'Delivered',
        labelEs: 'Entregado',
        icon: CheckCircle,
        color: '#34C759',
        bg: 'rgba(52, 199, 89, 0.12)',
        step: 3,
    },
    pending: {
        label: 'Pending',
        labelEs: 'Pendiente',
        icon: Clock,
        color: '#FF9F0A',
        bg: 'rgba(255, 159, 10, 0.12)',
        step: 0,
    },
};

const TIMELINE_STEPS = [
    { key: 'created', labelEn: 'Created', labelEs: 'Creado' },
    { key: 'paid', labelEn: 'Paid', labelEs: 'Pagado' },
    { key: 'shipped', labelEn: 'Shipped', labelEs: 'Enviado' },
    { key: 'delivered', labelEn: 'Delivered', labelEs: 'Entregado' },
];

const OrderCard = ({ order, currency, isSpanish }) => {    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const StatusIcon = status.icon;
    const itemCount = order.items?.length || 0;
    const date = new Date(order.createdAt);

    return (
        <View style={styles.orderCard}>
            {/* Header: Order ID + Status */}
            <View style={styles.orderHeader}>
                <View style={styles.orderIdRow}>
                    <View style={styles.orderIconWrap}>
                        <Package size={16} color={COLORS.black} />
                    </View>
                    <Text style={styles.orderId} numberOfLines={1}>
                        #{order.id.slice(0, 8)}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <StatusIcon size={12} color={status.color} />
                    <Text style={[styles.statusText, { color: status.color }]}>
                        {isSpanish ? status.labelEs : status.label}
                    </Text>
                </View>
            </View>

            {/* Items preview */}
            {order.items && order.items.length > 0 && (
                <View style={styles.itemsPreview}>
                    {order.items.slice(0, 3).map((item, idx) => (
                        <Text key={idx} style={styles.itemText} numberOfLines={1}>
                            • {item.product?.nameEn || 'Product'} × {item.quantity}
                        </Text>
                    ))}
                    {order.items.length > 3 && (
                        <Text style={styles.moreItems}>
                            +{order.items.length - 3} {isSpanish ? 'más' : 'more'}
                        </Text>
                    )}
                </View>
            )}

            {/* Order Timeline */}
            <View style={styles.timeline}>
                {TIMELINE_STEPS.map((step, idx) => {
                    const currentStep = status.step ?? 0;
                    const isCompleted = idx <= currentStep;
                    const isLast = idx === TIMELINE_STEPS.length - 1;
                    return (
                        <View key={step.key} style={styles.timelineStep}>
                            <View style={styles.timelineDotCol}>
                                <View
                                    style={[
                                        styles.timelineDot,
                                        isCompleted && styles.timelineDotActive,
                                    ]}
                                />
                                {!isLast && (
                                    <View
                                        style={[
                                            styles.timelineLine,
                                            isCompleted && idx < currentStep && styles.timelineLineActive,
                                        ]}
                                    />
                                )}
                            </View>
                            <Text
                                style={[
                                    styles.timelineLabel,
                                    isCompleted && styles.timelineLabelActive,
                                ]}
                            >
                                {isSpanish ? step.labelEs : step.labelEn}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Footer: Date + Total */}
            <View style={styles.orderFooter}>
                <View style={styles.dateRow}>
                    <Text style={styles.dateText}>
                        {date.toLocaleDateString(isSpanish ? 'es' : 'en', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </Text>
                    <Text style={styles.dotSep}>•</Text>
                    <Text style={styles.dateText}>
                        {itemCount} {itemCount === 1
                            ? (isSpanish ? 'artículo' : 'item')
                            : (isSpanish ? 'artículos' : 'items')}
                    </Text>
                </View>
                <Text style={styles.totalText}>
                    {formatPrice(order.total, currency)}
                </Text>
            </View>
        </View>
    );
};

const MyOrdersScreen = ({ navigation }) => {
    const { t, currency } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const isSpanish = t('home.exploreTitle') !== 'Explore';

    const loadOrders = useCallback(async () => {
        try {
            const data = await fetchMyOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Reload every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadOrders();
        }, [loadOrders])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadOrders();
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={COLORS.black} />
                </View>
            </SafeAreaView>
        );
    }

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
                    {isSpanish ? 'Mis Pedidos' : 'My Orders'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <View style={styles.emptyIcon}>
                        <ShoppingBag size={48} color={COLORS.textSecondary} />
                    </View>
                    <Text style={styles.emptyTitle}>
                        {isSpanish ? 'Sin pedidos aún' : 'No orders yet'}
                    </Text>
                    <Text style={styles.emptyMsg}>
                        {isSpanish
                            ? 'Tus compras aparecerán aquí'
                            : 'Your purchases will appear here'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.black}
                            colors={[COLORS.black]}
                        />
                    }
                    renderItem={({ item }) => (
                        <OrderCard
                            order={item}
                            currency={currency}
                            isSpanish={isSpanish}
                        />
                    )}
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
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        padding: 16,
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: COLORS.border,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    orderIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderId: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '700',
        fontFamily: 'monospace',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    itemsPreview: {
        marginBottom: 12,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.border,
    },
    itemText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 3,
    },
    moreItems: {
        color: COLORS.black,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.border,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    dotSep: {
        color: COLORS.textSecondary,
        fontSize: 10,
    },
    totalText: {
        color: COLORS.black,
        fontSize: 18,
        fontWeight: '800',
    },
    timeline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 14,
        paddingBottom: 4,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.border,
        marginBottom: 8,
    },
    timelineStep: {
        alignItems: 'center',
        flex: 1,
    },
    timelineDotCol: {
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        marginBottom: 6,
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.border,
        zIndex: 1,
    },
    timelineDotActive: {
        backgroundColor: COLORS.black,
    },
    timelineLine: {
        position: 'absolute',
        left: '55%',
        right: '-45%',
        height: 2,
        backgroundColor: COLORS.border,
        top: 4,
    },
    timelineLineActive: {
        backgroundColor: COLORS.black,
    },
    timelineLabel: {
        color: COLORS.textSecondary,
        fontSize: 9,
        fontWeight: '600',
    },
    timelineLabelActive: {
        color: COLORS.textPrimary,
        fontWeight: '700',
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
export default MyOrdersScreen;
