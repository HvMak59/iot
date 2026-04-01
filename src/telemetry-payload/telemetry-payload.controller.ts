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
import { TelemetryPayloadService } from './telemetry-payload.service';
import { CreateTelemetryPayloadDto } from './dto/create-telemetry-payload.dto';
import { UpdateTelemetryPayloadDto } from './dto/update-telemetry-payload.dto';
import { FindTelemetryPayload } from './dto/find-telemetry-payload-before-given-time.dto';
import { FindTelemetryPayloadForAPeriod } from './dto/find-telemetry-payload-for-a-period.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { Public } from 'src/auth/entities/public_route';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from 'src/app_config/constants';
import { UserId } from 'src/utils/req-user-id.decorator';



@Controller('telemetry-payload')
export class TelemetryPayloadController {
  private readonly logger = winstonServerLogger(
    TelemetryPayloadController.name,
  );
  constructor(
    private readonly telemetryPayloadService: TelemetryPayloadService,
  ) { }

  // @Post()
  // create(@Body() createTelemetryPayloadsDto: CreateTelemetryPayloadDto[]) {
  //   return this.telemetryPayloadService.create(createTelemetryPayloadsDto);
  // }

  // @Get('assetID')
  // findByAssetId(@Query('assetID') assetID: string) {
  //   return this.telemetryPayloadService.findByAssetId(assetID);
  // }
  // @Get('timePeriod')
  // async findForATimePeriod(@Query() searchCriteria: FindTelemetryPayloadForAPeriod) {
  //   this.logger.debug(
  //     `Search Criteria : ${JSON.stringify(searchCriteria, null, 2)}`,
  //   );
  //   return await this.telemetryPayloadService.findForATimePeriod(searchCriteria);
  // }

  // // @Get('multipleDevicesTimePeriod')
  // // async findForMultipleDevicesForATimePeriod(
  // //   @Query() searchCriteria: FindDevicesPerformanceTelemetryDto,
  // // ) {
  // //   this.logger.debug(
  // //     `Multiple Devices Time Period : Input : ${JSON.stringify(
  // //       searchCriteria,
  // //     )}`,
  // //   );
  // //   return await this.telemetryPayloadService.findForMultipleDevicesForATimePeriod(
  // //     searchCriteria,
  // //   );
  // // }

  // /* @Get('givenTimeRangeInDescOrder')
  // async findForGivenTimeRangeInDescOrder(
  //   @Query() searchCriteria: FindTelemetryPayloadsFromMultipleIDs,
  // ) {
  //   this.logger.debug(
  //     `Given Time Range In Desc Order : Input : ${JSON.stringify(
  //       searchCriteria,
  //     )}`,
  //   );
  //   return await this.telemetryPayloadService.findWithInGivenTimeRange(
  //     searchCriteria,
  //   );
  // } */

  // /* @Get(LAST_RECS_FROM_GIVEN_TIME_RANGE_URL)
  // async findLastRecForGivenTimeRange(
  //   @Query() searchCriteria: FindTelemetryPayloadsFromMultipleIDs,
  // ) {
  //   this.logger.debug(
  //     `Last Record For Given Time Range : Input : ${JSON.stringify(
  //       searchCriteria,
  //     )}`,
  //   );
  //   return await this.telemetryPayloadService.lastRecsOfGivenTimeRange(
  //     searchCriteria,
  //   );
  // } */

  // @Get('relations')
  // findAllWthRelations() {
  //   return this.telemetryPayloadService.findAllWthRelations();
  // }

  // @Get('relations/:id')
  // findOneByIdWithRelations(@Param('id') id: string) {
  //   return this.telemetryPayloadService.findOneByIdWthRelations(id);
  // }

  // /* @Get('asset/:assetId/vd/:vdId/measure/:measureName/date/:tDate')
  // findByAssetIdVdIdMeasureDate(
  //   @Param('assetId') assetId: string,
  //   @Param('vdId') vdId: string,
  //   @Param('measureName') measureName: string,
  //   @Param('tDate') tDate: string,
  // ): any {
  //   const reportDate = new Date(tDate);
  //   this.logger.debug(`Report date : ${reportDate}`);
  //   if (reportDate.toString() == 'Invalid Date') {
  //     throw new Error(`Invalid date : ${reportDate}`);
  //   }
  //   return this.telemetryPayloadService.findByAssetIdVdIdMeasureDate(
  //     assetId,
  //     vdId,
  //     measureName,
  //     reportDate,
  //   );
  // } */

  // @Public()
  // @Get('findOneBeforeOrEqualGivenTime')
  // findOneBeforeOrEqualGivenTime(@Query() searchCriteria: FindTelemetryPayload) {
  //   return this.telemetryPayloadService.findOneBeforeOrEqualGivenTime(
  //     searchCriteria,
  //   );
  // }

  // @Get(':id')
  // findOneById(@Param('id') id: string) {
  //   return this.telemetryPayloadService.findOneById(id);
  // }
  @Patch()
  update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateTelemetryPayloadDto: UpdateTelemetryPayloadDto,
  ) {
    const fnName = 'update()';
    const input = `Input : Id : ${id} and updateTelemetryPayloadDto : ${JSON.stringify(
      updateTelemetryPayloadDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      return this.telemetryPayloadService.update(id, updateTelemetryPayloadDto);
    }
  }

  // @Patch('restore/:id')
  // restore(@Param('id') id: string) {
  //   return this.telemetryPayloadService.restore(id);
  // }

  // @Delete('softDelete/deviceGroupForAPeriod')
  // softDeleteDeviceGroupForTimePeriod(
  //   @Query() deleteCriteria: FindTelemetryPayloadForAPeriod,
  // ) {
  //   return this.telemetryPayloadService.deleteDeviceGroupForTimePeriod(
  //     deleteCriteria,
  //   );
  // }

  // @Delete('softDelete/:id')
  // softDelete(@Param('id') id: string) {
  //   return this.telemetryPayloadService.softDelete(id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.telemetryPayloadService.delete(id);
  // }
}
