// import {
//     WebSocketGateway,
//     WebSocketServer,
// } from '@nestjs/websockets';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { Server, WebSocket } from 'ws';
// import { Alert } from '../entities/alert.entity';
// import { AlertStatus } from 'src/utils/enums';

// @WebSocketGateway({
//     path: '/alerts',
//     cors: { origin: '*' },
// })
// export class AlertGateway {
//     @WebSocketServer()
//     server: Server;

//     private readonly logger = winstonServerLogger(AlertGateway.name);

//     // assetId -> Set<WebSocket>
//     private subscriptions = new Map<string, Set<WebSocket>>();

//     // client -> assetId
//     private clientSubscription = new Map<WebSocket, string>();


//     handleConnection(client: WebSocket) {
//         this.logger.debug('Alert client connected');

//         client.on('message', (raw) => {
//             try {
//                 const msg = JSON.parse(raw.toString());

//                 //  Expected subscription message from Flutter:
//                 //  {
//                 //    "type": "SUBSCRIBE",
//                 //    "data": {
//                 //      "assetId": "asset-123"
//                 //    }
//                 //  }

//                 if (msg?.type === 'SUBSCRIBE') {
//                     const assetId = msg?.data?.assetId;

//                     if (!assetId) {
//                         this.logger.error('Subscription failed: Missing assetId');
//                         return;
//                     }

//                     this.subscribeClient(client, assetId);
//                 }
//             } catch (error) {
//                 this.logger.error('Invalid WS message received', error);
//             }
//         });

//         client.on('close', () => {
//             this.cleanupClient(client);
//             this.clientSubscription.delete(client);
//             this.logger.debug('Alert client disconnected');
//         });
//     }

//     private subscribeClient(client: WebSocket, assetId: string) {
//         // If client already subscribed → cleanup old subscription
//         const oldAssetId = this.clientSubscription.get(client);
//         if (oldAssetId) {
//             const oldClients = this.subscriptions.get(oldAssetId);
//             oldClients?.delete(client);
//             if (oldClients?.size === 0) {
//                 this.subscriptions.delete(oldAssetId);
//             }
//         }

//         // Add new subscription
//         if (!this.subscriptions.has(assetId)) {
//             this.subscriptions.set(assetId, new Set());
//         }

//         this.subscriptions.get(assetId)!.add(client);
//         this.clientSubscription.set(client, assetId);

//         this.logger.debug(
//             `Client subscribed to alerts for assetId: ${assetId}`,
//         );
//     }

//     private cleanupClient(client: WebSocket) {
//         const assetId = this.clientSubscription.get(client);
//         if (!assetId) return;

//         const clients = this.subscriptions.get(assetId);
//         clients?.delete(client);

//         if (clients?.size === 0) {
//             this.subscriptions.delete(assetId);
//         }
//     }

//     public sendAlerts(
//         assetId: string,
//         eventType: AlertStatus,
//         alerts: Alert[],
//     ) {
//         if (!alerts || alerts.length === 0) return;

//         const clients = this.subscriptions.get(assetId);
//         if (!clients || clients.size === 0) return;

//         const payload = {
//             type: eventType,
//             data: alerts,
//         };

//         const message = JSON.stringify(payload);

//         this.logger.debug(
//             `Sending ${eventType} to assetId: ${assetId}, clients: ${clients.size}`,
//         );

//         clients.forEach((ws) => {
//             if (ws.readyState === ws.OPEN) {
//                 ws.send(message);
//             }
//         });
//     }
// }




import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { Alert } from '../alert/entities/alert.entity';
import { AlertStatus } from 'src/utils/enums';
import { OrgService } from 'src/org/org.service';
import { FindOrgsOrAssets } from 'src/org/dto/find-orgs-or-assets';

@WebSocketGateway({
    path: '/alerts',
    cors: { origin: '*' },
})
export class AlertGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = winstonServerLogger(AlertGateway.name);

    private subscriptions = new Map<string, Set<WebSocket>>();

    private clientSubscriptions = new Map<WebSocket, Set<string>>();

    constructor(
        private readonly orgService: OrgService,
    ) { }

    handleConnection(client: WebSocket) {
        this.logger.debug('Alert client connected');

        client.on('message', async (raw) => {
            try {
                const msg = JSON.parse(raw.toString());

                console.log(msg);
                const csvOrgIDs = msg?.data?.csvOrgIDs;
                // const csvOrgIDs = msg?.data?.assetId;

                if (!csvOrgIDs) {
                    this.logger.error(
                        'Subscription failed: Missing csvOrgIDs',
                    );
                    return;
                }

                // const orgIds = csvOrgIDs
                //     .split(',') 
                //     .map((id: string) => id.trim())
                //     .filter(Boolean);

                await this.subscribeClient(client, csvOrgIDs);
            } catch (error) {
                this.logger.error('Invalid WS message received', error);
            }
        });
    }

    handleDisconnect(client: WebSocket) {
        this.cleanupClient(client);
        this.logger.debug('Alert client disconnected');
    }


    private async subscribeClient(
        client: WebSocket,
        findOrgsOrAssets: FindOrgsOrAssets,
    ) {
        try {
            this.logger.debug('Starting client subscription');

            // Get descendant orgs with assets
            const descendantOrgs =
                await this.orgService.findDescendents(
                    findOrgsOrAssets,
                    true,
                );

            console.log(descendantOrgs);
            // Extract all asset IDs 
            const assetIds = descendantOrgs
                .flatMap((org) => org.assets ?? [])
                .map((asset) => asset.id);

            if (!assetIds.length) {
                this.logger.debug('No assets found for subscription');
                return;
            }

            // Cleanup previous subscriptions
            this.cleanupClient(client);

            // Subscribe client to all assets
            for (const assetId of assetIds) {

                // Add to subscriptions map
                if (!this.subscriptions.has(assetId)) {
                    this.subscriptions.set(assetId, new Set());
                }

                this.subscriptions.get(assetId)!.add(client);

                // Add to clientSubscriptions map
                if (!this.clientSubscriptions.has(client)) {
                    this.clientSubscriptions.set(client, new Set());
                }

                this.clientSubscriptions.get(client)!.add(assetId);

                this.logger.debug(`Subscribed to ${assetId}`);
            }

            this.logger.debug(
                `Client subscribed to ${assetIds.length} assets`,
            );

        } catch (error) {
            this.logger.error('Subscription error', error);
        }
    }

    // private async subscribeClientToOrgs(
    //     client: WebSocket,
    //     orgIds: FindOrgsOrAssets,
    // ) {
    //     try {
    //         console.log("in subsorg");
    //         const descendantOrgs =
    //             await this.orgService.findDescendents(
    //                 orgIds,
    //                 true,
    //             );
    //         // console.log(descendantOrgs);
    //         const assetIds = descendantOrgs
    //             // .flatMap((org) => org.assets ?? [])
    //             .map((asset) => asset.id);

    //         this.cleanupClient(client);

    //         assetIds.forEach((assetId) =>
    //             this.subscribeClientToAsset(client, assetId),
    //         );

    //         this.logger.debug(
    //             `Subscribed to ${assetIds.length} assets`,
    //         );
    //     } catch (error) {
    //         this.logger.error('Subscription error', error);
    //     }
    // }

    // private subscribeClientToAsset(
    //     client: WebSocket,
    //     assetId: string,
    // ) {
    //     if (!this.subscriptions.has(assetId)) {
    //         this.subscriptions.set(assetId, new Set());
    //     }

    //     this.subscriptions.get(assetId)!.add(client);

    //     if (!this.clientSubscriptions.has(client)) {
    //         this.clientSubscriptions.set(client, new Set());
    //     }

    //     this.clientSubscriptions.get(client)!.add(assetId);
    //     this.logger.debug(
    //         `Subscribed to ${assetId}`,
    //     );
    // }


    private cleanupClient(client: WebSocket) {
        const assetIds = this.clientSubscriptions.get(client);
        if (!assetIds) return;

        assetIds.forEach((assetId) => {
            const clients = this.subscriptions.get(assetId);
            clients?.delete(client);

            if (clients && clients.size === 0) {
                this.subscriptions.delete(assetId);
            }
        });

        this.clientSubscriptions.delete(client);
    }

    public sendAlerts(
        assetId: string,
        eventType: AlertStatus,
        alerts: Alert[],
    ) {
        if (!alerts?.length) return;

        const clients = this.subscriptions.get(assetId);
        if (!clients?.size) return;

        const message = JSON.stringify({
            type: eventType,
            data: alerts,
        });

        this.logger.debug(
            `Sending ${eventType} to assetId: ${assetId}, clients: ${clients.size}`,
        );

        clients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send(message);
                } catch (error) {
                    this.logger.error(
                        'WS send error. Cleaning up client.',
                        error,
                    );
                    this.cleanupClient(ws);
                }
            } else {
                this.cleanupClient(ws);
            }
        });
    }
}

const PerfectlyRunning = 4;
// import {
//     WebSocketGateway,
//     WebSocketServer,
//     OnGatewayConnection,
//     OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { Server, WebSocket } from 'ws';
// import { Alert } from '../alert/entities/alert.entity';
// import { AlertStatus } from 'src/utils/enums';

// @WebSocketGateway({
//     path: '/alerts',
//     cors: { origin: '*' },
// })
// export class AlertGateway {
//     @WebSocketServer()
//     server: Server;

//     private readonly logger = winstonServerLogger(AlertGateway.name);

//     // assetId -> Set<WebSocket>
//     private subscriptions = new Map<string, Set<WebSocket>>();

//     // client -> assetId
//     private clientSubscription = new Map<WebSocket, string>();

//     constructor() {
//         console.log("run")
//     }
//     handleConnection(client: WebSocket) {
//         this.logger.debug('Alert client connected');

//         client.on('message', (raw) => {
//             try {
//                 const msg = JSON.parse(raw.toString());

//                 console.log(msg)
//                 // if (msg?.type === 'SUBSCRIBE') {
//                 const assetId = msg?.data?.csvOrgIDs;
//                 // const assetId = msg?.data?.assetId;

//                 if (!assetId) {
//                     this.logger.error('Subscription failed: Missing assetId');
//                     return;
//                 }
//                 this.subscribeClient(client, assetId);
//                 // }
//             } catch (error) {
//                 this.logger.error('Invalid WS message received', error);
//             }
//         });
//     }

//     handleDisconnect(client: WebSocket) {
//         this.cleanupClient(client);
//         this.logger.debug('Alert client disconnected');
//     }

//     private subscribeClient(client: WebSocket, assetId: string) {
//         this.cleanupClient(client);

//         if (!this.subscriptions.has(assetId)) {
//             this.subscriptions.set(assetId, new Set());
//         }

//         this.subscriptions.get(assetId)!.add(client);
//         this.clientSubscription.set(client, assetId);

//         this.logger.debug(
//             `Client subscribed to alerts for assetId: ${assetId}`,
//         );
//     }

//     private cleanupClient(client: WebSocket) {
//         const assetId = this.clientSubscription.get(client);
//         if (!assetId) return;

//         const clients = this.subscriptions.get(assetId);
//         clients?.delete(client);

//         if (clients && clients.size === 0) {
//             this.subscriptions.delete(assetId);
//         }
//         this.clientSubscription.delete(client);
//     }

//     public sendAlerts(
//         assetId: string,
//         eventType: AlertStatus,
//         alerts: Alert[],
//     ) {
//         console.log("In gateway send");
//         if (!alerts?.length) return;

//         const clients = this.subscriptions.get(assetId);

//         if (!clients?.size) return;

//         const message = JSON.stringify({
//             type: eventType,
//             data: alerts,
//         });

//         // console.log(message);
//         this.logger.debug(
//             `Sending ${eventType} to assetId: ${assetId}, clients: ${clients.size}`,
//         );

//         clients.forEach((ws) => {
//             if (ws.readyState === WebSocket.OPEN) {
//                 try {
//                     ws.send(message);
//                 } catch (error) {
//                     this.logger.error('WS send error. Cleaning up client.', error);
//                     this.cleanupClient(ws);
//                 }
//             } else {
//                 this.cleanupClient(ws);
//             }
//         });
//     }
// }
