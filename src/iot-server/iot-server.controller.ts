import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { IotServerService } from './iot-server.service';
import { FindAssetPerformanceTelemetry } from './dto/find-asset-performance-telemetry';
import { FindUserDto } from 'src/user/dto/find-user.dto';
import { getTryCatchErrorStr } from 'src/utils/others';
import { TelemetryPayload } from 'src/telemetry-payload/entities/telemetry-payload.entity';
import { FindAlertDto } from 'src/alert/dto/find-alert.dto';
import { FindAlertsByMultipleIDsDTO } from 'src/current-open-alert/dto/find-current-open-alert-byMultipleIDs.dto';
// import { FindOrgsOrAssets } from 'src/org/dto/find-orgs-or-assets';
import { FindUsersByMultipleIDs } from 'src/user/dto/find-user-by-multipleIDs.dto';
import { FindTelemetryPayloadForAPeriod } from 'src/telemetry-payload/dto/find-telemetry-payload-for-a-period.dto';
import { FindDevicesPerformanceTelemetryDto } from './dto/find-devices-performance-telemetry.dto';
import { FindCurrentTelemetryPayloadsByMultipleIDs } from 'src/current-telemetry-payload/dto/find-current-telemetry-payloads-byMultipleIDs.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { FindDevicesFromMultipleIDs } from 'src/device/dto/find-device-from-multiple-IDs.dto';
import { Public } from 'src/auth/entities/public_route';
import { InputAlertDto } from 'src/alert/dto/input-alert.dto';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
// import { Token } from 'utils/token.decorator';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { InputAlert2Dto } from 'src/alert/dto/input-alert2.dto';
import { Token } from 'src/utils/token.decorator';

@Controller('iot-server')
export class IotServerController {
  private readonly logger = winstonServerLogger(IotServerController.name);
  constructor(private readonly iotServerService: IotServerService) { }

  @Get('asset-current-performance-telemetry')
  getAssetCurrentPerformanceTelemetry(@Query('assetId') assetId: string) {
    // return this.iotServerService.getAssetCurrentPerformanceTelemetry(assetId);
  }

  @Get('asset-performance-telemetry')
  //@UseInterceptors(TelemetryPayloadTransformer)
  async getAssetPerformanceTelemetry(
    @Query() searchCriteria: FindAssetPerformanceTelemetry,
  ) {
    const fnName = 'getAssetPerformanceTelemetry()';
    const input = `Input : ${JSON.stringify(searchCriteria)}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      // return await this.iotServerService.getAssetPerformanceTelemetry(
      //   searchCriteria,
      // );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }

  @Get('devices-performance-telemetry')
  getPerformanceTelemetry(
    @Query() searchCriteria: FindDevicesPerformanceTelemetryDto,
  ) {
    // return this.iotServerService.getDevicesPerformanceTelemetry(searchCriteria);
  }

  @Get('current-open-alerts')
  getCurrentOpenAlerts(
    @Query()
    findCurrentOpenAlertOtherParamsDto: FindAlertsByMultipleIDsDTO,
  ) {
    // return this.iotServerService.getCurrentOpenAlertsFromMultipleParams(
    //   findCurrentOpenAlertOtherParamsDto,
    // );
  }

  @Get('alertsByMultipleIDs')
  getAlertsByMultipleIDs(
    @Query() findAlertsByMultipleIDs: FindAlertsByMultipleIDsDTO,
  ) {
    const fnName = this.getAlertsByMultipleIDs.name;
    const input = `Input : ${JSON.stringify(findAlertsByMultipleIDs)}`;
    this.logger.debug(`${fnName} : Start`);
    this.logger.debug(`${fnName} : ${input}`);
    // return this.iotServerService.getAlertsByMultipleIDs(
    //   findAlertsByMultipleIDs,
    // );
  }

  @Get('assetType-current-performance-telemetry')
  getAssetTypeCurrentPerformanceTelemetry(
    @Query('csvOrgIDs') csvOrgIDs: string,
    @Query('assetTypeID') assetTypeID: string,
  ) {
    // return this.iotServerService.getAssetTypeCurrentPerformanceTelemetry(
    //   csvOrgIDs,
    //   assetTypeID,
    // );
  }

  @Get('assetPerfTelemetryForAllMetricsAttributes')
  async getAssetPerformanceTelemetryForAllMetricsAttributes(
    @Query() searchCriteria: FindAssetPerformanceTelemetry,
  ) {
    const fnName =
      this.getAssetPerformanceTelemetryForAllMetricsAttributes.name;
    const input = `Input : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(`${fnName} : Start`);
    this.logger.debug(`${fnName} : ${input}`);
    // return await this.iotServerService.getAssetPerformanceTelemetryForAllMetricsAttributes1(
    //   searchCriteria,
    // );
  }

  @Get('assetTypeWiseAssetStateCount')
  getAssetTypeWiseAssetStateCount(@Query() findUserDto: FindUserDto) {
    // return this.iotServerService.getAssetTypeWiseAssetStateCount(findUserDto);
  }

  @Public()
  @Post('manageAlerts2')
  async manageAlerts2(
    @Token() token: string,
    @Query('assetID') assetID: string,
    @Query('csvVirtualDeviceIDs') csvVirtualDeviceIDs: string,
    //@Query('csvSourceAttributes') csvSourceAttributes: string,
    @Query('closeDateTime') closeDateTime: number,
    @Body() arrivedAlerts: InputAlert2Dto[],
  ) {
    const fnName = this.manageAlerts2.name;
    const input = `Input : assetID : ${assetID}, csvVirtualDeviceIDs: ${csvVirtualDeviceIDs}, closeDateTime: ${closeDateTime}, ArrivedAlerts : ${JSON.stringify(
      [...arrivedAlerts],
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);
    return await this.iotServerService.manageAlerts2(
      token,
      assetID,
      csvVirtualDeviceIDs,
      arrivedAlerts,
      //csvSourceAttributes,
      closeDateTime,
    );
  }
  /* Pending virtual device id changes */
  /* @Get('assetTypeCapacity')
  getAssetTypeCapacity(
    @Query('csvOrgIDs') csvOrgIDs: string,
    @Query('assetTypeID') assetTypeID: string,
  ) {
    return this.iotServerService.getAssetTypeCapacity(csvOrgIDs, assetTypeID);
  } */

  // @Get('allDescendentAssets')
  // getAllDescendentAssetsFromOrgs(@Query() findAssets: FindOrgsOrAssets) {
  //   return this.iotServerService.getAllDescedentUniqueOnlyAssets(findAssets);
  // }

  // @Get('assetTypeWiseAttribs')
  // getAssetTypeAttribs(@Query() findAssets: FindOrgsOrAssets) {
  //   return this.iotServerService.getAssetTypeWiseAttribs(findAssets);
  // }

  /* @Get('authenticateUser')
  //@Redirect()
  authenticateUser(@Query() findUserDto: FindUserDto) {
    return this.iotServerService.authenticateUser(findUserDto);
    let userAuthenticateUrl = new URL(
      USER_AUTHENTICATE_URL,
      process.env['BASE_URL'],
    );
    userAuthenticateUrl = getSearchParamsforURL(
      userAuthenticateUrl,
      JSON.stringify(findUserDto),
    );
    return { url: userAuthenticateUrl };
  } */

  @Get('devicesByMultipleIDs')
  async findDevicesFromMultipleIDs(
    @Query() findDevicesFromMultipleIDs: FindDevicesFromMultipleIDs,
  ) {
    const fnName = this.findDevicesFromMultipleIDs.name;
    const input = `Input : ${JSON.stringify(findDevicesFromMultipleIDs)}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      return await this.iotServerService.findDevicesFromMultipleIDs2(
        findDevicesFromMultipleIDs,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }

  // @Get('devicesByMultipleIDs/unAttachedDevices')
  // async findUnAttachedDevicesByMultipleIDs(
  //   @Query() findDevicesFromMultipleIDs: FindDevicesFromMultipleIDs,
  // ) {
  //   const fnName = `findUnAttachedDevicesByMultipleIDs()`;
  //   const input = `Input : ${JSON.stringify(findDevicesFromMultipleIDs)}`;
  //   //try {
  //   //this.logger.debug(`${fnName} : Start`);
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.iotServerService.findUnAttachedDevicesByMultipleIDs(
  //     findDevicesFromMultipleIDs,
  //   );
  //   /* } catch (error) {
  //     const errMsg = getTryCatchErrorStr(error);
  //     this.logger.error(`${fnName} : ${errMsg}`);
  //     throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //   } finally {
  //     this.logger.debug(`${fnName} : End`);
  //   } */
  // }

  /* @Get('devicesByMultipleIDs2')
  async findDevicesFromMultipleIDs2(
    @Query() findDevicesFromMultipleIDs: FindDevicesFromMultipleIDs,
  ) {
    const fnName = `findDevicesByMultipleIDs2()`;
    const input = `Input : ${JSON.stringify(findDevicesFromMultipleIDs)}`;
    try {
      this.logger.debug(`${fnName} : Start`);
      this.logger.debug(`${fnName} : ${input}`);
      return await this.iotServerService.findDevicesFromMultipleIDs2(
        findDevicesFromMultipleIDs,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  } */

  // @Get('currentTelemetryForDevice')
  // getCurrentTelemetryForDevice(
  //   @Query('assetID') assetID: string,
  //   @Query('virtualDeviceID') virtualDeviceID: string,
  //   @Query('deviceTypeID') deviceTypeID: string,
  // ) {
  //   return this.iotServerService.getDeviceCurrentTelemetry(
  //     assetID,
  //     virtualDeviceID,
  //     deviceTypeID,
  //   );
  // }

  // @Get('usersByMultipleIDs')
  // findUsersByMultipleIDs(
  //   @Query() findUsersByMultipleIDs: FindUsersByMultipleIDs,
  // ) {
  //   return this.iotServerService.findUsersByMultipleIDs(findUsersByMultipleIDs);
  // }

  @Public()
  @Post('telemetryMetrics')
  saveTelemetryMetrics(@Body() telemetryMetrics: TelemetryPayload[]) {
    this.logger.debug('Landed in ' + this.saveTelemetryMetrics.name);
    return this.iotServerService.saveTelemetryMetrics(telemetryMetrics);
  }

  // @Public()
  // @Post('telemetryAlerts')
  // saveTelemetryAlerts(@Body() inputAlerts: InputAlertDto[]) {
  // this.logger.debug(
  //   `saveTelemetryAlerts controller : ${JSON.stringify(inputAlerts)}`,
  // );
  // return this.iotServerService.saveTelemetryAlerts(inputAlerts);
  // }

  // @Public()
  // @Post('telemetryAlert')
  // saveTelemetryAlert(@Body() inputAlert: InputAlertDto) {
  //   const fnName = this.saveTelemetryAlert.name;
  //   this.logger.debug(`${ fnName } : ${ JSON.stringify(inputAlert) } `);
  //   return this.iotServerService.closeOtherTelemetryAlertsForANewAlert(
  //     inputAlert,
  //   );
  // }

  // @Public()
  // @Post('manageAlerts')
  // async manageAlerts(
  //   @Query('assetID') assetID: string,
  //   @Query('csvVirtualDeviceIDs') csvVirtualDeviceIDs: string,
  //   @Query('closeDateTime') closeDateTime: number,
  //   @Body() arrivedAlerts: InputAlertDto[],
  // ) {
  //   const fnName = this.manageAlerts.name;
  //   const input = `Input: assetID: ${ assetID }, csvVirtualDeviceIDs: ${ csvVirtualDeviceIDs }, closeDateTime: ${ closeDateTime }, ArrivedAlerts: ${
  // JSON.stringify(
  //     [...arrivedAlerts],
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   return await this.iotServerService.manageAlerts(
  //     assetID,
  //     csvVirtualDeviceIDs,
  //     arrivedAlerts,
  //     closeDateTime,
  //   );
  // }



  // // @Post('saveTelemetryAlerts3')
  // // async saveTelemetryAlerts3(
  // //   @Token() token: string,
  // //   @Body() inputAlerts: InputAlert2Dto[],
  // // ) {
  // //   const fnName = this.saveTelemetryAlerts3.name;
  // //   this.logger.debug(`${fnName} : ${JSON.stringify(inputAlerts)}`);
  // //   return await this.iotServerService.saveTelemetryAlerts3(token, inputAlerts);
  // // }

  // @Patch('closeAlerts')
  // async closeTelemetryAlerts(@Query() findAlertDto: FindAlertDto) {
  //   const fnName = this.closeTelemetryAlerts.name;
  //   const input = `Input : ${JSON.stringify(findAlertDto)}`;
  //   this.logger.debug(`${fnName} : ${input}`);
  //   return await this.iotServerService.closeTelemetryAlerts(findAlertDto);
  // }

  // @Delete('deleteDeviceGroupTelemetryForAPeriod')
  // deleteDeviceGroupTelemetryForAPeriod(
  //   @Query() deleteCriteria: FindTelemetryPayloadForAPeriod,
  // ) {
  //   return this.iotServerService.deleteDeviceGroupTelemetryForAPeriod(
  //     deleteCriteria,
  //   );
  // }

  // @Public()
  // @Get('unit')
  // getUnits(
  //   @Query('csvDeviceModelIDs') csvDeviceModelIDs: string,
  //   @Query('csvRelations') csvRelations: string,
  // ) {
  //   return this.iotServerService.getUnit(csvDeviceModelIDs, csvRelations);
  // }

  // /*@Get('metricsAttributes')
  // getMetricsAttributes(
  //   @Query() assetID: string,
  //   @Query('csvVirtualDeviceIDs') csvVirtualDeviceIDs: string,
  // ) {
  //   return this.iotServerService.getMetricsAttributes(
  //     assetID,
  //     csvVirtualDeviceIDs,
  //   );
  // } */

  // @Get('onlyMetricsAttributes')
  // getOnlyMetricsAttributes(
  //   @Query()
  //   findCurrentTelemetryPayloadsByMultipleIDs: FindCurrentTelemetryPayloadsByMultipleIDs,
  // ) {
  //   return this.iotServerService.getOnlyMetricsAttributes(
  //     findCurrentTelemetryPayloadsByMultipleIDs,
  //   );
  // }

  // @Get('orderedMetricsAttributes')
  // getOrderedMetricsAttributes(
  //   @Query()
  //   findCurrentTelemetryPayloadsByMultipleIDs: FindCurrentTelemetryPayloadsByMultipleIDs,
  // ) {
  //   return this.iotServerService.getOrderedMetricsAttributes(
  //     findCurrentTelemetryPayloadsByMultipleIDs,
  //   );
  // }

  // @Get('assetPerformanceMainAttributes')
  // getAssetPerformanceMainAttributes(@Query('assetID') assetID: string) {
  //   return this.iotServerService.getAssetPerformanceMainAttributes(assetID);
  // }

  // /* @Get('onlyMetricsFromDeviceIDs')
  // getOnlyMetricsFromDeviceIDs(@Query('csvDeviceIDs') csvDeviceIDs: string) {
  //   return this.iotServerService.getOnlyMetricsFromDeviceIDs(csvDeviceIDs);
  // } */

  // /* @Get('deviceTypeWiseAttribs')
  // getDeviceTypeWiseAttribs(@Query() findOrgsOrAssets: FindOrgsOrAssets) {
  //   return this.iotServerService.getDeviceTypeWiseAttribs(findOrgsOrAssets);
  // } */

  // @Public()
  // @Patch('updateDevices')
  // updateDeviceWithStateCode(@Body() deviceStateBO: DeviceStateDto[]) {
  //   return this.iotServerService.updateDeviceState(deviceStateBO);
  // }

  // @Public()
  // @Get('closeAlertsForNoAlerts')
  // async closeAlertsForNoAlerts(
  //   @Query('virtualDeviceID') virtualDeviceID: string,
  //   @Query('closeDateTimeInEpoch') closeDateTimeInEpoch: string,
  // ) {
  //   const fnName = this.closeAlertsForNoAlerts.name;
  //   this.logger.debug(
  //     `${fnName} : Input : ${virtualDeviceID}, ${closeDateTimeInEpoch}`,
  //   );
  //   return await this.iotServerService.closeAlertsForNoAlerts(
  //     virtualDeviceID,
  //     closeDateTimeInEpoch,
  //   );
  // }

  // @Get('mAFsFrmDvcTyp')
  // async getMetricsAttributeFormulasFromDeviceType(
  //   @Token() token: string,
  //   @Query('deviceTypeId') deviceTypeId: string,
  // ) {
  //   const fnName = this.getMetricsAttributeFormulasFromDeviceType.name;
  //   this.logger.debug(`${fnName} : Input : device type Id : ${deviceTypeId}`);
  //   return await this.iotServerService.getMetricsAttributeFormulasFromDeviceType(
  //     token,
  //     deviceTypeId,
  //   );
  // }

  // /* @Post('adaptAlertsAndTelemetry')
  // adaptAlertsAndTelemetry(
  //   @Query('telemetryAdaptorId') telemetryAdaptorID: string,
  //   @Query('deviceTypeId') deviceTypeID: string,
  //   @Body() createTelemetryPayloads: CreateTelemetryPayloadDto[],
  // ) {
  //   return this.iotServerService.adaptAlertsAndTelemetry(
  //     telemetryAdaptorID,
  //     createTelemetryPayloads,
  //   );
  // } */
  // /* authenticateUser(@Query() findUserDto: FindUserDto) {
  //   return this.iotServerService.authenticateUser(findUserDto);
  // } */

  // /* @Post()
  // create(@Body() createIotServerDto: CreateIotServerDto) {
  //   return this.iotServerService.create(createIotServerDto);
  // }

  // @Get()
  // findAll() {
  //   return this.iotServerService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.iotServerService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateIotServerDto: UpdateIotServerDto) {
  //   return this.iotServerService.update(+id, updateIotServerDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.iotServerService.remove(+id);
  // } */
}
