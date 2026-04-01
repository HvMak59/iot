import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import {
  KEY_SEPARATOR,
  USER_NOT_IN_REQUEST_HEADER,
} from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { UserId } from 'src/utils/req-user-id.decorator';
import { DeviceTypeService } from './device-type.service';
import { CreateDeviceTypeDto } from './dto/create-device-type.dto';
import { FindDeviceTypeDto } from './dto/find-device-type.dto';
import { UpdateDeviceTypeDto } from './dto/update-device-type.dto';
import { UserId } from 'src/utils/req-user-id.decorator';

@Controller('device-type')
export class DeviceTypeController {
  private readonly logger = winstonServerLogger(DeviceTypeController.name);
  constructor(private readonly deviceTypeService: DeviceTypeService) { }

  @Post()
  async create(
    @UserId() userID: string,
    @Body() createDeviceTypeDto: CreateDeviceTypeDto,
  ) {
    const fnName = 'create()';
    const input = `Input : ${JSON.stringify(createDeviceTypeDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userID != null) {
      createDeviceTypeDto.createdBy = userID;
      this.logger.debug('Calling Create service');
      return await this.deviceTypeService.create(createDeviceTypeDto);
    } else {
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
  }

  // @Get('many')
  // async findAll(@Query() searchCriteria: FindDeviceTypeDto) {
  //   const fnName = 'findAll()';
  //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceTypeService.findAll(searchCriteria);
  // }

  // @Get('many/relations')
  // async findAllWthRelations(@Query() searchCriteria: FindDeviceTypeDto) {
  //   const fnName = 'findAllWthRelations()';
  //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   const relationsRequired = true;
  //   return await this.deviceTypeService.findAll(
  //     searchCriteria,
  //     relationsRequired,
  //   );
  // }

  // @Get('one')
  // async findOneById(@Query('id') id: string) {
  //   const fnName = 'findOneById()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceTypeService.findOneById(id);
  // }

  // @Get('one/relations')
  // async findOneByIdWithRelations(@Query('id') id: string) {
  //   const fnName = 'findOneByIdWithRelations()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceTypeService.findOneByIdWthRelations(id);
  // }

  // @Patch()
  // async update(
  //   @UserId() userID: string,
  //   @Query('id') id: string,
  //   @Body() updateDeviceTypeDto: UpdateDeviceTypeDto,
  // ) {
  //   const fnName = 'update()';
  //   const input = `Input : ${JSON.stringify(updateDeviceTypeDto)}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userID == null) {
  //     this.logger.error('User is not available in request header');
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     updateDeviceTypeDto.updatedBy = userID;
  //     return await this.deviceTypeService.update(id, updateDeviceTypeDto);
  //   }
  // }

  // @Patch('restore')
  // async restore(@Query('id') id: string) {
  //   const fnName = 'restore()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceTypeService.restore(id);
  // }

  // @Delete()
  // async remove(@Query('id') id: string) {
  //   const fnName = 'remove()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceTypeService.delete(id);
  // }

  // @Delete('softDelete')
  // async softDelete(@Query('id') id: string) {
  //   const fnName = 'softDelete()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceTypeService.softDelete(id);
  // }
}
