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

@Injectable()
export class RtuCommandService {
    constructor(
        private readonly rtuMqttService: RtuMqttService,
        private readonly virtualDeviceService: VirtualDeviceService,
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
    ) { }

    private readonly logger = winstonRtuCommunicationLogger(RtuCommandService.name);

    read(dto: ReadRtuCommandDto) {
        const fnName = this.read.name;
        const input = `Input: ReadRtuCommandDto: ${JSON.stringify(dto)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const command: RtuReadCommand = {
            slaveId: Number(dto.slaveId!),
            msgId: this.generateMsgId(),
            timestamp: this.generateTimestamp(),
            type: RTU_COMMAND_TYPE_READ,
            addr: dto.addr,
            param: dto.param,
            dataType: RTU_DATA_TYPE,
            valueType: RTU_VALUE_TYPE,
            multiplier: RTU_MULTIPLIER,
            fieldSize: RTU_FIELD_SIZE,
        };

        this.logger.debug(`${fnName}: Calling publishCommand service`);

        return this.publishCommand(
            dto.rmuDeviceId!,
            command,
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
            value: dto.value,
            dataType: RTU_DATA_TYPE,
            valueType: RTU_VALUE_TYPE,
        };

        this.logger.debug(`${fnName}: Calling publishCommand service`);
        return this.publishCommand(
            dto.rmuDeviceId!,
            command,
        );
    }


    private async publishCommand(
        rmuDeviceId: string,
        command: RtuCommand,
    ) {
        const fnName = this.publishCommand.name;
        const input = `Input: RmuDeviceId: ${rmuDeviceId}, Command: ${JSON.stringify(command)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const topic = this.buildCommandTopic(
            rmuDeviceId,
        );

        const payload = JSON.stringify(command);

        await this.rtuMqttService.publish(
            topic,
            payload
        );

        this.logger.debug(
            JSON.stringify({
                direction: 'OUTGOING',
                msgId: command.msgId,
                topic,
                command,
            }),
        );
        return {
            success: true,
            message: 'RTU command published successfully',
            msgId: command.msgId,
            topic,
            command,
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

    sendRtuCommand(dto: sendRtuCommandDto) {
        const fnName = this.sendRtuCommand.name;
        const input = `Input: sendRtuCommandDto: ${JSON.stringify(dto)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        if (dto.type == RtuCommandType.read) {
            const readDto: ReadRtuCommandDto = {
                rmuDeviceId: dto.rmuDeviceId,
                slaveId: dto.slaveId!,
                param: dto.param,
                addr: Number(dto.addr),
            };
            this.logger.debug('Calling read service');

            return this.read(readDto);
        }
        if (dto.type == RtuCommandType.write) {
            const writeDto: WriteRtuCommandDto = {
                rmuDeviceId: dto.rmuDeviceId,
                slaveId: Number(dto.slaveId!),
                param: dto.param,
                addr: Number(dto.addr),
                value: Number(dto.value),
            };

            this.logger.debug('Calling write service');
            return this.write(writeDto);
        }
    }
}