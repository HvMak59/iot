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
import { Public } from 'src/auth/entities/public_route';
// import { Relations } from 'src/utils/enums';
// import { UserId } from 'src/utils/req-user-id.decorator';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { FindDevicesFromMultipleIDs } from './dto/find-device-from-multiple-IDs.dto';
import { FindDeviceDto } from './dto/find-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { UserId } from 'src/utils/req-user-id.decorator';
import { Relations } from 'src/utils/enums';

@Controller('device')
export class DeviceController {
  private readonly logger = winstonServerLogger(DeviceController.name);
  constructor(private readonly deviceService: DeviceService) { }

  // @Post()
  // async create(
  //   @UserId() userId: string,
  //   @Body() createDeviceDto: CreateDeviceDto,
  // ) {
  //   const fnName = 'create()';
  //   const input = `Input : ${JSON.stringify(createDeviceDto)}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   createDeviceDto.createdBy = userId;
  //   return await this.deviceService.create(createDeviceDto);
  // }

  @Get()
  async findAll(@Query() searchCriteria: FindDeviceDto) {
    const fnName = 'findAll()';
    const input = `Input : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(`${fnName} : ${input}`);
    console.log("in controller", searchCriteria);
    return await this.deviceService.findAll(searchCriteria, Relations.MIN);
  }

  // @Public()
  // @Get('minRelations')
  // async findAllWithEagerRelations(@Query() searchCriteria: FindDeviceDto) {
  //   const fnName = 'findAllWithEagerRelations()';
  //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.findAll(searchCriteria, Relations.MIN);
  // }

  // @Get('allRelations')
  // async findAllWithAllRelations(@Query() searchCriteria: FindDeviceDto) {
  //   const fnName = 'findAllWithAllRelations()';
  //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.findAll(searchCriteria, Relations.ALL);
  // }

  // /*  @Get('relations')
  // async findAllWthRelations(@Query() searchCriteria: FindDeviceDto) {
  //   const relationsRequired = true;
  //   return await this.deviceService.findAll(searchCriteria, relationsRequired);
  // } */

  // @Get('relations')
  // async findOneByIdWithRelations(@Query('id') id: string) {
  //   const fnName = 'findOneByIdWithRelations()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.findOneByIdWthRelations(id);
  // }

  // @Get('device-metrics-attribute')
  // async findDeviceAndAttributeMetrics(@Query('id') id: string) {
  //   const fnName = 'findDeviceAndAttributeMetrics()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.findDeviceAndAttributeMetrics(id);
  // }

  // @Get('device-model')
  // async findDvceAndDvceModel(
  //   @Query('deviceIds') deviceIds: string,
  //   @Query('assetID') assetID: string,
  // ) {
  //   const fnName = 'findDvceAndDvceModel()';
  //   const input = `Input : deviceIds : ${deviceIds}, assetID : ${assetID}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.findDvceAndDvceModel(deviceIds, assetID);
  // }

  @Public()
  @Get('validateDevice')
  async validateDevice(
    @Query('csvClientDeviceIds') csvClientDeviceIds: string,
    @Query('assetID') assetID: string,
  ) {
    const fnName = this.validateDevice.name;
    const input = `Input : csvClientDeviceIds : ${csvClientDeviceIds}, assetID : ${assetID}`;
    this.logger.debug(`${fnName} : ${input}`);
    return await this.deviceService.validateDevice(csvClientDeviceIds, assetID);
  }

  // @Get('findByIdandStateCode')
  // async findbyDeviceIdAndStateCode(
  //   @Query('id') id: string,
  //   @Query('stateCode') stateCode: string,
  // ) {
  //   const fnName = 'findbyDeviceIdAndStateCode()';
  //   const input = `Input : id : ${id}, stateCode : ${stateCode}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.findbyDeviceIdandStateCode(id, stateCode);
  // }

  // @Get('byMultipleIDs')
  // async fromMultipleIDs(
  //   @Query() findDevicesFromMultipleIDs: FindDevicesFromMultipleIDs,
  // ) {
  //   const fnName = 'byMultipleIDs()';
  //   const input = `Input : ${JSON.stringify(findDevicesFromMultipleIDs)}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.findAllByMultipleIDs(
  //     findDevicesFromMultipleIDs,
  //   );
  // }

  // @Get('byMultipleIDs2')
  // async fromMultipleIDs2(
  //   @Query() findDevicesFromMultipleIDs: FindDevicesFromMultipleIDs,
  // ) {
  //   const fnName = 'byMultipleIDs()';
  //   const input = `Input : ${JSON.stringify(findDevicesFromMultipleIDs)}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.findAllByMultipleIDs2(
  //     findDevicesFromMultipleIDs,
  //   );
  // }

  // @Get('byMultipleIDs/UnAttachedDevices')
  // async findUnAttachedDevicesByMultipleIDs(
  //   @Query() findDevicesFromMultipleIDs: FindDevicesFromMultipleIDs,
  // ) {
  //   const fnName = 'findUnAttachedDevicesByMultipleIDs()';
  //   const input = `Input : ${JSON.stringify(findDevicesFromMultipleIDs)}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.findUnAttachedDevicesByMultipleIDs(
  //     findDevicesFromMultipleIDs,
  //   );
  // }

  // @Get('assetIDs')
  // async findAllByAssetIDs(@Query('csvAssetIDs') csvAssetIDs: string) {
  //   const fnName = 'findAllByAssetIDs()';
  //   const input = `Input : csvAssetIDs : ${csvAssetIDs}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.findAllByAssetIDs(csvAssetIDs);
  // }

  // @Get('multipleIDs/relations')
  // async findFromMultipleIDsWithRelations(
  //   @Query() findDevicesFromMultipleIDs: FindDevicesFromMultipleIDs,
  // ) {
  //   const fnName = 'findFromMultipleIDs/relations()';
  //   const input = `Input : ${JSON.stringify(findDevicesFromMultipleIDs)}`;

  //   this.logger.debug(`${fnName} : ${input}`);
  //   const relationsRequired = Relations.ALL;
  //   return await this.deviceService.findAllByMultipleIDs(
  //     findDevicesFromMultipleIDs,
  //     relationsRequired,
  //   );
  // }

  // @Get('findOneById')
  // async findOneById(@Query('id') id: string) {
  //   const fnName = 'findOneById()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.findOneById(id);
  // }

  // /* @Get('findOneByIdWOTxns')
  // async findOneByIdWOTxns(@Query('id') id: string) {
  //   const fnName = 'findOneByIdWOTxns()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.findOneById(id);
  // } */

  // @Get('withDeviceTypeByAssetId')
  // async findWithDeviceTypeByAssetId(@Query('assetId') assetId: string) {
  //   const fnName = this.findWithDeviceTypeByAssetId.name;
  //   const input = `Input : assetId : ${assetId}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.findWithDeviceTypeByAssetID(assetId);
  // }

  // @Patch('restore/:id')
  // async restore(@Param('id') id: string) {
  //   const fnName = 'restore()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.restore(id);
  // }

  // /* @Patch('attach-virtualDevice')
  // async attachVirtualDevice(
  //   @Query('id') id: string,
  //   @Query('virtualDeviceID') virtualDeviceID: string,
  // ) {
  //   const fnName = 'attachVirtualDevice()';
  //   const input = `Input : deviceID : ${id} , virtualDeviceID : ${virtualDeviceID}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.attachVirtualDevice(id, virtualDeviceID);
  // } */

  // @Patch('attach-virtualDevice')
  // async attachVirtualDevice(
  //   @UserId() userId: string,
  //   @Query('id') id: string,
  //   @Body() updateDeviceDto: UpdateDeviceDto,
  // ) {
  //   const fnName = 'attachVirtualDevice()';
  //   const input = `Input : DeviceId : ${id} and Device object to be attached are : ${JSON.stringify(
  //     updateDeviceDto,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(`${fnName} : User is not available in request header`);
  //     throw Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     updateDeviceDto.updatedBy = userId;
  //     this.logger.debug(`${fnName} : Calling AttachVirtualDevice service`);

  //     return await this.deviceService.attachVirtualDevice(id, updateDeviceDto);
  //   }
  // }

  // @Patch('detach-virtualDevice')
  // async detachVirtualDevice(
  //   @UserId() userId: string,
  //   @Query('id') id: string,
  //   @Body() updateDeviceDto: UpdateDeviceDto,
  // ) {
  //   const fnName = 'detachVirtualDevice()';
  //   const input = `Input : DeviceId : ${id} and Device object to be Detach is : ${JSON.stringify(
  //     updateDeviceDto,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(`${fnName} : User is not available in request header`);
  //     throw Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     updateDeviceDto.updatedBy = userId;
  //     this.logger.debug(`${fnName} : Calling DetachVirtualDevice service`);

  //     return await this.deviceService.detachVirtualDevice(id, updateDeviceDto);
  //   }
  // }

  // @Patch()
  // async update(
  //   @UserId() userId: string,
  //   @Query('id') id: string,
  //   @Body() updateDeviceDto: UpdateDeviceDto,
  // ) {
  //   const fnName = 'update()';
  //   const input = `Input : id : ${id} , updateDeviceDto : ${JSON.stringify(
  //     updateDeviceDto,
  //   )}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   updateDeviceDto.updatedBy = userId;
  //   return await this.deviceService.update(id, updateDeviceDto);
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   const fnName = 'remove()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.deviceService.delete(id);
  // }

  // @Delete('softDelete/:id')
  // async softDelete(@Param('id') id: string) {
  //   const fnName = 'softDelete()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(`${fnName} : ${input}`);

  //   return await this.deviceService.softDelete(id);
  // }
}
