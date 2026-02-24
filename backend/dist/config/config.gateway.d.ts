import { Server } from 'socket.io';
export declare class ConfigGateway {
    server: Server;
    emitConfigUpdate(config: Record<string, unknown>): void;
}
