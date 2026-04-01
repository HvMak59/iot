import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import {
  KEY_SEPARATOR,
  NO_RECORD,
  USER_NOT_IN_REQUEST_HEADER,
} from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { UserId } from 'src/utils/req-user-id.decorator';
import { DeviceModelAlertService } from './device-model-alert.service';
import { CreateDeviceModelAlertDto } from './dto/create-device-model-alert.dto';
import { FindDeviceModelAlertByMultipleIDs } from './dto/find-device-model-alert-byMultipleIDs.dto';
import { FindDeviceModelAlertDto } from './dto/find-device-model-alert.dto';
import { UpdateDeviceModelAlertDto } from './dto/update-device-model-alert.dto';
import { UserId } from 'src/utils/req-user-id.decorator';

@Controller('device-model-alert')
export class DeviceModelAlertController {
  private readonly logger = winstonServerLogger(
    DeviceModelAlertController.name,
  );
  constructor(
    private readonly deviceModelAlertService: DeviceModelAlertService,
  ) { }

  @Post()
  async create(
    @UserId() userId: string,
    @Body() createDeviceModelAlertDto: CreateDeviceModelAlertDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : create object : ${JSON.stringify(
      createDeviceModelAlertDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createDeviceModelAlertDto.createdBy = userId;
      return await this.deviceModelAlertService.create(
        createDeviceModelAlertDto,
      );
    }
  }

  @Post('bulk')
  async createBulk(
    @UserId() userId: string,
    @Body() createDeviceModelAlertDTOs: CreateDeviceModelAlertDto[],
  ) {
    const fnName = this.createBulk.name;
    const input = `Input : create object : ${JSON.stringify([
      ...createDeviceModelAlertDTOs,
    ])}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    for (const createDeviceModelAlertDTO of createDeviceModelAlertDTOs) {
      createDeviceModelAlertDTO.createdBy = userId;
    }
    return await this.deviceModelAlertService.createBulk(
      createDeviceModelAlertDTOs,
    );
  }

  // @Get()
  // async findAll(@Query() searchCriteria: FindDeviceModelAlertDto) {
  //   const fnName = this.findAll.name;
  //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceModelAlertService.findAll(searchCriteria);
  // }

  // @Get('master')
  // async findAllMaster(@Query() searchCriteria: FindDeviceModelAlertDto) {
  //   const fnName = this.findAllMaster.name;
  //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceModelAlertService.findAllForMaster(searchCriteria);
  // }

  // @Get('relations')
  // findAllWthRelations(@Query() searchCriteria: FindDeviceModelAlertDto) {
  //   const fnName = this.findAllWthRelations.name;
  //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   const relationsRequired = true;
  //   return this.deviceModelAlertService.findAll(
  //     searchCriteria,
  //     relationsRequired,
  //   );
  // }

  // @Get('findOneById')
  // async findOneById(@Query('id') id: string) {
  //   const fnName = 'findOneById()';
  //   const input = `Input : Find DeviceModelAlert by id : ${id}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceModelAlertService.findOneById(id);
  // }

  // @Get('byMultipleIDs')
  // async findByMultipleIDs(
  //   @Query() findByMultipleIDs: FindDeviceModelAlertByMultipleIDs,
  // ) {
  //   const fnName = this.findByMultipleIDs.name;
  //   const input = `Input : Find DeviceModelAlert by multiple ids : ${JSON.stringify(
  //     findByMultipleIDs,
  //   )}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceModelAlertService.findByMultipleIDs(
  //     findByMultipleIDs,
  //   );
  // }

  // @Patch()
  // async update(
  //   @UserId() userId: string,
  //   @Query('id') id: string,
  //   @Body() updateDeviceModelAlertDto: UpdateDeviceModelAlertDto,
  // ) {
  //   const fnName = this.update.name;
  //   const input = `Input : Id : ${id}, Update Object : ${JSON.stringify(
  //     updateDeviceModelAlertDto,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     updateDeviceModelAlertDto.updatedBy = userId;
  //     return await this.deviceModelAlertService.update(
  //       id,
  //       updateDeviceModelAlertDto,
  //     );
  //   }
  // }

  // @Delete()
  // async remove(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = this.remove.name;
  //   const input = `Input : DeviceModelAlert Id : ${id} to be deleted by ${userId}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     return this.deviceModelAlertService.delete(id);
  //   }
  // }

  // @Delete('softDelete')
  // async softDelete(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = this.softDelete.name;
  //   const input = `Input : DeviceModelAlert id : ${id} to be soft-deleted`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     let deviceModelAlertToBeDeleted =
  //       await this.deviceModelAlertService.findOneById(id);
  //     if (deviceModelAlertToBeDeleted == null) {
  //       this.logger.error(
  //         `${fnName} : ${NO_RECORD} : DeviceModelAlert Id : ${id} not found`,
  //       );
  //       throw new Error(
  //         `${fnName} : ${NO_RECORD} : DeviceModelAlert Id : ${id} not found`,
  //       );
  //     } else {
  //       deviceModelAlertToBeDeleted.deletedBy = userId;
  //       return await this.deviceModelAlertService.softDelete(
  //         id,
  //         deviceModelAlertToBeDeleted,
  //       );
  //     }
  //   }
  // }

  // @Patch('restore')
  // async restore(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = 'restore()';
  //   const input = `Input : DeviceModelAlert id : ${id} to be restored`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     const restored = await this.deviceModelAlertService.restore(id);
  //     return restored;
  //   }
  // }
}
