import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { useLanguage } from './LanguageContext';
import { registerPushToken } from '../api/pushService';
import { navigate } from '../navigation/navigationRef';

// ─────────────────────────────────────────────────────────────
// 1. Notification Handler — SDK 50+ (sin shouldShowAlert)
// ─────────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// ─────────────────────────────────────────────────────────────
// 2. Notification type config (channelId & UI type mapping)
// ─────────────────────────────────────────────────────────────
const NOTIFICATION_TYPE_CONFIG = {
    payment_success: {
        titleKey: 'notification.paymentSuccess',
        type: 'success',
        channelId: 'payments',
        duration: 6000,
    },
    shipment_update: {
        titleKey: 'notification.shipmentUpdate',
        type: 'info',
        channelId: 'shipping',
        duration: 5000,
    },
    flash_offer: {
        titleKey: 'notification.flashOffer',
        type: 'warning',
        channelId: 'marketing',
        duration: 7000,
    },
};

const DEFAULT_NOTIFICATION_CONFIG = {
    titleKey: 'notification.defaultTitle',
    type: 'info',
    duration: 4000,
};

const PushNotificationContext = createContext(null);

export const PushNotificationProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const { showNotification } = useNotification();
    const { t } = useLanguage();
    const [expoPushToken, setExpoPushToken] = useState(null);
    const notificationListener = useRef();
    const responseListener = useRef();

    // ─── Registro de token (solo cuando el usuario está logueado) ───
    useEffect(() => {
        if (!isAuthenticated || !user) {
            console.log('🔔 PushContext: Esperando login del usuario...');
            return;
        }

        let isMounted = true;

        const register = async () => {
            console.log('🚀 Iniciando registro de notificaciones...');

            // ── Paso 1: Validar dispositivo ──
            if (!Device.isDevice && Platform.OS !== 'android') {
                console.log('❌ Push: Se requiere dispositivo físico para iOS');
                return;
            }

            // ── Paso 2: Gestión de permisos ──
            try {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    console.log('⚠️ Push: Permiso de notificaciones denegado por el usuario');
                    return;
                }
            } catch (permError) {
                console.log('🚨 Push: Error al solicitar permisos:', permError.message);
                return;
            }

            // ── Paso 3: Canales de Android (FCM V1) ──
            if (Platform.OS === 'android') {
                try {
                    await Promise.all([
                        Notifications.setNotificationChannelAsync('payments', {
                            name: 'Pagos y Confirmaciones',
                            description: 'Notificaciones de pagos aprobados y confirmaciones de compra',
                            importance: Notifications.AndroidImportance.MAX,
                            vibrationPattern: [0, 250, 250, 250],
                            lightColor: '#34C759',
                            sound: 'default',
                        }),
                        Notifications.setNotificationChannelAsync('shipping', {
                            name: 'Envíos y Tracking',
                            description: 'Seguimiento de tus pedidos y actualizaciones de envío',
                            importance: Notifications.AndroidImportance.HIGH,
                            vibrationPattern: [0, 200, 200, 200],
                            lightColor: '#007AFF',
                            sound: 'default',
                        }),
                        Notifications.setNotificationChannelAsync('marketing', {
                            name: 'Ofertas y Promociones',
                            description: 'Ofertas flash, descuentos exclusivos y novedades',
                            importance: Notifications.AndroidImportance.DEFAULT,
                            vibrationPattern: [0, 150],
                            lightColor: '#FF9F0A',
                        }),
                    ]);
                    console.log('📢 Push: 3 canales de Android creados (payments, shipping, marketing)');
                } catch (channelError) {
                    console.log('⚠️ Push: Error creando canales Android:', channelError.message);
                }
            }

            // ── Paso 4: Obtener Expo Push Token ──
            try {
                const projectId =
                    Constants.expoConfig?.extra?.eas?.projectId ||
                    'cc08c318-da94-4209-9fd3-5f9a60d7895d';

                console.log('📡 Push: Solicitando token para ProjectId:', projectId);

                const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
                const token = tokenData.data;

                if (!isMounted || !token) return;

                setExpoPushToken(token);
                console.log('🎯 ¡TOKEN GENERADO! ->', token);

                // ── Paso 5: Registrar token en Backend ──
                try {
                    await registerPushToken(token);
                    console.log('🏁 Backend: Token vinculado al usuario', user.id);
                } catch (backendError) {
                    console.log('⚠️ Backend: Error registrando token:', backendError.message);
                }
            } catch (tokenError) {
                console.log('🚨 Push: Error obteniendo token:', tokenError.message);
            }
        };

        register();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, user?.id]);

    // ─── Listeners de notificación ───
    useEffect(() => {
        // Escuchar notificaciones en primer plano
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                const { title, body } = notification.request.content;
                const data = notification.request.content.data || {};
                const notifType = data.type;

                console.log('📩 Notificación recibida:', title, '| tipo:', notifType || 'general');

                // Seleccionar configuración según el tipo de notificación
                const config = NOTIFICATION_TYPE_CONFIG[notifType] || DEFAULT_NOTIFICATION_CONFIG;

                // Usar t() para título traducido dinámicamente
                const translatedTitle = t(config.titleKey) || title || 'TechStore';

                showNotification({
                    title: translatedTitle,
                    message: body || '',
                    type: config.type,
                    duration: config.duration,
                });
            }
        );

        // Escuchar interacción (tap) con la notificación
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                const data = response.notification.request.content.data;
                const notifType = data?.type;

                console.log('🖱️ Tap en notificación | tipo:', notifType, '| data:', JSON.stringify(data));

                // Navegar a Mis Pedidos si es notificación de pago o envío
                if (notifType === 'payment_success' || notifType === 'shipment_update') {
                    navigate('ProfileTab', { screen: 'MyOrders' });
                }

                // Navegar a Home/Detalles si es una oferta flash con productId
                if (notifType === 'flash_offer' && data?.productId) {
                    navigate('HomeTab', {
                        screen: 'Details',
                        params: { productId: data.productId },
                    });
                }
            }
        );

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [showNotification, t]);

    return (
        <PushNotificationContext.Provider value={{ expoPushToken }}>
            {children}
        </PushNotificationContext.Provider>
    );
};

export const usePushNotifications = () => useContext(PushNotificationContext);