import {
    Body,
    Controller,
    Get,
    Post,
    Query,
} from '@nestjs/common';

import { RtuCommandService } from './rtu-command.service';

import { ReadRtuCommandDto } from './dto/read-rtu-command.dto';

import { WriteRtuCommandDto } from './dto/write-rtu-command.dto';
import { RtuCommandMasterService } from './rtu-command-master.service';

@Controller('rtu-command')
export class RtuCommandController {
    constructor(
        private readonly rtuCommandService: RtuCommandService,
        private readonly rtuCommandMasterService: RtuCommandMasterService,
    ) { }

    @Post('read')
    async read(
        @Body() dto: ReadRtuCommandDto,
    ) {
        return this.rtuCommandService.read(
            dto,
        );
    }

    @Post('write')
    async write(
        @Body() dto: WriteRtuCommandDto,
    ) {
        return this.rtuCommandService.write(
            dto,
        );
    }

    @Get('slaveIds')
    async getSlaveIds(
        @Query('assetId') assetId: string,
        @Query('deviceId') deviceId: string,
    ) {
        return this.rtuCommandMasterService.getSlaveId(assetId, deviceId);
    }


    @Get('devices')
    getDevices(
        @Query('assetId') assetId: string
    ) {
        return this.rtuCommandMasterService.getVDevices(assetId);
    }

    @Get('getRtuTarget')
    getRtuTarget(
        @Query('assetId') assetId: string,
        @Query('virtualDeviceId') virtualDeviceId: string,
    ) {
        return this.rtuCommandMasterService.getRtuTarget(assetId, virtualDeviceId)
    }
    @Post('sendCommand')
    async sendCommand(
        @Query('assetId') assetId: string,
        @Query('clientDeviceId') clientDeviceId: string,
        @Query('param') param: string,
        @Query('addr') addr: number,
    ) {
        return this.rtuCommandMasterService.sendRtuCommand(assetId, clientDeviceId, param, addr);
    }
}