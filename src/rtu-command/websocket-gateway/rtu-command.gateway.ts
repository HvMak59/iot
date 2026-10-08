import {
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})

export class RtuCommandGateway {

    @WebSocketServer()
    server: Server;

    sendRtuResponse(response: any) {

        this.server.emit(
            'rtu-response',
            response,
        );
    }
}
