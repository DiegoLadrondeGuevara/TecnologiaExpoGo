"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    logger = new common_1.Logger(NotificationsService_1.name);
    EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
    async sendPush(expoPushToken, title, body, data) {
        if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) {
            this.logger.warn(`Invalid push token: ${expoPushToken}`);
            return false;
        }
        const message = {
            to: expoPushToken,
            title,
            body,
            data: data || {},
            sound: 'default',
            channelId: 'orders',
        };
        try {
            const response = await axios_1.default.post(this.EXPO_PUSH_URL, message, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`✅ Push sent to ${expoPushToken.substring(0, 30)}... | title: "${title}"`);
            return true;
        }
        catch (error) {
            this.logger.error(`❌ Push failed: ${error.message}`);
            return false;
        }
    }
    async sendOrderStatusPush(expoPushToken, orderId, status) {
        const messages = {
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
        if (!msg)
            return false;
        return this.sendPush(expoPushToken, msg.title, msg.body, {
            type: 'order_status',
            orderId,
            status,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)()
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map