import {
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/config',
})
export class ConfigGateway {
    @WebSocketServer()
    server!: Server;

    emitConfigUpdate(config: Record<string, unknown>) {
        this.server.emit('config.updated', config);
    }
}
