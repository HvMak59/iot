// export type RtuMqttMessageHandler = (
//     topic: string,
//     message: Buffer,
// ) => void | Promise<void>;

// export interface RtuMqttPublishOptions {
//     qos?: 0 | 1 | 2;
//     retain?: boolean;
// }

export interface RtuMqttPublishOptions {
    qos?: 0 | 1 | 2;
    retain?: boolean;
}

export type RtuMqttMessageHandler = (
    topic: string,
    message: string,
) => void | Promise<void>;