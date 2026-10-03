import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { MqttClient } from 'mqtt';
import { RTU_MQTT_COMMAND_TOPIC_PREFIX, RTU_MQTT_COMMAND_TOPIC_SUFFIX, RTU_MQTT_QOS, RTU_MQTT_RESPONSE_TOPIC, RTU_MQTT_RETAIN } from 'src/app_config/constants';
import { winstonRtuCommunicationLogger } from 'src/app_config/serverWinston.config';

@Injectable()
export class RtuMqttService implements OnModuleInit {
    private readonly logger = winstonRtuCommunicationLogger(RtuMqttService.name);

    private mqttClient?: MqttClient;
    private isConnected = false;

    constructor(
        private readonly configService: ConfigService,
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

        this.mqttClient.on(
            'message',
            (topic, message) => {
                const response = JSON.parse(message.toString());

                this.logger.debug(
                    JSON.stringify({
                        direction: 'INCOMING',
                        topic,
                        response,
                    }),
                );
            },
        );

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