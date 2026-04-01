import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  KEY_SEPARATOR,
  USER_NOT_IN_REQUEST_HEADER,
} from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { UserId } from 'src/utils/req-user-id.decorator';
import { DeviceManufacturerService } from './device-manufacturer.service';
import { CreateDeviceManufacturerDto } from './dto/create-device-manufacturer.dto';
import { FindDeviceManufacturerDto } from './dto/find-device-manufacturer.dto';
import { UpdateDeviceManufacturerDto } from './dto/update-device-manufacturer.dto';
import { UserId } from 'src/utils/req-user-id.decorator';

@Controller('device-manufacturer')
export class DeviceManufacturerController {
  private readonly logger = winstonServerLogger(
    DeviceManufacturerController.name,
  );
  constructor(
    private readonly deviceManufacturerService: DeviceManufacturerService,
  ) { }

  @Post()
  async create(
    @UserId() userId: string,
    @Body() createDeviceManufacturerDto: CreateDeviceManufacturerDto,
  ) {
    const fnName = 'create()';
    const input = `Input : ${JSON.stringify(createDeviceManufacturerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      throw Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createDeviceManufacturerDto.createdBy = userId;
      return await this.deviceManufacturerService.create(
        createDeviceManufacturerDto,
      );
    }
  }

  // @Get()
  // findAll(@Query() searchCriteria: FindDeviceManufacturerDto) {
  //   const fnName = 'findAll()';
  //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return this.deviceManufacturerService.findAll(searchCriteria);
  // }

  // @Get('relations')
  // findAllWthRelations(@Query() searchCriteria: FindDeviceManufacturerDto) {
  //   const fnName = 'findAllWthRelations()';
  //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   const relationsRequired = true;
  //   return this.deviceManufacturerService.findAll(
  //     searchCriteria,
  //     relationsRequired,
  //   );
  // }

  // @Get('one')
  // findOneById(@Query('id') id: string) {
  //   const fnName = 'findOneById()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return this.deviceManufacturerService.findOneById(id);
  // }

  // @Get('relations/one')
  // findOneByIdWithRelations(@Query('id') id: string) {
  //   const fnName = 'findOneByIdWthRelations()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return this.deviceManufacturerService.findOneByIdWthRelations(id);
  // }

  // @Patch()
  // update(
  //   @Query('id') id: string,
  //   @UserId() userId: string,
  //   @Body() updateDeviceTypeDto: UpdateDeviceManufacturerDto,
  // ) {
  //   const fnName = 'update()';
  //   const input = `Input : id : ${id} , updateDeviceTypeDto : ${JSON.stringify(
  //     updateDeviceTypeDto,
  //   )}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   updateDeviceTypeDto.updatedBy = userId;
  //   return this.deviceManufacturerService.update(id, updateDeviceTypeDto);
  // }

  // @Patch('restore')
  // restore(@Query('id') id: string) {
  //   const fnName = 'restore()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return this.deviceManufacturerService.restore(id);
  // }

  // @Delete()
  // remove(@Query('id') id: string) {
  //   const fnName = 'remove()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return this.deviceManufacturerService.delete(id);
  // }

  // @Delete('softDelete')
  // softDelete(@Query('id') id: string) {
  //   const fnName = 'softDelete()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return this.deviceManufacturerService.softDelete(id);
  // }
}
