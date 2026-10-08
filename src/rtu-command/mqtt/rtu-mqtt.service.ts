import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { MqttClient } from 'mqtt';
import { RTU_MQTT_COMMAND_TOPIC_PREFIX, RTU_MQTT_COMMAND_TOPIC_SUFFIX, RTU_MQTT_QOS, RTU_MQTT_RESPONSE_TOPIC, RTU_MQTT_RETAIN } from 'src/app_config/constants';
import { winstonRtuCommunicationLogger } from 'src/app_config/serverWinston.config';
import { RtuCommandGateway } from '../websocket-gateway/rtu-command.gateway';
import { SseService } from 'src/sse/sse.service';

@Injectable()
export class RtuMqttService implements OnModuleInit {
    private readonly logger = winstonRtuCommunicationLogger(RtuMqttService.name);

    private mqttClient?: MqttClient;
    private isConnected = false;
    private pendingResponses = new Map<
        string,
        {
            resolve: (value: any) => void;
            reject: (error: Error) => void;
            timeout: NodeJS.Timeout;
        }
    >();
    constructor(
        private readonly configService: ConfigService,
        private readonly rtuCommandGateway: RtuCommandGateway,
        private readonly sseService: SseService,
    ) { }

    async onModuleInit() {
        await this.connect();
    }

    // async onModuleDestroy() {
    //     if (this.mqttClient) {
    //         await new Promise<void>((resolve) => {
    //             this.mqttClient!.end(false, {}, () => {
    //                 resolve();
    //             });
    //         });
    //     }
    // }

    private async connect() {

        const host = this.configService.getOrThrow<string>('RTU_MQTT_BROKER_SERVER');
        const port = this.configService.getOrThrow<number>('RTU_MQTT_BROKER_PORT');
        const username = this.configService.getOrThrow<string>('RTU_MQTT_BROKER_USERNAME');
        const password = this.configService.getOrThrow<string>('RTU_MQTT_BROKER_PASSWORD');
        const url = `mqtt://${host}:${port}`;

        this.logger.debug(`Connecting RTU MQTT client to ${url}`);

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
                this.logger.debug('RTU MQTT connected');

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


        // this.mqttClient.on(
        //     'message',
        //     (topic, message) => {

        //         try {

        //             const response = JSON.parse(message.toString());

        //             this.logger.debug(
        //                 JSON.stringify({
        //                     direction: 'INCOMING',
        //                     topic,
        //                     response,
        //                 }),
        //             );

        //             // Send RTU response to UI
        //             this.rtuCommandGateway.sendRtuResponse({
        //                 topic,
        //                 ...response,
        //             });

        //         } catch (error) {

        //             this.logger.error(
        //                 `Failed to process RTU MQTT response: ${error.message} `,
        //             );

        //         }

        //     },
        // );



        this.mqttClient.on(
            'message',
            (topic, message) => {

                try {

                    const response = JSON.parse(
                        message.toString(),
                    );

                    this.logger.debug(
                        JSON.stringify({
                            direction: 'INCOMING',
                            topic,
                            response,
                        }),
                    );
                    const pending = this.pendingResponses.get(response.msgId);

                    if (!pending) {
                        return;
                    }

                    clearTimeout(pending.timeout);

                    this.pendingResponses.delete(
                        response.msgId,
                    );

                    pending.resolve({
                        topic,
                        response,
                    });

                } catch (error) {

                    this.logger.error(
                        `Failed to process RTU MQTT response: ${error.message}`,
                    );

                }
            },
        );
        // this.mqttClient.on(
        //     'message',
        //     (topic, message) => {
        //         const response = JSON.parse(message.toString());

        //         this.logger.debug(
        //             JSON.stringify({
        //                 direction: 'INCOMING',
        //                 topic,
        //                 response,
        //             }),
        //         );
        //     },
        // );


        const r = ''
        //  this.mqttClient.on(
        //     'message',
        //     (topic, message) => {

        //         try {

        //             const response = JSON.parse(
        //                 message.toString(),
        //             );

        //             this.logger.debug(
        //                 JSON.stringify({
        //                     direction: 'INCOMING',
        //                     topic,
        //                     response,
        //                 }),
        //             );

        //             this.sseService.publishRtu(
        //                 response.msgId,
        //                 {
        //                     data: {
        //                         topic,
        //                         ...response,
        //                     },
        //                 },
        //             );

        //         } catch (error) {

        //             this.logger.error(
        //                 `Failed to process RTU MQTT response: ${error.message}`,
        //             );

        //         }
        //     },
        // );

    }


    private async subscribeToResponses() {
        const fnName = this.subscribeToResponses.name;

        this.logger.debug(`${fnName}: Subscribing to RTU response topic: ${RTU_MQTT_RESPONSE_TOPIC}`);

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

                        this.logger.debug(
                            `Subscribed to RTU response topic: ${RTU_MQTT_RESPONSE_TOPIC}`,
                        );

                        resolve();
                    },
                );
            },
        );
    }

    async publish(
        topic: string,
        payload: string,
    ) {
        const fnName = this.publish.name;
        const input = `topic: ${topic}, payload: ${payload}`;

        this.logger.debug(`${fnName}: Publishing RTU command: ${input}`);

        if (!this.mqttClient) {
            this.logger.error('RTU MQTT client is not initialized');
            throw new Error('RTU MQTT client is not initialized');
        }

        if (!this.isConnected) {
            this.logger.error('RTU MQTT client is not connected');
            throw new Error('RTU MQTT client is not connected');
        }

        const qos = RTU_MQTT_QOS;
        const retain = RTU_MQTT_RETAIN;

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

    // async waitForResponse(msgId: string): Promise<any> {
    //     if (!this.mqttClient) {
    //         throw new Error('RTU MQTT client is not initialized');
    //     }

    //     return new Promise((resolve, reject) => {

    //         const timeout = setTimeout(() => {
    //             this.mqttClient!.removeListener('message', messageHandler);

    //             reject(
    //                 new Error(
    //                     `Timeout waiting for RTU response. msgId: ${msgId}`,
    //                 ),
    //             );
    //         }, 10000);

    //         const messageHandler = (
    //             topic: string,
    //             message: Buffer,
    //         ) => {

    //             try {

    //                 const response = JSON.parse(
    //                     message.toString(),
    //                 );

    //                 if (response.msgId !== msgId) {
    //                     return;
    //                 }

    //                 clearTimeout(timeout);

    //                 this.mqttClient!.removeListener(
    //                     'message',
    //                     messageHandler,
    //                 );

    //                 resolve({
    //                     topic,
    //                     response,
    //                 });

    //             } catch (error) {
    //                 // Ignore messages which are not valid JSON
    //             }
    //         };

    //         this.mqttClient!.on(
    //             'message',
    //             messageHandler,
    //         );
    //     });
    // }

    async waitForResponse(msgId: string): Promise<any> {

        if (!this.mqttClient) {
            throw new Error(
                'RTU MQTT client is not initialized',
            );
        }

        return new Promise((resolve, reject) => {

            const timeout = setTimeout(() => {

                this.pendingResponses.delete(msgId);

                reject(
                    new Error(
                        `Timeout waiting for RTU response. msgId: ${msgId}`,
                    ),
                );

            }, 10000);

            this.pendingResponses.set(
                msgId,
                {
                    resolve,
                    reject,
                    timeout,
                },
            );

        });
    }


    buildCommandTopic(rmuDeviceId: string) {
        const fnName = this.buildCommandTopic.name;
        const input = `rmuDeviceId: ${rmuDeviceId}`;

        this.logger.debug(`${fnName}: Building RTU command topic for rmuDeviceId ${input}`);

        return [
            RTU_MQTT_COMMAND_TOPIC_PREFIX,
            rmuDeviceId,
            RTU_MQTT_COMMAND_TOPIC_SUFFIX,
        ].join('/');
    }
}