import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Delete,
    Query,
} from '@nestjs/common';
import { UserId } from 'src/utils/req-user-id.decorator';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { CreateDeviceModelRegisterDto } from './dto/create-device-model-register.dto';
import { DeviceModelRegisterService } from './device-model-register.service';
import { FindDeviceModelRegisterDto } from './dto/find-device-model-dto';
import { UpdateDeviceModelRegisterDto } from './dto/update-device-model-register.dto';

@Controller('device-model-register')
export class DeviceModelRegisterController {
    private readonly logger = winstonServerLogger(DeviceModelRegisterController.name);

    constructor(
        private readonly deviceModelRegisterService: DeviceModelRegisterService
    ) { }

    @Post()
    create(
        @UserId() userId: string,
        @Body() createDeviceModelRegisterDto: CreateDeviceModelRegisterDto
    ) {
        const fnName = this.create.name;
        const input = `Input : Create DeviceModelRegister : ${JSON.stringify(createDeviceModelRegisterDto)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        if (userId == null) {
            this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
            throw new Error(USER_NOT_IN_REQUEST_HEADER);
        }
        else {
            createDeviceModelRegisterDto.createdBy = userId;
            this.logger.debug(`${fnName}: Calling create service`);
            return this.deviceModelRegisterService.create(createDeviceModelRegisterDto);
        }
    }

    @Post('bulk')
    createBulk(
        @UserId() userId: string,
        @Body() createDeviceModelRegisterDto: CreateDeviceModelRegisterDto[]
    ) {
        const fnName = this.createBulk.name;
        const input = `Input : Create DeviceModelRegister : ${JSON.stringify(createDeviceModelRegisterDto)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        if (userId == null) {
            this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
            throw new Error(USER_NOT_IN_REQUEST_HEADER);
        }
        else {
            for (const dto of createDeviceModelRegisterDto) {
                dto.createdBy = userId;
            }
            this.logger.debug(`${fnName}: Calling createBulk service`);
            return this.deviceModelRegisterService.createBulk(createDeviceModelRegisterDto);
        }
    }

    @Get()
    findAll(@Query() searchCriteria: FindDeviceModelRegisterDto) {
        const fnName = this.findAll.name;
        const input = `Input : Find DeviceModelRegister with searchCriteria: ${JSON.stringify(searchCriteria)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);
        this.logger.debug(`${fnName}: Calling findAll service`);
        return this.deviceModelRegisterService.findAll(searchCriteria);
    }

    @Get('relation')
    findAllWthRelation(@Query() searchCriteria: FindDeviceModelRegisterDto) {
        const fnName = this.findAllWthRelation.name;
        const input = `Input : Find DeviceModelRegister with searchCriteria: ${JSON.stringify(searchCriteria)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);
        const relationsRequired = true;
        this.logger.debug(`${fnName}: Calling findAll service`);
        return this.deviceModelRegisterService.findAll(searchCriteria, relationsRequired);
    }

    @Get('findOne')
    findOne(@Query() searchCriteria: FindDeviceModelRegisterDto) {
        const fnName = this.findOne.name;
        const input = `Input : FindOne DeviceModelRegister with searchCriteria : ${JSON.stringify(searchCriteria)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);
        this.logger.debug(`${fnName}: Calling findOne service`);
        return this.deviceModelRegisterService.findOne(searchCriteria);
    }

    @Get('findOne/relation')
    findOneWthRelation(@Query() searchCriteria: FindDeviceModelRegisterDto) {
        const fnName = this.findOneWthRelation.name;
        const input = `Input : Find DeviceModelRegister with searchCriteria: ${JSON.stringify(searchCriteria)} with relation`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);
        const relationsRequired = true;
        this.logger.debug(`${fnName}: Calling findAll service`);
        return this.deviceModelRegisterService.findOne(searchCriteria, relationsRequired);
    }

    @Get('id')
    findOneById(@Query('id') id: string) {
        const fnName = this.findOneById.name;
        const input = `Input : FindOne DeviceModelRegister by id : ${id}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);
        this.logger.debug(`${fnName}: Calling findOne service`);
        return this.deviceModelRegisterService.findOneById(id);
    }

    @Patch()
    update(
        @UserId() userId: string,
        @Query('id') id: string,
        @Body() updateDeviceModelRegisterDto: UpdateDeviceModelRegisterDto
    ) {
        const fnName = this.update.name;
        const input = `Input : Id : ${id}, updateDeviceModelRegisterDto: ${JSON.stringify(updateDeviceModelRegisterDto)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        if (userId == null) {
            this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
            throw new Error(USER_NOT_IN_REQUEST_HEADER);
        }
        else {
            updateDeviceModelRegisterDto.updatedBy = userId;
            this.logger.debug(`${fnName}: Calling update service`);
            return this.deviceModelRegisterService.update(id, updateDeviceModelRegisterDto);
        }
    }

    @Delete()
    remove(
        @UserId() userId: string,
        @Query('id') id: string
    ) {
        const fnName = this.remove.name;
        const input = `Input : Delete DeviceModelRegister : ${id}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        if (userId == null) {
            this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
            throw new Error(USER_NOT_IN_REQUEST_HEADER);
        }
        else {
            this.logger.debug(`${fnName}: Calling delete service`);
            return this.deviceModelRegisterService.delete(id);
        }
    }

    @Delete('softDelete')
    softDelete(@UserId() userId: string, @Query('id') id: string) {
        const fnName = this.softDelete.name;
        const input = `DeviceModelRegister Id : ${id} to be softDeleted`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        if (userId == null) {
            this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
            throw new Error(USER_NOT_IN_REQUEST_HEADER);
        }
        else {
            this.logger.debug(`${fnName}: Calling softDelete service`);
            return this.deviceModelRegisterService.softDelete(id, userId);
        }
    }

    @Patch('restore')
    restore(@UserId() userId: string, @Query('id') id: string) {
        const fnName = this.restore.name;
        const input = `Input : DeviceModelRegister id : ${id} to be restored`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        if (userId == null) {
            this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
            throw new Error(USER_NOT_IN_REQUEST_HEADER);
        } else {
            this.logger.debug(`${fnName}: Calling restore service`);
            return this.deviceModelRegisterService.restore(id);
        }
    }

}
