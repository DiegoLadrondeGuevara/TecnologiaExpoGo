export declare class NotificationsService {
    private readonly logger;
    private readonly EXPO_PUSH_URL;
    sendPush(expoPushToken: string, title: string, body: string, data?: Record<string, unknown>): Promise<boolean>;
    sendOrderStatusPush(expoPushToken: string, orderId: string, status: string): Promise<boolean>;
}
