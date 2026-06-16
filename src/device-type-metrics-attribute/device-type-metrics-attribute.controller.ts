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
  NO_RECORD,
  USER_NOT_IN_REQUEST_HEADER,
} from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { Response } from 'express';
import { UserId } from 'src/utils/req-user-id.decorator';
import { DeviceTypeMetricsAttributeService } from './device-type-metrics-attribute.service';
import { CreateDeviceTypeMetricsAttributeDto } from './dto/create-device-type-metrics-attribute.dto';
import { FindDeviceTypeMetricsAttributeByMultipleIDsDto } from './dto/find-device-type-metrics-attribute-byMultipleIDs.dto';
import { FindDeviceTypeMetricsAttributeDto } from './dto/find-device-type-metrics-attribute.dto';
import { UpdateDeviceTypeMetricsAttributeDto } from './dto/update-device-type-metrics-attribute.dto';

@Controller('device-type-metrics-attribute')
export class DeviceTypeMetricsAttributeController {
  private readonly logger = winstonServerLogger(
    DeviceTypeMetricsAttributeController.name,
  );
  constructor(
    private readonly deviceTypeMetricsAttributeService: DeviceTypeMetricsAttributeService,
  ) { }

  @Post()
  async create(
    @UserId() userId: string,
    @Body()
    createDeviceTypeMetricsAttributeDto: CreateDeviceTypeMetricsAttributeDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(
      createDeviceTypeMetricsAttributeDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createDeviceTypeMetricsAttributeDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling create service`);
      return await this.deviceTypeMetricsAttributeService.create(
        createDeviceTypeMetricsAttributeDto,
      );
    }
  }

  @Get('many')
  async findAll(@Query() searchCriteria: FindDeviceTypeMetricsAttributeDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find DeviceTypeMetricsAttribute with searchCriteria : ${JSON.stringify(
      searchCriteria,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    // return await this.deviceTypeMetricsAttributeService.findAll(searchCriteria);
  }

  @Get('minimalFields')
  async findAllWithMinimalFields(
    @Query() searchCriteria: FindDeviceTypeMetricsAttributeDto,
  ) {
    const fnName = this.findAllWithMinimalFields.name;
    const input = `Input : Find DeviceTypeMetricsAttribute with minimal fields and searchCriteria : ${JSON.stringify(
      searchCriteria,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return await this.deviceTypeMetricsAttributeService.findAllWithMinimalFields(
      searchCriteria,
    );
  }

  @Get('byMultipleIDs')
  async findByMultipleIDs(
    @Query() searchCriteria: FindDeviceTypeMetricsAttributeByMultipleIDsDto,
  ) {
    const fnName = this.findByMultipleIDs.name;
    const input = `Input : Find DeviceTypeMetricsAttribute with multiple ids : ${JSON.stringify(
      searchCriteria,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return await this.deviceTypeMetricsAttributeService.findByMultipleIDs(
      searchCriteria,
    );
  }

  @Get('byMultipleIDs/relations')
  async findByMultipleIDsWthRelations(
    @Query() searchCriteria: FindDeviceTypeMetricsAttributeByMultipleIDsDto,
  ) {
    const fnName = this.findByMultipleIDsWthRelations;
    const input = `Input : Find DeviceTypeMetricsAttribute with relations and multiple ids : ${JSON.stringify(
      searchCriteria,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relationsRequired = true;

    this.logger.debug(
      `${fnName} : Calling findByMultipleIDsWthRelations service`,
    );
    return await this.deviceTypeMetricsAttributeService.findByMultipleIDs(
      searchCriteria,
      relationsRequired,
    );
  }

  @Get('byMultipleIDsForDisplay')
  async findByMultipleIDsForDisplay(
    @Query()
    searchCriteria: FindDeviceTypeMetricsAttributeByMultipleIDsDto,
  ) {
    const fnName = this.findByMultipleIDsForDisplay.name;
    const input = `Input : Find DeviceTypeMetricsAttribute with multiple ids : ${JSON.stringify(
      searchCriteria,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relationsRequired = false;
    const forDisplay = true;
    return await this.deviceTypeMetricsAttributeService.findByMultipleIDs(
      searchCriteria,
      relationsRequired,
      forDisplay,
    );
  }

  @Get('findMainAttrib')
  async findMainAttrib(@Query('deviceTypeId') deviceTypeId: string) {
    const fnName = this.findMainAttrib.name;
    const input = `Input : ${deviceTypeId}`;
    this.logger.debug(`${fnName} : ${input}`);
    return await this.deviceTypeMetricsAttributeService.findMainAttrib(
      deviceTypeId,
    );
  }

  @Get('one')
  async findOne(
    // @UserId() userId: string,
    @Query() searchCriteria: FindDeviceTypeMetricsAttributeDto,
  ) {
    const fnName = this.findOne.name;
    const input = `Input : Find DeviceTypMetricAttribute with searchCriteria : ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    // return await this.deviceTypeMetricsAttributeService.findOne(searchCriteria);
  }

  @Patch()
  async update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body()
    updateDeviceTypeMetricsAttributeDto: UpdateDeviceTypeMetricsAttributeDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id} and update object is : ${JSON.stringify(
      updateDeviceTypeMetricsAttributeDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      // updateDeviceTypeMetricsAttributeDto.updatedBy = userId;
      this.logger.debug(`${fnName} : Calling update service`);

      return await this.deviceTypeMetricsAttributeService.update(
        id,
        updateDeviceTypeMetricsAttributeDto,
      );
    }
  }

  @Delete()
  async delete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.delete.name;
    const input = `Input : DeviceTypeMetricsAttribute id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling delete service`);
      return await this.deviceTypeMetricsAttributeService.delete(id);
    }
  }

  // @Delete('softDelete')
  // async softDelete(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = this.softDelete.name;
  //   const input = `Input : DeviceTypeMetricsAttribute id : ${id} to be softDeleted`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     const searchCriteria: FindDeviceTypeMetricsAttributeDto = { id };
  //     const deviceTypeMetricsAttributeToBeDeleted =
  //       // await this.deviceTypeMetricsAttributeService.findOne(searchCriteria);

  //     if (deviceTypeMetricsAttributeToBeDeleted) {
  //       deviceTypeMetricsAttributeToBeDeleted.deletedBy = userId;
  //       return await this.deviceTypeMetricsAttributeService.softDelete(
  //         id,
  //         deviceTypeMetricsAttributeToBeDeleted,
  //       );
  //     } else {
  //       this.logger.error(
  //         `${fnName} : ${NO_RECORD} : DeviceTypeMetricsAttribute with id : ${id} not found`,
  //       );
  //       throw new Error(
  //         `${NO_RECORD} : DeviceTypeMetricsAttribute with id : ${id} not found`,
  //       );
  //     }
  //   }
  // }

  @Patch('restore')
  async restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.restore.name;
    const input = `Input : DeviceTypeMetricsAttribute id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling restore service`);
      return await this.deviceTypeMetricsAttributeService.restore(id);
    }
  }
}
