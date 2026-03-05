import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface ExpoPushMessage {
    to: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    sound?: string;
    channelId?: string;
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    private readonly EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

    /**
     * Send a push notification via the Expo Push API.
     */
    async sendPush(
        expoPushToken: string,
        title: string,
        body: string,
        data?: Record<string, unknown>,
        channelId: string = 'orders',
    ): Promise<boolean> {
        if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) {
            this.logger.warn(`Invalid push token: ${expoPushToken}`);
            return false;
        }

        const message: ExpoPushMessage = {
            to: expoPushToken,
            title,
            body,
            data: data || {},
            sound: 'default',
            channelId,
        };

        try {
            const response = await axios.post(this.EXPO_PUSH_URL, message, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
            });

            this.logger.log(
                `✅ Push sent to ${expoPushToken.substring(0, 30)}... | title: "${title}"`,
            );
            return true;
        } catch (error) {
            this.logger.error(
                `❌ Push failed: ${error.message}`,
            );
            return false;
        }
    }

    /**
     * Send push for an order status change.
     * Handles shipped, delivered, and cancelled statuses.
     */
    async sendOrderStatusPush(
        expoPushToken: string,
        orderId: string,
        status: string,
    ): Promise<boolean> {
        const messages: Record<string, { title: string; body: string }> = {
            shipped: {
                title: '🚚 Order Shipped!',
                body: 'Your order is on its way. Track it in My Orders.',
            },
            delivered: {
                title: '📦 Order Delivered!',
                body: 'Your order has been delivered. Enjoy!',
            },
            cancelled: {
                title: '❌ Order Cancelled',
                body: 'Your order has been cancelled. Contact support if you have questions.',
            },
        };

        const msg = messages[status];
        if (!msg) return false;

        return this.sendPush(expoPushToken, msg.title, msg.body, {
            type: 'shipment_update',
            orderId,
            status,
        }, 'shipping');
    }

    /**
     * Send push notification when a payment is approved.
     */
    async sendPaymentSuccessPush(
        expoPushToken: string,
        orderId: string,
    ): Promise<boolean> {
        return this.sendPush(
            expoPushToken,
            '✅ ¡Pago Confirmado!',
            'Tu compra ha sido procesada con éxito. Revisa tus pedidos.',
            { type: 'payment_success', orderId },
            'payments',
        );
    }
}
