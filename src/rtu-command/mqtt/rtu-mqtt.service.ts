// import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { connect, MqttClient } from 'mqtt';
// import { RtuMqttMessageHandler, RtuMqttPublishOptions } from './rtu-mqtt.types';
// import { RTU_MQTT_QOS, RTU_MQTT_RESPONSE_TOPIC, RTU_MQTT_RETAIN } from 'src/app_config/constants';

// @Injectable()
// export class RtuMqttService implements OnModuleInit, OnModuleDestroy {
//     private readonly logger = new Logger(
//         RtuMqttService.name,
//     );

//     private mqttClient?: MqttClient;
//     private isConnected = false;

//     private readonly messageHandlers = new Set<RtuMqttMessageHandler>();

//     constructor(
//         private readonly configService: ConfigService,
//     ) { }


//     async onModuleInit(): Promise<void> {
//         await this.connect();
//     }

//     private async connect(): Promise<void> {
// const host = this.configService.getOrThrow<string>('RTU_MQTT_BROKER_SERVER');
// const port = this.configService.getOrThrow<number>('RTU_MQTT_BROKER_PORT');
// const username = this.configService.getOrThrow<string>('RTU_MQTT_BROKER_USERNAME');
// const password = this.configService.getOrThrow<string>('RTU_MQTT_BROKER_PASSWORD');
// const url = `mqtt://${host}:${port}`;

// this.logger.log(`Connecting RTU MQTT client to ${url}`);

//         this.mqttClient = connect(url, {
//             username: username,
//             password: password,
//             clean: true,
//             connectTimeout: 4000,
//             reconnectPeriod: 1000,
//         });

//         this.registerClientEvents();

//         await this.waitForConnect();
//     }

//     private registerClientEvents() {
//         if (!this.mqttClient) {
//             return;
//         }

//         this.mqttClient.on('connect', async () => {
//             this.isConnected = true;

//             this.logger.log('RTU MQTT connected');

//             try {
//                 await this.subscribeToResponseTopic();

//                 this.logger.log(`RTU MQTT subscribed: ${RTU_MQTT_RESPONSE_TOPIC}`);
//             }
//             catch (error) {
//                 this.logger.error(`RTU MQTT subscription failed: ${error}`);
//             }
//         });

//         this.mqttClient.on('reconnect', () => {
//             this.isConnected = false;

//             this.logger.log('RTU MQTT reconnecting...');
//         });

//         this.mqttClient.on('offline', () => {
//             this.isConnected = false;

//             this.logger.warn('RTU MQTT offline');
//         });

//         this.mqttClient.on('close', () => {
//             this.isConnected = false;

//             this.logger.warn('RTU MQTT connection closed');
//         });

//         this.mqttClient.on('error', (error) => {
//             this.logger.error(`RTU MQTT error: ${error.message}`);
//         });

//         this.mqttClient.on('message', async (topic, message) => {
//             await this.handleMessage(topic, message);
//         });
//     }

//     private async subscribeToResponseTopic() {
//         await this.subscribe(RTU_MQTT_RESPONSE_TOPIC, RTU_MQTT_QOS);
//     }

//     async subscribe(topic: string, qos: 0 | 1 | 2 = RTU_MQTT_QOS) {

//         if (!this.mqttClient) {
//             throw new Error('RTU MQTT client is not initialized');
//         }

//         await new Promise<void>(
//             (resolve, reject) => {
//                 this.mqttClient!.subscribe(
//                     topic,
//                     { qos },

//                     (error) => {
//                         if (error) {
//                             reject(error);
//                             return;
//                         }

//                         resolve();
//                     },
//                 );
//             },
//         );
//     }

//     async publish(topic: string, payload: string, options: RtuMqttPublishOptions = {}) {

//         if (!this.mqttClient) {
//             throw new Error('RTU MQTT client is not initialized');
//         }

//         if (!this.isConnected) {
//             throw new Error('RTU MQTT client is not connected');
//         }

//         const qos = options.qos ?? RTU_MQTT_QOS;
//         const retain = options.retain ?? RTU_MQTT_RETAIN;

//         await new Promise<void>((resolve, reject) => {
//             this.mqttClient!.publish(
//                 topic,
//                 payload,
//                 {
//                     qos,
//                     retain,
//                 },

//                 (error) => {
//                     if (error) {
//                         reject(error);
//                         return;
//                     }

//                     resolve();
//                 },
//             );
//         },
//         );
//     }

//     addMessageHandler(handler: RtuMqttMessageHandler): () => void {
//         this.messageHandlers.add(handler);

//         return () => {
//             this.messageHandlers.delete(handler);
//         };
//     }

// private async handleMessage(topic: string, message: Buffer) {

//     for (const handler of this.messageHandlers) {
//         try {
//             await handler(
//                 topic,
//                 message,
//             );
//         } catch (error) {
//             this.logger.error(
//                 `RTU MQTT message handler error: ${error}`,
//             );
//         }
//     }
// }

//     private waitForConnect(): Promise<void> {
//         if (
//             this.mqttClient?.connected
//         ) {
//             return Promise.resolve();
//         }

//         return new Promise(
//             (resolve, reject) => {
//                 if (!this.mqttClient) {
//                     reject(
//                         new Error(
//                             'RTU MQTT client is not initialized',
//                         ),
//                     );

//                     return;
//                 }

//                 const timeout = setTimeout(() => {
//                     cleanup();

//                     reject(
//                         new Error(
//                             'RTU MQTT connection timeout',
//                         ),
//                     );
//                 }, 10_000);

//                 const onConnect = () => {
//                     cleanup();
//                     resolve();
//                 };

//                 const onError = (
//                     error: Error,
//                 ) => {
//                     cleanup();
//                     reject(error);
//                 };

//                 const cleanup = () => {
//                     clearTimeout(timeout);

//                     this.mqttClient?.removeListener(
//                         'connect',
//                         onConnect,
//                     );

//                     this.mqttClient?.removeListener(
//                         'error',
//                         onError,
//                     );
//                 };

//                 this.mqttClient.once(
//                     'connect',
//                     onConnect,
//                 );

//                 this.mqttClient.once(
//                     'error',
//                     onError,
//                 );
//             },
//         );
//     }

//     async onModuleDestroy(): Promise<void> {
//         if (!this.mqttClient) {
//             return;
//         }

//         await new Promise<void>(
//             (resolve) => {
//                 this.mqttClient!.end(
//                     false,
//                     {},
//                     () => resolve(),
//                 );
//             },
//         );
//     }
// }

import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as mqtt from 'mqtt';
import { MqttClient } from 'mqtt';
import { RTU_MQTT_COMMAND_TOPIC_PREFIX, RTU_MQTT_COMMAND_TOPIC_SUFFIX, RTU_MQTT_QOS, RTU_MQTT_RESPONSE_TOPIC, RTU_MQTT_RETAIN } from 'src/app_config/constants';



export interface RtuMqttPublishOptions {
    qos?: 0 | 1 | 2;
    retain?: boolean;
}

type RtuMessageHandler = (
    topic: string,
    message: Buffer,
) => Promise<void> | void;

@Injectable()
export class RtuMqttService
    implements OnModuleInit, OnModuleDestroy {
    private readonly logger =
        new Logger(RtuMqttService.name);

    private mqttClient?: MqttClient;

    private isConnected = false;

    constructor(
        private readonly configService: ConfigService,

    ) { }

    private readonly messageHandlers =
        new Set<RtuMessageHandler>();

    async onModuleInit(): Promise<void> {
        await this.connect();
    }

    async onModuleDestroy(): Promise<void> {
        if (this.mqttClient) {
            await new Promise<void>((resolve) => {
                this.mqttClient!.end(false, {}, () => {
                    resolve();
                });
            });
        }
    }

    // ---------------------------------------------------------
    // CONNECT
    // ---------------------------------------------------------

    private async connect(): Promise<void> {

        const host = this.configService.getOrThrow<string>('RTU_MQTT_BROKER_SERVER');
        const port = this.configService.getOrThrow<number>('RTU_MQTT_BROKER_PORT');
        const username = this.configService.getOrThrow<string>('RTU_MQTT_BROKER_USERNAME');
        const password = this.configService.getOrThrow<string>('RTU_MQTT_BROKER_PASSWORD');
        const url = `mqtt://${host}:${port}`;

        this.logger.log(`Connecting RTU MQTT client to ${url}`);

        this.mqttClient = mqtt.connect(
            url,
            {
                username: username,
                password: password,

                reconnectPeriod: 5000,

                clean: true,
            },
        );

        this.mqttClient.on(
            'connect',
            async () => {
                this.isConnected = true;

                this.logger.log(
                    'RTU MQTT connected',
                );

                await this.subscribeToResponses();
            },
        );

        this.mqttClient.on(
            'reconnect',
            () => {
                this.logger.warn(
                    'RTU MQTT reconnecting...',
                );
            },
        );

        this.mqttClient.on(
            'close',
            () => {
                this.isConnected = false;

                this.logger.warn(
                    'RTU MQTT connection closed',
                );
            },
        );

        this.mqttClient.on(
            'error',
            (error) => {
                this.logger.error(
                    `RTU MQTT error: ${error.message}`,
                );
            },
        );

        // THIS receives RMU responses
        this.mqttClient.on(
            'message',
            async (topic, message) => {
                for (
                    const handler
                    of this.messageHandlers
                ) {
                    try {
                        await handler(
                            topic,
                            message,
                        );
                    } catch (error) {
                        this.logger.error(
                            `RTU MQTT message handler failed: ${error instanceof Error
                                ? error.message
                                : String(error)
                            }`,
                        );
                    }
                }
            },
        );
    }

    // ---------------------------------------------------------
    // RESPONSE SUBSCRIPTION
    // ---------------------------------------------------------

    private async subscribeToResponses(): Promise<void> {
        if (!this.mqttClient) {
            return;
        }

        await new Promise<void>(
            (resolve, reject) => {
                this.mqttClient!.subscribe(
                    RTU_MQTT_RESPONSE_TOPIC,
                    {
                        qos: 1,
                    },
                    (error) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        this.logger.log(
                            `Subscribed to RTU response topic: ${RTU_MQTT_RESPONSE_TOPIC}`,
                        );

                        resolve();
                    },
                );
            },
        );
    }

    // ---------------------------------------------------------
    // PUBLISH
    // ---------------------------------------------------------

    async publish(
        topic: string,
        payload: string,
        options: RtuMqttPublishOptions = {},
    ): Promise<void> {
        if (!this.mqttClient) {
            throw new Error(
                'RTU MQTT client is not initialized',
            );
        }

        if (!this.isConnected) {
            throw new Error(
                'RTU MQTT client is not connected',
            );
        }

        const qos =
            options.qos ?? RTU_MQTT_QOS;

        const retain =
            options.retain ?? RTU_MQTT_RETAIN;

        await new Promise<void>(
            (resolve, reject) => {
                this.mqttClient!.publish(
                    topic,
                    payload,
                    {
                        qos,
                        retain,
                    },
                    (error) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve();
                    },
                );
            },
        );
    }

    // ---------------------------------------------------------
    // MESSAGE HANDLER REGISTRATION
    // ---------------------------------------------------------

    addMessageHandler(
        handler: RtuMessageHandler,
    ): () => void {
        this.messageHandlers.add(handler);

        return () => {
            this.messageHandlers.delete(
                handler,
            );
        };
    }


    private async handleMessage(topic: string, message: Buffer) {

        for (const handler of this.messageHandlers) {
            try {
                await handler(
                    topic,
                    message,
                );
            } catch (error) {
                this.logger.error(
                    `RTU MQTT message handler error: ${error}`,
                );
            }
        }
    }

    buildCommandTopic(
        clientDeviceId: string,
    ): string {
        return [
            RTU_MQTT_COMMAND_TOPIC_PREFIX,
            clientDeviceId,
            RTU_MQTT_COMMAND_TOPIC_SUFFIX,
        ].join('/');
    }
}