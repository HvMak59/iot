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
// import { KEY_SEPARATOR } from 'src/app_config/constants';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { Public } from 'src/auth/entities/public_route';
import { FindDeviceModelAlertByMultipleIDs } from 'src/device-model-alert/dto/find-device-model-alert-byMultipleIDs.dto';
// import { UserId } from 'src/utils/req-user-id.decorator';
import { DeviceModelService } from './device-model.service';
import { CreateDeviceModelDto } from './dto/create-device-model.dto';
import { FindDeviceModelDto } from './dto/find-device-model.dto';
import { UpdateDeviceModelDto } from './dto/update-device-model.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { UserId } from 'src/utils/req-user-id.decorator';
import { KEY_SEPARATOR } from 'src/app_config/constants';

@Controller('device-model')
export class DeviceModelController {
  private readonly logger = winstonServerLogger(DeviceModelController.name);
  constructor(private readonly deviceModelService: DeviceModelService) { }

  @Post()
  async create(
    @Body() createDeviceModelDto: CreateDeviceModelDto,
    @UserId() userId: string,
  ) {
    const fnName = 'create()';
    const input = `Input : ${JSON.stringify(createDeviceModelDto)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);
    createDeviceModelDto.createdBy = userId;
    return await this.deviceModelService.create(createDeviceModelDto);
  }

  // @Get('csvIDs')
  // async findFromCSVIDs(
  //   @Query('csvIDs') csvIDs: string,
  //   @Query('csvDeviceTypeIDs') csvDeviceTypeIDs: string,
  // ) {
  //   const fnName = 'findFromCSVIDs()';
  //   const input = `Input : csvIDs : ${csvIDs} , csvDeviceTypeIDs : ${csvDeviceTypeIDs}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceModelService.findFromCSVIDs(
  //     csvIDs,
  //     csvDeviceTypeIDs,
  //   );
  // }

  // /* @Get('csvIDs')
  // findFromCSVIDsWithDeviceModel(
  //   @Query('csvIDs') csvIDs: string,
  //   @Query('csvDeviceTypeIDs') csvDeviceTypeIDs: string,
  // ) {
  //   return this.deviceModelService.findFromCSVIDs(csvIDs, csvDeviceTypeIDs, ["deviceModel"]);
  // } */

  // @Get('csvIDs/relations')
  // async findFromCSVIDsWthRelations(
  //   @Query('csvIDs') csvIDs: string,
  //   @Query('csvDeviceTypeIDs') csvDeviceTypeIDs: string,
  // ) {
  //   const relationsFlag = true;
  //   const fnName = 'findFromCSVIDsWthRelations()';
  //   const input = `Input : csvIDs : ${csvIDs} , csvDeviceTypeIDs : ${csvDeviceTypeIDs}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceModelService.findFromCSVIDs(
  //     csvIDs,
  //     csvDeviceTypeIDs,
  //     relationsFlag,
  //   );
  // }

  // @Get('csvIDs/unit')
  // async findUnits(@Query('csvIDs') csvIDs: string) {
  //   const fnName = 'findUnits()';
  //   const input = `Input : csvIDs : ${csvIDs}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceModelService.findUnits(csvIDs);
  // }

  // @Get()
  // async findAll(@Query() searchCriteria: FindDeviceModelDto) {
  //   const fnName = 'findAll()';
  //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
  //   //const relationsRequired = true;
  //   return await this.deviceModelService.findAll(searchCriteria);
  // }

  // @Get('relations')
  // findAllWthRelations(@Query() searchCriteria: FindDeviceModelDto) {
  //   const fnName = 'findAllWthRelations()';
  //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
  //   const relationsRequired = true;
  //   return this.deviceModelService.findAll(searchCriteria, relationsRequired);
  // }

  // @Get('alertMasterIdentifiers')
  // async findAllWthAMIs(@Query() searchCriteria: FindDeviceModelDto) {
  //   const fnName = this.findAllWthAMIs.name;
  //   const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.deviceModelService.findAllWthAMIs(searchCriteria);
  // }

  // @Get('one/relations')
  // async findOneByIdWithRelations(@Query('id') id: string) {
  //   const fnName = 'findOneByIdWithRelations()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
  //   return await this.deviceModelService.findOneByIdWthRelations(id);
  // }

  // @Get('one')
  // async findOneById(@Query('id') id: string) {
  //   const fnName = 'findOneById()';
  //   const input = `Input : id : ${id}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
  //   return await this.deviceModelService.findOneById(id);
  // }

  // @Public()
  @Get('alerts')
  async findAlertsFromMultipleIDs(
    @Query() searchObj: FindDeviceModelAlertByMultipleIDs,
  ) {
    const fnName = this.findAlertsFromMultipleIDs.name;
    const input = `Input : ${JSON.stringify(searchObj)}`;
    this.logger.debug(`${fnName} ${KEY_SEPARATOR} ${input}`);
    return await this.deviceModelService.findAlertsFromMultipleIDs(searchObj);
  }

  // @Patch()
  // async update(
  //   @Query('id') id: string,
  //   @UserId() userId: string,
  //   @Body() updateDeviceModelDto: UpdateDeviceModelDto,
  // ) {
  //   const fnName = 'update()';
  //   const input = `Input : Id : ${id} , updateDeviceModelDto : ${JSON.stringify(
  //     updateDeviceModelDto,
  //   )}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   updateDeviceModelDto.updatedBy = userId;
  //   return await this.deviceModelService.update(id, updateDeviceModelDto);
  // }

  // @Patch('restore/:id')
  // restore(@Param('id') id: string) {
  //   return this.deviceModelService.restore(id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.deviceModelService.delete(id);
  // }

  // @Delete('softDelete/:id')
  // softDelete(@Param('id') id: string) {
  //   return this.deviceModelService.softDelete(id);
  // }
}
