import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { formatPrice } from 'shared-logic/currency';
import { useLanguage } from '../context/LanguageContext';

const CartItem = ({ item, onUpdateQuantity, onRemove, currency: currencyProp }) => {
    const { currency: contextCurrency } = useLanguage();
    const activeCurrency = currencyProp || contextCurrency;

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: item.image_url }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.price}>
                    {formatPrice(item.price * item.quantity, activeCurrency)}
                </Text>
                <View style={styles.controls}>
                    <View style={styles.quantityRow}>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        >
                            <Minus size={14} color={COLORS.black} />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                        >
                            <Plus
                                size={14}
                                color={
                                    item.quantity >= item.stock
                                        ? COLORS.textSecondary
                                        : COLORS.black
                                }
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => onRemove(item.id)}
                    >
                        <Trash2 size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        gap: 12,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: COLORS.cardLight,
    },
    info: {
        flex: 1,
        justifyContent: 'space-between',
    },
    name: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
    },
    price: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '800',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: COLORS.cardLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantity: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '700',
        minWidth: 20,
        textAlign: 'center',
    },
    deleteBtn: {
        padding: 6,
    },
});

export default CartItem;
