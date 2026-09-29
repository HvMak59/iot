// import {
//     BadRequestException,
//     GatewayTimeoutException,
//     Injectable,
//     NotFoundException,
//     OnModuleInit,
// } from '@nestjs/common';

// import { InjectRepository } from '@nestjs/typeorm';

// import {
//     Repository,
// } from 'typeorm';

// import { randomUUID } from 'crypto';
// import { Asset } from '../asset/entities/asset.entity';

// import { Device } from '../device/entities/device.entity';

// import { CurrentTelemetryPayload } from '../current-telemetry-payload/entities/current-telemetry-payload.entity';

// import { RtuMqttService } from './mqtt/rtu-mqtt.service';

// import {
//     RTU_COMMAND_TYPE_READ,
//     RTU_COMMAND_TYPE_WRITE,
//     RTU_DATA_TYPE,
//     RTU_FIELD_SIZE,
//     RTU_MQTT_COMMAND_SUFFIX,
//     RTU_MQTT_TOPIC_PREFIX,
//     RTU_MULTIPLIER,
//     RTU_RESPONSE_TIMEOUT_MS,
//     RTU_VALUE_TYPE,
//     RTU_MSG_ID_LENGTH,
// } from 'src/app_config/constants';

// import {
//     PendingRtuRequest,
//     RtuCommand,
//     RtuReadCommand,
//     RtuResolvedTarget,
//     RtuResponse,
//     RtuWriteCommand,
// } from './interfaces/rtu-command.interface';

// import { ReadRtuCommandDto } from './dto/read-rtu-command.dto';

// import { WriteRtuCommandDto } from './dto/write-rtu-command.dto';

// import { RtuCommunicationLogger } from './logger/rtu-communication.logger';

// @Injectable()
// export class RtuCommandService
//     implements OnModuleInit {
//     private readonly pendingRequests =
//         new Map<string, PendingRtuRequest>();

//     private removeMqttHandler?: () => void;

//     constructor(
//         @InjectRepository(Asset)
//         private readonly assetRepository:
//             Repository<Asset>,

//         @InjectRepository(Device)
//         private readonly deviceRepository:
//             Repository<Device>,

//         @InjectRepository(CurrentTelemetryPayload)
//         private readonly currentTelemetryRepository:
//             Repository<CurrentTelemetryPayload>,

//         private readonly rtuMqttService: RtuMqttService,

//         private readonly rtuLogger: RtuCommunicationLogger,
//     ) { }

//     onModuleInit(): void {
//         this.removeMqttHandler =
//             this.rtuMqttService.addMessageHandler(
//                 async (topic, message) => {
//                     await this.handleMqttResponse(
//                         topic,
//                         message,
//                     );
//                 },
//             );
//     }

//     private a = "read"; // this was waiting for rmu response
//     // async read(
//     //     dto: ReadRtuCommandDto,
//     // ): Promise<RtuResponse> {
//     //     console.log("in read service");
//     //     const target = await this.resolveTarget({
//     //         assetId: dto.assetId,
//     //         slaveId: dto.slaveId,
//     //         clientDeviceId: dto.clientDeviceId,
//     //     });

//     //     const msgId = this.generateMsgId();

//     //     const command: RtuReadCommand = {
//     //         msgId,
//     //         timestamp: new Date().toISOString(),
//     //         type: RTU_COMMAND_TYPE_READ,
//     //         slaveId: target.slaveId,
//     //         param: dto.param,
//     //         addr: dto.addr,
//     //         dataType: RTU_DATA_TYPE,
//     //         valueType: RTU_VALUE_TYPE,
//     //         multiplier: RTU_MULTIPLIER,
//     //         fieldSize: RTU_FIELD_SIZE,
//     //     };

//     //     console.log("read command", command);

//     //     return this.sendCommand(
//     //         target,
//     //         command,
//     //     );
//     // }

//     async read(dto: ReadRtuCommandDto) {
//         const target = await this.resolveTarget({
//             assetId: dto.assetId,
//             slaveId: dto.slaveId,
//             clientDeviceId: dto.clientDeviceId,
//         });

//         const command: RtuReadCommand = {
//             msgId: this.generateMsgId(),
//             timestamp: new Date().toISOString(),
//             type: RTU_COMMAND_TYPE_READ,
//             slaveId: target.slaveId,
//             param: dto.param,
//             addr: dto.addr,
//             dataType: RTU_DATA_TYPE,
//             valueType: RTU_VALUE_TYPE,
//             multiplier: RTU_MULTIPLIER,
//             fieldSize: RTU_FIELD_SIZE,
//         };

//         const topic = this.buildCommandTopic(
//             target.clientDeviceId,
//         );

//         await this.rtuMqttService.publish(
//             topic,
//             JSON.stringify(command),
//             {
//                 qos: 1,
//                 retain: false,
//             },
//         );

//         this.rtuLogger.logOutgoing({
//             assetId: target.assetId,
//             deviceId: target.deviceId,
//             clientDeviceId: target.clientDeviceId,
//             slaveId: target.slaveId,
//             msgId: command.msgId,
//             topic,
//             command,
//         });

//         return {
//             success: true,
//             message: 'RTU read command published successfully',
//             msgId: command.msgId,
//         };
//     }
//     /**
//      * ------------------------------------------------------------
//      * WRITE
//      * ------------------------------------------------------------
//      */
//     async write(
//         dto: WriteRtuCommandDto,
//     ): Promise<RtuResponse> {
//         const target =
//             await this.resolveTarget({
//                 assetId: dto.assetId,
//                 slaveId: dto.slaveId,
//                 clientDeviceId:
//                     dto.clientDeviceId,
//             });

//         const msgId = this.generateMsgId();

//         const command: RtuWriteCommand = {
//             msgId,

//             timestamp:
//                 new Date().toISOString(),

//             type: RTU_COMMAND_TYPE_WRITE,

//             slaveId: target.slaveId,

//             param: dto.param,

//             newValue: dto.newValue,

//             dataType:
//                 RTU_DATA_TYPE,

//             valueType:
//                 RTU_VALUE_TYPE,

//             multiplier:
//                 RTU_MULTIPLIER,

//             fieldSize:
//                 RTU_FIELD_SIZE,
//         };

//         return this.sendCommand(
//             target,
//             command,
//         );
//     }

//     /**
//      * ------------------------------------------------------------
//      * TARGET RESOLUTION
//      * ------------------------------------------------------------
//      *
//      * Priority:
//      *
//      * 1. Explicit clientDeviceId
//      * 2. CurrentTelemetryPayload mapping
//      *
//      * slaveId:
//      *
//      * 1. Explicit DTO slaveId
//      * 2. CurrentTelemetryPayload slaveId
//      */
//     private async resolveTarget(input: {
//         assetId: string;
//         slaveId?: number;
//         clientDeviceId?: string;
//     }): Promise<RtuResolvedTarget> {
//         console.log("in resolvetarget service");
//         const asset =
//             await this.assetRepository.findOne({
//                 where: {
//                     id: input.assetId,
//                 },
//             });

//         if (!asset) {
//             throw new NotFoundException(
//                 `Asset not found: ${input.assetId}`,
//             );
//         }
//         console.log("found asset");

//         /**
//          * ----------------------------------------------------------
//          * CASE 1
//          * Explicit clientDeviceId supplied
//          * ----------------------------------------------------------
//          */
//         console.log(input.clientDeviceId);
//         if (input.clientDeviceId) {
//             const device = await this.deviceRepository.findOne({
//                 where: {
//                     clientDeviceId: input.clientDeviceId,
//                 },
//             });

//             if (!device) {
//                 throw new NotFoundException(
//                     `Device not found for clientDeviceId: ${input.clientDeviceId}`,
//                 );
//             }

//             if (!device.clientDeviceId) {
//                 throw new BadRequestException(
//                     `Device ${device.id} does not have clientDeviceId`,
//                 );
//             }

//             /**
//              * If slaveId is also explicitly supplied,
//              * we don't need telemetry to resolve it.
//              */
//             if (input.slaveId !== undefined) {
//                 console.log("is slaveId provided");
//                 const r = {
//                     assetId: input.assetId,
//                     deviceId: device.id,
//                     clientDeviceId: device.clientDeviceId,
//                     slaveId: input.slaveId,
//                 };
//                 console.log(r);
//                 return r;
//             }

//             /**
//              * Otherwise find slaveId through
//              * CurrentTelemetryPayload.
//              */
//             const telemetry = await this.currentTelemetryRepository.find(
//                 {
//                     where: {
//                         assetId: input.assetId,
//                         deviceId: device.id,
//                     },
//                 },
//             );

//             const slaveIds = this.uniqueSlaveIds(
//                 telemetry,
//             );

//             if (slaveIds.length === 0) {
//                 throw new BadRequestException(
//                     `slaveId not found in CurrentTelemetryPayload for asset ${input.assetId} and device ${device.id}. Please provide slaveId manually.`,
//                 );
//             }

//             if (slaveIds.length > 1) {
//                 throw new BadRequestException(
//                     `Multiple slaveIds found for device ${device.id}: ${slaveIds.join(', ')}. Please provide slaveId manually.`,
//                 );
//             }

//             return {
//                 assetId: input.assetId,
//                 deviceId: device.id,
//                 clientDeviceId: device.clientDeviceId,
//                 slaveId: slaveIds[0],
//             };
//         }

//         /**
//          * ----------------------------------------------------------
//          * CASE 2
//          * No clientDeviceId supplied.
//          *
//          * We must resolve it using CurrentTelemetryPayload.
//          * ----------------------------------------------------------
//          */

//         const telemetry =
//             await this.currentTelemetryRepository.find(
//                 {
//                     where: {
//                         assetId: input.assetId,
//                     },
//                 },
//             );

//         const candidates =
//             this.buildCandidates(
//                 telemetry,
//                 input.slaveId,
//             );

//         if (candidates.length === 0) {
//             if (
//                 input.slaveId !== undefined
//             ) {
//                 throw new NotFoundException(
//                     `No device mapping found for asset ${input.assetId} and slaveId ${input.slaveId}`,
//                 );
//             }

//             throw new NotFoundException(
//                 `No CurrentTelemetryPayload mapping found for asset ${input.assetId}`,
//             );
//         }

//         /**
//          * Never silently choose one RMU when multiple
//          * RMUs/slaves are possible.
//          */
//         if (candidates.length > 1) {
//             throw new BadRequestException(
//                 `Multiple RTU targets found for asset ${input.assetId}. Please provide clientDeviceId and/or slaveId explicitly.`,
//             );
//         }

//         const candidate =
//             candidates[0];

//         if (!candidate.deviceId) {
//             throw new BadRequestException(
//                 `CurrentTelemetryPayload does not contain deviceId for asset ${input.assetId}`,
//             );
//         }

//         const device =
//             await this.deviceRepository.findOne({
//                 where: {
//                     id: candidate.deviceId,
//                 },
//             });

//         if (!device) {
//             throw new NotFoundException(
//                 `Device not found: ${candidate.deviceId}`,
//             );
//         }

//         if (!device.clientDeviceId) {
//             throw new BadRequestException(
//                 `Device ${device.id} does not have clientDeviceId`,
//             );
//         }

//         if (
//             candidate.slaveId === undefined
//         ) {
//             throw new BadRequestException(
//                 `slaveId could not be resolved. Please provide slaveId manually.`,
//             );
//         }

//         return {
//             assetId: input.assetId,

//             deviceId: device.id,

//             clientDeviceId:
//                 device.clientDeviceId,

//             slaveId:
//                 candidate.slaveId,
//         };
//     }

//     /**
//      * ------------------------------------------------------------
//      * BUILD UNIQUE CANDIDATES
//      * ------------------------------------------------------------
//      */
//     private buildCandidates(
//         telemetry: CurrentTelemetryPayload[],
//         requestedSlaveId?: number,
//     ): Array<{
//         deviceId?: string;
//         slaveId?: number;
//     }> {
//         const result = new Map<
//             string,
//             {
//                 deviceId?: string;
//                 slaveId?: number;
//             }
//         >();

//         for (const record of telemetry) {
//             if (
//                 !record.deviceId
//             ) {
//                 continue;
//             }

//             if (
//                 record.slaveId === undefined ||
//                 record.slaveId === null ||
//                 record.slaveId === ''
//             ) {
//                 continue;
//             }

//             const slaveId =
//                 Number(record.slaveId);

//             if (
//                 !Number.isInteger(slaveId)
//             ) {
//                 continue;
//             }

//             if (
//                 requestedSlaveId !== undefined &&
//                 slaveId !== requestedSlaveId
//             ) {
//                 continue;
//             }

//             const key =
//                 `${record.deviceId}:${slaveId}`;

//             result.set(
//                 key,
//                 {
//                     deviceId:
//                         record.deviceId,

//                     slaveId,
//                 },
//             );
//         }

//         return [
//             ...result.values(),
//         ];
//     }

//     /**
//      * ------------------------------------------------------------
//      * SEND COMMAND
//      * ------------------------------------------------------------
//      */
//     private async sendCommand(
//         target: RtuResolvedTarget,
//         command: RtuCommand,
//     ): Promise<RtuResponse> {
//         const topic =
//             this.buildCommandTopic(
//                 target.clientDeviceId,
//             );

//         console.log("topic", topic)
//         const payload = JSON.stringify(command);

//         /**
//          * VERY IMPORTANT:
//          *
//          * Add pending request BEFORE publishing.
//          *
//          * Otherwise an extremely fast RMU response could arrive
//          * before the request is registered.
//          */
//         const responsePromise = this.createPendingRequest(
//             target,
//             command,
//         );

//         try {
//             await this.rtuMqttService.publish(
//                 topic,
//                 payload,
//                 {
//                     qos: 1,
//                     retain: false,
//                 },
//             );

//             this.rtuLogger.logOutgoing({
//                 assetId: target.assetId,
//                 deviceId: target.deviceId,
//                 clientDeviceId: target.clientDeviceId,
//                 slaveId: target.slaveId,
//                 msgId: command.msgId,
//                 topic,
//                 command,
//             });
//         } catch (error) {
//             this.removePendingRequest(
//                 command.msgId,
//             );

//             this.rtuLogger.logError({
//                 event:
//                     'MQTT_PUBLISH_FAILED',

//                 assetId:
//                     target.assetId,

//                 deviceId:
//                     target.deviceId,

//                 clientDeviceId:
//                     target.clientDeviceId,

//                 slaveId:
//                     target.slaveId,

//                 msgId:
//                     command.msgId,

//                 topic,

//                 error:
//                     this.errorMessage(error),
//             });

//             throw error;
//         }

//         return responsePromise;
//     }

//     /**
//      * ------------------------------------------------------------
//      * CREATE PENDING REQUEST
//      * ------------------------------------------------------------
//      */
//     private createPendingRequest(
//         target: RtuResolvedTarget,
//         command: RtuCommand,
//     ): Promise<RtuResponse> {
//         return new Promise((resolve, reject) => {
//             const pending: PendingRtuRequest = {
//                 msgId: command.msgId,
//                 assetId: target.assetId,
//                 deviceId: target.deviceId,
//                 clientDeviceId: target.clientDeviceId,
//                 slaveId: target.slaveId,
//                 command,
//                 createdAt: Date.now(),
//                 resolve,
//                 reject,
//             };

//             this.pendingRequests.set(
//                 command.msgId,
//                 pending,
//             );
//         });
//     }

//     /**
//      * ------------------------------------------------------------
//      * HANDLE MQTT RESPONSE
//      * ------------------------------------------------------------
//      */
//     private async handleMqttResponse(
//         topic: string,
//         message: Buffer,
//     ): Promise<void> {
//         const response = JSON.parse(message.toString());

//         const msgId = response.msgId;

//         if (!msgId) {
//             return;
//         }

//         const pending = this.pendingRequests.get(msgId);

//         if (!pending) {
//             // Response may be for an old/unknown request.
//             return;
//         }

//         this.pendingRequests.delete(msgId);

//         pending.resolve(response);
//     }


//     /**
//      * ------------------------------------------------------------
//      * TIMEOUT
//      * ------------------------------------------------------------
//      */
//     private handleTimeout(
//         msgId: string,
//     ): void {
//         const pending =
//             this.pendingRequests.get(
//                 msgId,
//             );

//         if (!pending) {
//             return;
//         }

//         this.pendingRequests.delete(
//             msgId,
//         );

//         this.rtuLogger.logTimeout({
//             assetId:
//                 pending.assetId,

//             deviceId:
//                 pending.deviceId,

//             clientDeviceId:
//                 pending.clientDeviceId,

//             slaveId:
//                 pending.slaveId,

//             msgId,

//             topic:
//                 this.buildCommandTopic(
//                     pending.clientDeviceId,
//                 ),

//             timeoutMs:
//                 RTU_RESPONSE_TIMEOUT_MS,

//             command:
//                 pending.command,
//         });

//         pending.reject(
//             new GatewayTimeoutException(
//                 `No RTU response received within ${RTU_RESPONSE_TIMEOUT_MS}ms for msgId ${msgId}`,
//             ),
//         );
//     }

//     /**
//      * ------------------------------------------------------------
//      * REMOVE PENDING REQUEST
//      * ------------------------------------------------------------
//      */
//     private removePendingRequest(
//         msgId: string,
//     ): void {
//         const pending =
//             this.pendingRequests.get(
//                 msgId,
//             );

//         if (!pending) {
//             return;
//         }

//         this.pendingRequests.delete(
//             msgId,
//         );
//     }

//     /**
//      * ------------------------------------------------------------
//      * TOPICS
//      * ------------------------------------------------------------
//      */
//     private buildCommandTopic(
//         clientDeviceId: string,
//     ): string {
//         return [
//             RTU_MQTT_TOPIC_PREFIX,
//             clientDeviceId,
//             RTU_MQTT_COMMAND_SUFFIX,
//         ].join('/');
//     }

//     private extractClientDeviceId(
//         topic: string,
//     ): string | undefined {
//         const parts =
//             topic.split('/');

//         /**
//          * Expected:
//          *
//          * HrmsIOT
//          * Rtv
//          * 2026090001
//          * Cmd
//          * Pub
//          */

//         if (
//             parts.length !== 5
//         ) {
//             return undefined;
//         }

//         if (
//             parts[0] !== 'HrmsIOT' ||
//             parts[1] !== 'Rtv' ||
//             parts[3] !== 'Cmd' ||
//             parts[4] !== 'Pub'
//         ) {
//             return undefined;
//         }

//         return parts[2];
//     }

//     /**
//      * ------------------------------------------------------------
//      * MSG ID
//      * ------------------------------------------------------------
//      */
//     private generateMsgId(): string {
//         return randomUUID()
//             .replace(/-/g, '')
//             .substring(
//                 0,
//                 RTU_MSG_ID_LENGTH,
//             );
//     }

//     /**
//      * ------------------------------------------------------------
//      * HELPERS
//      * ------------------------------------------------------------
//      */
//     private uniqueSlaveIds(
//         telemetry: CurrentTelemetryPayload[],
//     ): number[] {
//         const result = new Set<number>();

//         for (const record of telemetry) {
//             if (
//                 record.slaveId === undefined ||
//                 record.slaveId === null ||
//                 record.slaveId === ''
//             ) {
//                 continue;
//             }

//             const slaveId =
//                 Number(record.slaveId);

//             if (
//                 Number.isInteger(slaveId)
//             ) {
//                 result.add(slaveId);
//             }
//         }

//         return [
//             ...result.values(),
//         ];
//     }

//     private errorMessage(
//         error: unknown,
//     ): string {
//         if (
//             error instanceof Error
//         ) {
//             return error.message;
//         }

//         return String(error);
//     }

//     async onModuleDestroy(): Promise<void> {
//         this.removeMqttHandler?.();

//         for (
//             const pending
//             of this.pendingRequests.values()
//         ) {
//             pending.reject(
//                 new Error(
//                     'RTU command service is shutting down',
//                 ),
//             );
//         }

//         this.pendingRequests.clear();
//     }
// }





import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { Asset } from 'src/asset/entities/asset.entity';
import { Device } from 'src/device/entities/device.entity';
import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';

import { RtuMqttService } from './mqtt/rtu-mqtt.service';
import {
    RtuReadCommand,
    RtuResolvedTarget,
    RtuWriteCommand,
} from './interfaces/rtu-command.interface';

import {
    RTU_COMMAND_TYPE_READ,
    RTU_COMMAND_TYPE_WRITE,
    RTU_DATA_TYPE,
    RTU_VALUE_TYPE,
    RTU_MULTIPLIER,
    RTU_FIELD_SIZE,
    RTU_MSG_ID_LENGTH,
} from 'src/app_config/constants';

import { ReadRtuCommandDto } from './dto/read-rtu-command.dto';
import { WriteRtuCommandDto } from './dto/write-rtu-command.dto';

import { RtuCommunicationLogger } from './logger/rtu-communication.logger';
import { AssetService } from 'src/asset/asset.service';
import { DeviceService } from 'src/device/device.service';
import { CurrentTelemetryPayloadService } from 'src/current-telemetry-payload/current-telemetry-payload.service';
import { FindDeviceDto } from 'src/device/dto/find-device.dto';

@Injectable()
export class RtuCommandService {
    constructor(
        private readonly assetService: AssetService,
        private readonly deviceService: DeviceService,
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
        private readonly rtuMqttService: RtuMqttService,
        private readonly rtuLogger: RtuCommunicationLogger,
    ) { }

    async read(dto: ReadRtuCommandDto) {
        // const target = await this.resolveTarget({
        //     assetId: dto.assetId,
        //     slaveId: Number(dto.slaveId),
        //     clientDeviceId: dto.clientDeviceId,
        // });

        // const command: RtuReadCommand = {
        //     msgId: this.generateMsgId(),
        //     timestamp: this.generateTimestamp(),
        //     type: RTU_COMMAND_TYPE_READ,
        //     slaveId: target.slaveId,
        //     param: dto.param,
        //     addr: dto.addr,
        //     dataType: RTU_DATA_TYPE,
        //     valueType: RTU_VALUE_TYPE,
        //     multiplier: RTU_MULTIPLIER,
        //     fieldSize: RTU_FIELD_SIZE,
        // };

        const command: RtuReadCommand = {
            slaveId: dto.slaveId!,
            msgId: this.generateMsgId(),
            timestamp: this.generateTimestamp(),
            type: RTU_COMMAND_TYPE_READ,
            param: dto.param,
            addr: dto.addr,
            dataType: RTU_DATA_TYPE,
            valueType: RTU_VALUE_TYPE,
            multiplier: RTU_MULTIPLIER,
            fieldSize: RTU_FIELD_SIZE,
        };

        return this.publishCommand(
            // target,
            dto.rmuDeviceId!,
            command,
        );
    }

    async write(dto: WriteRtuCommandDto) {
        // const target = await this.resolveTarget({
        //     assetId: dto.assetId,
        //     slaveId: dto.slaveId,
        //     clientDeviceId: dto.clientDeviceId,
        // });

        // const command: RtuWriteCommand = {
        //     slaveId: target.slaveId,
        //     msgId: this.generateMsgId(),
        //     timestamp: this.generateTimestamp(),
        //     type: RTU_COMMAND_TYPE_WRITE,
        //     addr: dto.addr,
        //     param: dto.param,
        //     value: dto.value,
        //     dataType: RTU_DATA_TYPE,
        //     valueType: RTU_VALUE_TYPE,
        // };

        const command: RtuWriteCommand = {
            slaveId: dto.slaveId!,
            msgId: this.generateMsgId(),
            timestamp: this.generateTimestamp(),
            type: RTU_COMMAND_TYPE_WRITE,
            addr: dto.addr,
            param: dto.param,
            value: dto.value,
            dataType: RTU_DATA_TYPE,
            valueType: RTU_VALUE_TYPE,
        };
        return this.publishCommand(
            dto.clientDeviceId!,
            command,
        );
    }

    private async publishCommand(
        // target: RtuResolvedTarget,
        clientDeviceId: string,
        command: RtuReadCommand | RtuWriteCommand,
    ) {
        const topic = this.buildCommandTopic(
            // target.clientDeviceId,
            clientDeviceId,
        );

        const payload = JSON.stringify(command);

        // console.log('topic', topic);
        await this.rtuMqttService.publish(
            topic,
            payload,
            {
                qos: 1,
                retain: false,
            },
        );

        // Log outgoing command
        this.rtuLogger.logOutgoing({
            // assetId: target.assetId,
            // deviceId: target.deviceId,
            // clientDeviceId: target.clientDeviceId,
            // slaveId: target.slaveId,
            msgId: command.msgId,
            topic,
            command,
        });

        // IMPORTANT:
        // We DO NOT wait for RMU response.
        return {
            success: true,
            message: 'RTU command published successfully',
            msgId: command.msgId,
            topic,
            command,
        };
    }
    private buildCommandTopic(
        clientDeviceId: string,
    ): string {
        return `HrmsIOT/Rtv/${clientDeviceId}/Cmd/Sub`;
    }

    // private async resolveTarget(input: {
    //     assetId: string;
    //     slaveId?: number;
    //     clientDeviceId?: string;
    // }): Promise<RtuResolvedTarget> {
    //     // const asset = await this.assetRepository.findOne({
    //     //     where: {
    //     //         id: input.assetId,
    //     //     },
    //     // });

    //     const asset = await this.assetService.findOneById(input.assetId);

    //     if (!asset) {
    //         throw new NotFoundException(
    //             `Asset not found: ${input.assetId}`,
    //         );
    //     }

    //     if (input.clientDeviceId) {
    //         // const device = await this.deviceRepository.findOne({
    //         //     where: {
    //         //         clientDeviceId: input.clientDeviceId,
    //         //     },
    //         // });

    //         const device = await this.deviceService.findOne({ clientDeviceId: input.clientDeviceId });

    //         if (!device) {
    //             throw new NotFoundException(
    //                 `Device not found for clientDeviceId: ${input.clientDeviceId}`,
    //             );
    //         }

    //         if (!device.clientDeviceId) {
    //             throw new BadRequestException(
    //                 `Device ${device.id} does not have clientDeviceId`,
    //             );
    //         }

    //         // SlaveId explicitly supplied
    //         if (input.slaveId !== undefined) {
    //             return {
    //                 assetId: input.assetId,
    //                 deviceId: device.id,
    //                 clientDeviceId: device.clientDeviceId,
    //                 slaveId: input.slaveId,
    //             };
    //         }

    //         // Otherwise resolve slaveId from telemetry
    //         const telemetry =
    //             await this.currentTelemetryPayloadService.findOne(
    //                 {
    //                     assetId: input.assetId,
    //                     deviceId: device.id,
    //                 },);

    //         // const slaveIds = this.uniqueSlaveIds(telemetry);
    //         const slaveId = telemetry?.slaveId;

    //         // if (slaveIds.length === 0) {
    //         //     throw new BadRequestException(
    //         //         `slaveId not found for asset ${input.assetId} and device ${device.id}`,
    //         //     );
    //         // }

    //         return {
    //             assetId: input.assetId,
    //             deviceId: device.id,
    //             clientDeviceId: device.clientDeviceId,
    //             slaveId: Number(slaveId),
    //             // slaveId: slaveIds[0],
    //         };
    //     }

    //     // -----------------------------------------------------
    //     // CASE 2:
    //     // clientDeviceId not provided
    //     // -----------------------------------------------------

    //     const telemetry = await this.currentTelemetryPayloadService.findAll(
    //         {
    //             assetId: input.assetId,
    //         },
    //     );

    //     const candidates = this.buildCandidates(
    //         telemetry,
    //         input.slaveId,
    //     );

    //     if (candidates.length === 0) {
    //         if (input.slaveId !== undefined) {
    //             throw new NotFoundException(
    //                 `No device mapping found for asset ${input.assetId} and slaveId ${input.slaveId}`,
    //             );
    //         }

    //         throw new NotFoundException(
    //             `No CurrentTelemetryPayload mapping found for asset ${input.assetId}`,
    //         );
    //     }

    //     if (candidates.length > 1) {
    //         throw new BadRequestException(
    //             `Multiple RTU targets found for asset ${input.assetId}. Please provide clientDeviceId and/or slaveId explicitly.`,
    //         );
    //     }

    //     const candidate = candidates[0];

    //     if (!candidate.deviceId) {
    //         throw new BadRequestException(
    //             `CurrentTelemetryPayload does not contain deviceId`,
    //         );
    //     }

    //     const device = await this.deviceService.findOne(candidate.deviceId as FindDeviceDto);

    //     if (!device) {
    //         throw new NotFoundException(
    //             `Device not found: ${candidate.deviceId}`,
    //         );
    //     }

    //     if (!device.clientDeviceId) {
    //         throw new BadRequestException(
    //             `Device ${device.id} does not have clientDeviceId`,
    //         );
    //     }

    //     if (candidate.slaveId === undefined) {
    //         throw new BadRequestException(
    //             `slaveId could not be resolved`,
    //         );
    //     }

    //     return {
    //         assetId: input.assetId,
    //         deviceId: device.id,
    //         clientDeviceId: device.clientDeviceId,
    //         slaveId: candidate.slaveId,
    //     };
    // }
    // private buildCandidates(
    //     telemetry: CurrentTelemetryPayload[],
    //     requestedSlaveId?: number,
    // ): Array<{
    //     deviceId?: string;
    //     slaveId?: number;
    // }> {
    //     const result = new Map<
    //         string,
    //         {
    //             deviceId?: string;
    //             slaveId?: number;
    //         }
    //     >();

    //     for (const record of telemetry) {
    //         if (!record.deviceId) {
    //             continue;
    //         }

    //         if (
    //             record.slaveId === undefined ||
    //             record.slaveId === null ||
    //             record.slaveId === ''
    //         ) {
    //             continue;
    //         }

    //         const slaveId = Number(record.slaveId);

    //         if (!Number.isInteger(slaveId)) {
    //             continue;
    //         }

    //         if (
    //             requestedSlaveId !== undefined &&
    //             slaveId !== requestedSlaveId
    //         ) {
    //             continue;
    //         }

    //         result.set(
    //             `${record.deviceId}:${slaveId}`,
    //             {
    //                 deviceId: record.deviceId,
    //                 slaveId,
    //             },
    //         );
    //     }

    //     return [...result.values()];
    // }

    // private uniqueSlaveIds(
    //     telemetry: CurrentTelemetryPayload,
    // ): number[] {
    //     const result = new Set<number>();

    //     for (const record of telemetry) {
    //         if (
    //             record.slaveId === undefined ||
    //             record.slaveId === null ||
    //             record.slaveId === ''
    //         ) {
    //             continue;
    //         }

    //         const slaveId = Number(record.slaveId);

    //         if (Number.isInteger(slaveId)) {
    //             result.add(slaveId);
    //         }
    //     }

    //     return [...result];
    // }

    // ---------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------

    private generateMsgId(): string {
        return randomUUID()
            .replace(/-/g, '')
            .substring(0, RTU_MSG_ID_LENGTH);
    }

    private generateTimestamp(): string {
        return new Date().toISOString();
    }
}