import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RtuMqttService } from './mqtt/rtu-mqtt.service';
import {
    RTU_COMMAND_TYPE_READ,
    RTU_COMMAND_TYPE_WRITE,
    RTU_DATA_TYPE,
    RTU_VALUE_TYPE,
    RTU_MULTIPLIER,
    RTU_FIELD_SIZE,
    RTU_MSG_ID_LENGTH,
    KEY_SEPARATOR,
} from 'src/app_config/constants';
import { ReadRtuCommandDto } from './dto/read-rtu-command.dto';
import { WriteRtuCommandDto } from './dto/write-rtu-command.dto';
import { winstonRtuCommunicationLogger } from 'src/app_config/serverWinston.config';
import { RtuCommand, RtuReadCommand, RtuWriteCommand } from './interfaces/rtu-command.interface';
import { VirtualDeviceService } from 'src/virtual-device/virtual-device.service';
import { CurrentTelemetryPayloadService } from 'src/current-telemetry-payload/current-telemetry-payload.service';
import { RtuCommandType } from 'src/utils/enums';
import { sendRtuCommandDto } from './dto/send-rtu-command.dto';
import { DeviceTypeService } from 'src/device-type/device-type.service';
import { DeviceTypeMetricsAttributeService } from 'src/device-type-metrics-attribute/device-type-metrics-attribute.service';
import { DeviceModelParameterService } from 'src/device-model-parameters/device-model-parameter.service';

@Injectable()
export class RtuCommandService {
    constructor(
        private readonly rtuMqttService: RtuMqttService,
        private readonly virtualDeviceService: VirtualDeviceService,
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
        private readonly deviceTypeMetricsAttributeService: DeviceTypeMetricsAttributeService,
        private readonly deviceModelParameterService: DeviceModelParameterService,
    ) { }

    private readonly logger = winstonRtuCommunicationLogger(RtuCommandService.name);

    // read(dto: ReadRtuCommandDto) {
    read(command: RtuReadCommand, rmuDeviceId: string) {
        const fnName = this.read.name;
        const input = `Input: ReadRtuCommandDto: ${JSON.stringify(command)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        // const command: RtuReadCommand = {
        //     slaveId: Number(dto.slaveId!),
        //     msgId: this.generateMsgId(),
        //     timestamp: this.generateTimestamp(),
        //     type: RTU_COMMAND_TYPE_READ,
        //     addr: dto.addr,
        //     param: dto.param,
        //     dataType: RTU_DATA_TYPE,
        //     valueType: RTU_VALUE_TYPE,
        //     // valueType: 'InputRegister',
        //     multiplier: RTU_MULTIPLIER,
        //     fieldSize: RTU_FIELD_SIZE,
        // };

        this.logger.debug(`${fnName}: Calling publishCommand service`);

        return this.publishCommand(
            rmuDeviceId,
            command
        );
    }

    write(dto: WriteRtuCommandDto) {
        const fnName = this.write.name;
        const input = `Input: WriteRtuCommandDto: ${JSON.stringify(dto)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const command: RtuWriteCommand = {
            slaveId: Number(dto.slaveId!),
            msgId: this.generateMsgId(),
            timestamp: this.generateTimestamp(),
            type: RTU_COMMAND_TYPE_WRITE,
            addr: dto.addr,
            param: dto.param,
            value: dto.value * 10,
            dataType: RTU_DATA_TYPE,
            valueType: 'Single',
            // valueType: RTU_VALUE_TYPE,
        };

        this.logger.debug(`${fnName}: Calling publishCommand service`);
        return this.publishCommand(
            dto.rmuDeviceId!,
            command,
        );
    }

    // const a = 'this is correct'
    // private async publishCommand(
    //     rmuDeviceId: string,
    //     command: RtuCommand,
    // ) {
    //     const fnName = this.publishCommand.name;
    //     const input = `Input: RmuDeviceId: ${rmuDeviceId}, Command: ${JSON.stringify(command)}`;

    //     this.logger.debug(fnName + KEY_SEPARATOR + input);

    //     const topic = this.buildCommandTopic(
    //         rmuDeviceId,
    //     );

    //     const payload = JSON.stringify(command);

    //     await this.rtuMqttService.publish(
    //         topic,
    //         payload
    //     );

    //     this.logger.debug(
    //         JSON.stringify({
    //             direction: 'OUTGOING',
    //             topic,
    //             command,
    //         }),
    //     );
    //     return {
    //         success: true,
    //         message: 'RTU command published successfully',
    //         sseUrl: `sse/rtu/${command.msgId}`,
    //         msgId: command.msgId,
    //         topic,
    //         command,
    //     };
    // }


    private async publishCommand(
        rmuDeviceId: string,
        command: RtuCommand,
    ) {
        const fnName = this.publishCommand.name;

        const input =
            `Input: RmuDeviceId: ${rmuDeviceId}, Command: ${JSON.stringify(command)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const topic = this.buildCommandTopic(
            rmuDeviceId,
        );

        const payload = JSON.stringify(command);

        const responsePromise = this.rtuMqttService.waitForResponse(
            command.msgId,
        );

        await this.rtuMqttService.publish(
            topic,
            payload,
        );

        this.logger.debug(
            JSON.stringify({
                direction: 'OUTGOING',
                topic,
                command,
            }),
        );

        // Wait for matching RMU response
        const rtuResponse = await responsePromise;

        // this.logger.debug(
        //     JSON.stringify({
        //         direction: 'INCOMING',
        //         topic: rtuResponse.topic,
        //         response: rtuResponse.response,
        //     }),
        // );

        const a = {
            ...command,
            value: rtuResponse.response.value
        }
        return {
            success: true,
            message: 'RTU command completed successfully',
            msgId: command.msgId,
            topic,
            a
            // command,
            // response: rtuResponse.response,
        };
    }


    private buildCommandTopic(
        rmuDeviceId: string,
    ) {
        return `HrmsIOT/Rtv/${rmuDeviceId}/Cmd/Sub`;
    }

    private generateMsgId(): string {
        return randomUUID()
            .replace(/-/g, '')
            .substring(0, RTU_MSG_ID_LENGTH);
    }

    private generateTimestamp(): string {
        // return new Date().toISOString();          // utc time 
        return new Date().toLocaleString('sv-SE')    // local time 
    }





    async getVDevices(assetId: string) {
        const fnName = this.getVDevices.name;
        const input = `Input: AssetId: ${assetId}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);
        this.logger.debug('Calling getVDevices service');
        return await this.virtualDeviceService.findVDevicesForRtuCommand(assetId);
    }

    getSlaveIds(virtualDeviceId: string) {
        const fnName = this.getSlaveIds.name;
        const input = `Input: VirtualDeviceId: ${virtualDeviceId}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);
        this.logger.debug('Calling findAllSlavesForVd service');

        return this.currentTelemetryPayloadService.findAllSlavesForVd(virtualDeviceId);
    }

    getParams(deviceTypeId: string) {
        const fnName = this.getParams.name;
        const input = `Input: DeviceTypeId: ${deviceTypeId}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);
        this.logger.debug('Calling getParams service from deviceType');
        return this.deviceTypeMetricsAttributeService.getParams(deviceTypeId);
    }

    async sendRtuCommand(dto: sendRtuCommandDto) {
        const fnName = this.sendRtuCommand.name;
        const input = `Input: sendRtuCommandDto: ${JSON.stringify(dto)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        console.log(dto.deviceModelId, dto.param);
        const parameterDetails = await this.deviceModelParameterService.findParamDetails(dto.deviceModelId, dto.param);
        console.log("details", parameterDetails);

        if (dto.type == RtuCommandType.read) {
            // const readDto: ReadRtuCommandDto = {
            //     rmuDeviceId: dto.rmuDeviceId,
            //     slaveId: dto.slaveId!,
            //     param: dto.param,
            //     // addr: Number(dto.addr),
            //     addr: Number(parameterDetails?.parameterAddress),
            // };

            const command: RtuReadCommand = {
                slaveId: Number(dto.slaveId!),
                msgId: this.generateMsgId(),
                timestamp: this.generateTimestamp(),
                type: RTU_COMMAND_TYPE_READ,
                addr: Number(parameterDetails?.registerAddress),
                param: dto.param,
                dataType: parameterDetails!.registerDataType,
                valueType: parameterDetails!.registerValueType,
                multiplier: parameterDetails!.registerMultiplier,
                fieldSize: parameterDetails!.registerFieldSize,
            };

            console.log("command", command);
            this.logger.debug('Calling read service');

            // return this.read(readDto);
            return this.read(command, dto.rmuDeviceId);
        }
        if (dto.type == RtuCommandType.write) {
            const writeDto: WriteRtuCommandDto = {
                rmuDeviceId: dto.rmuDeviceId,
                slaveId: Number(dto.slaveId!),
                param: dto.param,
                // addr: Number(dto.addr),
                addr: Number(parameterDetails?.registerAddress),
                value: Number(dto.value),
            };

            this.logger.debug('Calling write service');
            return this.write(writeDto);
        }
    }
}