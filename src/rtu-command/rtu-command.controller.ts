import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RtuCommandService } from './rtu-command.service';
import { ReadRtuCommandDto, sendRtuCommandDto } from './dto/read-rtu-command.dto';
import { WriteRtuCommandDto } from './dto/write-rtu-command.dto';
// import { RtuCommandMasterService } from './rtu-command-master.service';
import { UserId } from 'src/utils/req-user-id.decorator';
import { winstonRtuCommunicationLogger } from 'src/app_config/serverWinston.config';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from 'src/app_config/constants';

@Controller('rtu-command')
export class RtuCommandController {
    private readonly logger = winstonRtuCommunicationLogger(RtuCommandController.name);
    constructor(
        private readonly rtuCommandService: RtuCommandService,
        // private readonly rtuCommandMasterService: RtuCommandMasterService,
    ) { }

    @Post('read')
    read(
        @UserId() userId: string,
        @Body() dto: ReadRtuCommandDto
    ) {
        const fnName = this.read.name;
        const input = `Input : read dto: ${JSON.stringify(dto)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);
        if (userId) {
            return this.rtuCommandService.read(
                dto,
            );
        }
        else {
            this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
            throw new Error(USER_NOT_IN_REQUEST_HEADER);
        }
    }

    @Post('write')
    write(
        @UserId() userId: string,
        @Body() dto: WriteRtuCommandDto,
    ) {
        const fnName = this.write.name;
        const input = `Input : write dto: ${JSON.stringify(dto)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        if (userId) {
            return this.rtuCommandService.write(
                dto,
            );
        }
        else {
            this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
            throw new Error(USER_NOT_IN_REQUEST_HEADER);
        }
    }

    @Get('vds')
    getVDevices(
        @Query('assetId') assetId: string
    ) {
        const fnName = this.getVDevices.name;
        const input = `Input: AssetId: ${assetId}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);
        this.logger.debug('Calling getVDevices service');
        return this.rtuCommandService.getVDevices(assetId);
    }

    @Get('slaveIds')
    getSlaveIds(
        @Query('virtualDeviceId') virtualDeviceId: string,
    ) {
        const fnName = this.getSlaveIds.name;
        const input = `Input: VirtualDeviceId: ${virtualDeviceId}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);
        this.logger.debug('Calling getSlaveIds service');
        return this.rtuCommandService.getSlaveIds(virtualDeviceId);
    }

    @Post('sendCommand')
    sendCommand(
        @UserId() userId: string,
        @Body() body: sendRtuCommandDto
    ) {
        const fnName = this.sendCommand.name;
        const input = `Send Command: ${JSON.stringify(body)}`;

        this.logger.debug(`${fnName}: Received request to send RTU command with input: ${input}`);
        if (userId) {
            this.logger.debug('Calling sendRtuCommand service');
            return this.rtuCommandService.sendRtuCommand(body);
        } else {
            this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
            throw new Error(USER_NOT_IN_REQUEST_HEADER);
        }
    }



    // @Get('rmu')
    // async getRmus(@Query('assetId') assetId: string) {
    //     return this.rtuCommandMasterService.getRmus(assetId);
    // }
}