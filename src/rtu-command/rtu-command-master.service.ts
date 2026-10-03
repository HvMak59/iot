// import { Injectable } from '@nestjs/common';
// import { CurrentTelemetryPayloadService } from '../current-telemetry-payload/current-telemetry-payload.service';
// import { RtuCommandService } from './rtu-command.service';
// import { ReadRtuCommandDto, sendRtuCommandDto } from './dto/read-rtu-command.dto';
// import { WriteRtuCommandDto } from './dto/write-rtu-command.dto';
// import { VirtualDeviceService } from 'src/virtual-device/virtual-device.service';
// import { winstonRtuCommunicationLogger } from 'src/app_config/serverWinston.config';
// import { KEY_SEPARATOR } from 'src/app_config/constants';
// import { RtuCommandType } from 'src/utils/enums';

// @Injectable()
// export class RtuCommandMasterService {
//     private readonly logger = winstonRtuCommunicationLogger(RtuCommandMasterService.name);
//     constructor(
//         private readonly virtualDeviceService: VirtualDeviceService,
//         private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
//         private readonly rtuCommandService: RtuCommandService,
//     ) { }

//     async getVDevices(assetId: string) {
//         const fnName = this.getVDevices.name;
//         const input = `Input: AssetId: ${assetId}`;

//         this.logger.debug(fnName + KEY_SEPARATOR + input);
//         this.logger.debug('Calling getVDevices service');
//         return await this.virtualDeviceService.findVDevicesForRtuCommand(assetId);
//     }

//     getSlaveIds(virtualDeviceId: string) {
//         const fnName = this.getSlaveIds.name;
//         const input = `Input: VirtualDeviceId: ${virtualDeviceId}`;

//         this.logger.debug(fnName + KEY_SEPARATOR + input);
//         this.logger.debug('Calling findAllSlavesForVd service');
//         return this.currentTelemetryPayloadService.findAllSlavesForVd(virtualDeviceId);
//     }

//     async sendRtuCommand(dto: sendRtuCommandDto) {
//         const fnName = this.sendRtuCommand.name;
//         const input = `Input: sendRtuCommandDto: ${JSON.stringify(dto)}`;

//         this.logger.debug(fnName + KEY_SEPARATOR + input);

//         if (dto.type == RtuCommandType.read) {
//             const readDto: ReadRtuCommandDto = {
//                 rmuDeviceId: dto.rmuDeviceId,
//                 slaveId: dto.slaveId,
//                 param: dto.param,
//                 addr: dto.addr,
//             };

//             this.logger.debug('Calling read service');

//             return this.rtuCommandService.read(readDto);
//         }
//         if (dto.type == RtuCommandType.write) {
//             const writeDto: WriteRtuCommandDto = {
//                 rmuDeviceId: dto.rmuDeviceId,
//                 slaveId: dto.slaveId,
//                 param: dto.param,
//                 addr: dto.addr,
//                 value: dto.value,
//             };

//             this.logger.debug('Calling write service');
//             return this.rtuCommandService.write(writeDto);
//         }
//     }


//     // async getRmus(assetId: string) {
//     //     return this.virtualDeviceService.findRmusForRtuCommand(
//     //         assetId
//     //     );
//     // }

// }