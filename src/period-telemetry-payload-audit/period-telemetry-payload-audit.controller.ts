import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
// import { PeriodTelemetryPayloadAuditService } from './period-telemetry-payload-audit.service';
import { CreatePeriodTelemetryPayloadAuditDto } from './dto/create-period-telemetry-payload-audit.dto';
import { UpdatePeriodTelemetryPayloadAuditDto } from './dto/update-period-telemetry-payload-audit.dto';
import { CreateTelemetryPayloadDto } from 'src/telemetry-payload/dto/create-telemetry-payload.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { getTryCatchErrorStr } from 'src/utils/others';
import { MetricsFrequency } from 'src/common';
import { FindPeriodTelemetryPayloadAuditDto } from './dto/find-period-telemetry-payload-audit.dto';
import { PeriodTelemetryPayloadAuditService } from './period-telemetry-payload-audit.service';
// import { MetricsFrequency } from 'src/utils/enums';
// import { winstonServerLogger } from 'app_config/serverWinston.config';
// import { getTryCatchErrorStr } from 'utils/others';
// import { MetricsFrequency } from 'utils/enums';

@Controller('period-telemetry-payload-audit')
export class PeriodTelemetryPayloadAuditController {
  private readonly logger = winstonServerLogger(
    PeriodTelemetryPayloadAuditController.name,
  );
  constructor(
    private readonly periodTelemetryPayloadAuditService: PeriodTelemetryPayloadAuditService,
  ) { }

  @Post()
  create(
    @Body()
    createPeriodTelemetryPayloadAuditDto: CreatePeriodTelemetryPayloadAuditDto,
  ) {
    return this.periodTelemetryPayloadAuditService.create(
      createPeriodTelemetryPayloadAuditDto,
    );
  }

  @Get('maximum')
  async getMaxValue(
    @Query('inputTime') inputTime: string
  ) {
    console.log("controller");
    const result = await this.periodTelemetryPayloadAuditService.aggregateDailyMaxPTPA(inputTime);
  }

  @Get()
  async findAll(
    // @Query() searchCriteria: FindPeriodTelemetryPayloadAuditDto,
    @Query('assetId') assetId: string,
    @Query('virtualDeviceId') virtualDeviceId: string,
    @Query('metricsAttributeId') metricsAttributeId: string,
    @Query('txnCapturePeriod') txnCapturePeriod: string,
  ) {
    return await this.periodTelemetryPayloadAuditService.findAll(
      assetId, virtualDeviceId, metricsAttributeId, txnCapturePeriod
    )
  }

  @Post('bulk')
  async createBulk(
    @Body()
    createPayloadTelemetryPayloadDTOs: CreatePeriodTelemetryPayloadAuditDto[],
  ) {
    const fnName = 'createBulk()';
    const input = `Input No of records : ${createPayloadTelemetryPayloadDTOs.length}`;
    try {
      this.logger.debug(`${fnName} : ${input}`);
      this.logger.debug(`${fnName} : Start`);
      return await this.periodTelemetryPayloadAuditService.createBulk(
        createPayloadTelemetryPayloadDTOs,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }

  @Get('aggregatePTPA')
  async aggregatePTPA(
    @Query('processingDateInEpoch') processingDateInEpoch: number,
    @Query('frequency') frequency: MetricsFrequency,
  ) {
    const fnName = this.aggregatePTPA.name;
    const input = `Input : processingDateInEpoch : ${processingDateInEpoch}, frequency : ${frequency}`;
    this.logger.debug(`${fnName} : ${input}`);
    this.logger.debug(`${fnName} : Start`);
    return await this.periodTelemetryPayloadAuditService.aggregatePTPA(
      processingDateInEpoch,
      frequency,
    );
  }

  @Get('periodDate')
  findByPeriodDate(@Query('periodDateInEpoch') periodDateInEpoch: number) {
    return this.periodTelemetryPayloadAuditService.findByDate(
      periodDateInEpoch,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.periodTelemetryPayloadAuditService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updatePeriodTelemetryPayloadAuditDto: UpdatePeriodTelemetryPayloadAuditDto,
  ) {
    return this.periodTelemetryPayloadAuditService.update(
      +id,
      updatePeriodTelemetryPayloadAuditDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.periodTelemetryPayloadAuditService.remove(+id);
  }

}
