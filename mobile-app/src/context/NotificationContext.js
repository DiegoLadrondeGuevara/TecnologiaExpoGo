import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, CheckCircle, Bell, AlertTriangle } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

const NotificationContext = createContext(null);

const ICONS = {
    success: CheckCircle,
    info: Bell,
    warning: AlertTriangle,
};

export const NotificationProvider = ({ children }) => {
    const insets = useSafeAreaInsets();
    const [notification, setNotification] = useState(null);
    const slideAnim = useRef(new Animated.Value(-120)).current;
    const timerRef = useRef(null);

    const showNotification = useCallback(
        ({ title, message, type = 'info', duration = 4000 }) => {
            // Clear existing timer
            if (timerRef.current) clearTimeout(timerRef.current);

            setNotification({ title, message, type });

            // Slide in
            slideAnim.setValue(-120);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 80,
                friction: 12,
            }).start();

            // Auto-dismiss
            timerRef.current = setTimeout(() => {
                dismiss();
            }, duration);
        },
        [slideAnim],
    );

    const dismiss = useCallback(() => {
        Animated.timing(slideAnim, {
            toValue: -120,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setNotification(null));
    }, [slideAnim]);

    const IconComponent = notification ? ICONS[notification.type] || Bell : Bell;

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <Animated.View
                    style={[
                        styles.banner,
                        { top: insets.top + 8, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <View style={styles.bannerContent}>
                        <View style={styles.iconWrap}>
                            <IconComponent
                                size={18}
                                color={
                                    notification.type === 'success'
                                        ? COLORS.success
                                        : notification.type === 'warning'
                                            ? COLORS.warning
                                            : COLORS.black
                                }
                            />
                        </View>
                        <View style={styles.textWrap}>
                            <Text style={styles.bannerTitle}>{notification.title}</Text>
                            {notification.message ? (
                                <Text style={styles.bannerMessage} numberOfLines={2}>
                                    {notification.message}
                                </Text>
                            ) : null}
                        </View>
                        <TouchableOpacity onPress={dismiss} hitSlop={10}>
                            <X size={16} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
    return ctx;
};

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 9999,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: 14,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textWrap: {
        flex: 1,
    },
    bannerTitle: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '700',
    },
    bannerMessage: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
});
