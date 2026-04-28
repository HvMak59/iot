import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { SERVFAIL } from 'dns';
import _ from 'lodash';
import { Metric } from 'src/metrics/entities/metric.entity';
import { CreateTelemetryPayloadDto } from 'src/telemetry-payload/dto/create-telemetry-payload.dto';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { Repository } from 'typeorm/repository/Repository';
// import { MetricsFrequency } from 'src/utils/enums';
import { MetricsFrequency } from 'src/common';
import {
  convertInputToDate,
  convertpossibleStringTypeToInt,
  getPeriodTimeInEpoch,
  getTryCatchErrorStr,
} from 'src/utils/others';
import { CreatePeriodTelemetryPayloadAuditDto } from './dto/create-period-telemetry-payload-audit.dto';
import { FindPeriodTelemetryPayloadAuditDto } from './dto/find-period-telemetry-payload-audit.dto';
import { UpdatePeriodTelemetryPayloadAuditDto } from './dto/update-period-telemetry-payload-audit.dto';
import { PeriodTelemetryPayloadAudit } from './entities/period-telemetry-payload-audit.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { SavedTelemetryPayload } from 'src/app_config/constants';
import { Between, MoreThanOrEqual } from 'typeorm';

@Injectable()
export class PeriodTelemetryPayloadAuditService {
  private readonly logger = winstonServerLogger(
    PeriodTelemetryPayloadAuditService.name,
  );
  constructor(
    @InjectRepository(PeriodTelemetryPayloadAudit)
    private readonly repo: Repository<PeriodTelemetryPayloadAudit>,
  ) { }
  create(
    createPeriodTelemetryPayloadAuditDto: CreatePeriodTelemetryPayloadAuditDto,
  ) {
    return 'This action adds a new periodTelemetryPayloadAudit';
  }

  createBulk(
    createPeriodTelemetryPayloadDTOs: CreatePeriodTelemetryPayloadAuditDto[],
  ) {
    const fnName = this.createBulk.name;
    const input = `No of records : ${createPeriodTelemetryPayloadDTOs.length}`;
    const msgTemplate = fnName + ' ' + input;
    //try {
    this.logger.debug(`${msgTemplate} : Start`);
    const createRecords: CreatePeriodTelemetryPayloadAuditDto[] = [];
    for (const createPeriodTelemtryPayloadDTO of createPeriodTelemetryPayloadDTOs) {
      createPeriodTelemtryPayloadDTO.metric = new Metric(
        createPeriodTelemtryPayloadDTO.metric!,
      );
      if (createPeriodTelemtryPayloadDTO.metric.isPeriodic()) {
        createRecords.push(createPeriodTelemtryPayloadDTO);
      }
    }
    return this.repo.save(createRecords);
  }

  @OnEvent(SavedTelemetryPayload)
  async createBulk2(
    periodTelemetryPayloadDTOs: CreatePeriodTelemetryPayloadAuditDto[],
  ) {
    const fnName = this.createBulk.name;
    const input = `No of records : ${periodTelemetryPayloadDTOs.length}`;
    const msgTemplate = fnName + ' ' + input;
    //try {
    this.logger.debug(`${msgTemplate} : Start`);
    const createRecords: CreatePeriodTelemetryPayloadAuditDto[] = [];
    for (const periodTelemetryPayloadDTO of periodTelemetryPayloadDTOs) {
      periodTelemetryPayloadDTO.metric = new Metric(
        periodTelemetryPayloadDTO.metric!,
      );
      if (periodTelemetryPayloadDTO.metric.isPeriodic()) {
        createRecords.push(
          new PeriodTelemetryPayloadAudit(periodTelemetryPayloadDTO),
        );
      }
    }
    const result = await this.repo.save(createRecords);
    this.logger.debug(`${fnName} : No of records saved : ${result.length}`);
    return result;
  }

  async findByDate(periodDateInEpoch: number) {
    const fnName = 'findByDate()';
    const input = `periodDateInEpoch : ${periodDateInEpoch}`;
    const msgTemplate = fnName + ' ' + input;
    this.logger.debug(`${msgTemplate} : Start`);
    try {
      this.logger.debug(
        `Type of periodDateInEpoch : ${typeof periodDateInEpoch}`,
      );
      const periodDate: Date = new Date(
        convertpossibleStringTypeToInt(
          periodDateInEpoch,
        ) /* periodDateInEpoch as number */,
      );
      this.logger.debug(`period date : ${periodDate}`);
      const periodDateWithoutTime: Date = new Date(
        periodDate.getFullYear(),
        periodDate.getMonth(),
        periodDate.getDate(),
      );
      const searchCriteria: FindOptionsWhere<PeriodTelemetryPayloadAudit> = {
        metric: {
          txnCapturePeriod: periodDateWithoutTime,
        },
      };
      /* const result = await this.repo
        .createQueryBuilder('pTPA')
        .where('pTPA.metricTxncaptureperiod = :periodDate', {
          periodDate: periodDateWithoutTime,
        })
        .groupBy('pTPA.assetId')
        .addGroupBy('pTPA.virtualDeviceId')
        .getMany();
      return result; */
      const periodTelemetryPayloads = await this.repo.findBy(searchCriteria);
      //const periodTelemetryPayloads = await this.repo (searchCriteria);
      this.logger.debug(
        `${msgTemplate} : result : No of records : ${periodTelemetryPayloads.length}`,
      );
      return _.groupBy(periodTelemetryPayloads, this.getUniqueKey);
      //return periodTelemetryPayloads;
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${msgTemplate} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${msgTemplate} : End`);
    }
  }

  aggregatePTPA(processingDateInEpoch: number, frequency: MetricsFrequency) {
    const fnName = this.aggregatePTPA.name;
    const input = `Input : periodDateInEpoch : ${processingDateInEpoch}, frequency : ${frequency}`;
    this.logger.debug(`${fnName} : Start`);
    this.logger.debug(`${fnName} : ${input}`);
    const processingDate = convertInputToDate(processingDateInEpoch);
    const periodTimeInEpoch = getPeriodTimeInEpoch(
      convertpossibleStringTypeToInt(processingDateInEpoch), //processingDateInEpoch,
      frequency.toString(),
    );
    const periodDate: Date = new Date(periodTimeInEpoch);
    this.logger.debug(`${fnName} : periodDate : ${periodDate}`);
    try {
      return this.repo
        .createQueryBuilder('pTPA')
        .select([
          'pTPA.assetId',
          'pTPA.virtualDeviceId',
          'pTPA.metric.metricsAttributeId',
          'pTPA.metric.txnCapturePeriod',
        ])
        .addSelect(
          'MAX(CAST(pTPA.metric.measure AS DOUBLE PRECISION))',
          'measure',
        )
        .where('pTPA.metric.txnCapturePeriod = :periodDate', { periodDate })
        .andWhere('pTPA.metricFrequency = :frequency', { frequency })
        .andWhere('pTPA.auditDateTime.createdAt >= :processingDate', {
          processingDate,
        })
        .groupBy('pTPA.assetId')
        .addGroupBy('pTPA.virtualDeviceId')
        .addGroupBy('pTPA.metric.metricsAttributeId')
        .addGroupBy('pTPA.metric.txnCapturePeriod')
        .getRawMany();
      //.getQueryAndParameters();
      //this.logger.debug(`${fnName} : result : ${result}`);
      //return result;
      //return periodTelemetryPayloads;
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  /* findAll(searchCriteria: FindPeriodTelemetryPayloadAuditDto) {
    const fnName = 'findAll';
    const input = JSON.stringify(searchCriteria);
    const findPeriodTelemetryObj : FindOptionsWhere<PeriodTelemetryPayloadAudit>
    if (searchCriteria.periodDate) {

    }
    const findPeriodTelemetryObj : FindOptionsWhere<PeriodTelemetryPayloadAudit> = _.omit(searchCriteria, ['periodDate']);
  } */

  findOne(id: number) {
    return `This action returns a #${id} periodTelemetryPayloadAudit`;
  }

  update(
    id: number,
    updatePeriodTelemetryPayloadAuditDto: UpdatePeriodTelemetryPayloadAuditDto,
  ) {
    return `This action updates a #${id} periodTelemetryPayloadAudit`;
  }

  remove(id: number) {
    return `This action removes a #${id} periodTelemetryPayloadAudit`;
  }

  getUniqueKey(periodTelemetryPayloadAudit: PeriodTelemetryPayloadAudit) {
    return (
      periodTelemetryPayloadAudit.virtualDeviceId +
      '-' +
      periodTelemetryPayloadAudit.metric.metricsAttributeId
    );
  }


  // my code from here 
  async getMaxMetricsByInputDateQ(inputDate: string) {
    const date = new Date(inputDate);

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const records = await this.repo
      .createQueryBuilder('ptp')
      .select('ptp.assetId', 'assetId')
      .addSelect('ptp.virtualDeviceId', 'virtualDeviceId')
      .addSelect('ptp.metricMetricsAttributeId', 'metricsAttributeId')
      .addSelect('MAX(CAST(ptp.metricMeasure AS DOUBLE PRECISION))', 'maxValue')
      .addSelect('MAX(ptp.metricTxnCapturePeriod)', 'txnCapturePeriod')
      .where('ptp.metricTxnCapturePeriod BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('ptp.assetId')
      .addGroupBy('ptp.virtualDeviceId')
      .addGroupBy('ptp.metricMetricsAttributeId')
      .getRawMany();

    return records;
  }


  async getMaxMetricsByInputDate(processingDateInEpoch: number) {
    const fnName = this.getMaxMetricsByInputDate.name;

    this.logger.debug(`${fnName} : Start`);
    this.logger.debug(
      `${fnName} : Input : processingDateInEpoch : ${processingDateInEpoch}`,
    );

    try {
      const frequency = MetricsFrequency.DAILY;

      const processingDate = convertInputToDate(processingDateInEpoch);

      const periodTimeInEpoch = getPeriodTimeInEpoch(
        convertpossibleStringTypeToInt(processingDateInEpoch),
        frequency.toString(),
      );

      const periodDate = new Date(periodTimeInEpoch);

      const periodTelemetryPayloads = await this.repo.find({
        where: {
          metric: {
            txnCapturePeriod: periodDate,
            frequency: MetricsFrequency.DAILY,
          },
          auditDateTime: {
            createdAt: MoreThanOrEqual(processingDate),
          },
        },
      });

      let maxMeasure: number | null = null;

      for (const pTPA of periodTelemetryPayloads) {
        const measure = Number(pTPA.metric?.measure);

        if (Number.isNaN(measure)) continue;

        if (maxMeasure === null || measure > maxMeasure) {
          maxMeasure = measure;
        }
      }

      this.logger.debug(`${fnName} : max measure : ${maxMeasure}`);

      return maxMeasure;
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async aggregateDailyMaxPTPA(processingDateInEpoch: string) {
    const fnName = this.aggregateDailyMaxPTPA.name;

    console.log("service");

    this.logger.debug(`${fnName} : Start`);
    this.logger.debug(
      `${fnName} : Input : processingDateInEpoch : ${processingDateInEpoch}`,
    );

    try {
      const processingDate = convertInputToDate(processingDateInEpoch);

      const periodTimeInEpoch = getPeriodTimeInEpoch(
        convertpossibleStringTypeToInt(processingDateInEpoch),
        MetricsFrequency.DAILY.toString(),
      );

      const periodDate = new Date(periodTimeInEpoch);

      this.logger.debug(`${fnName} : periodDate : ${periodDate}`);

      const periodTelemetryPayloads =
        await this.findDailyPeriodTelemetryPayloads(periodDate, processingDate);

      const maxMeasure = this.findMaxMeasure(periodTelemetryPayloads);
      console.log(maxMeasure);
      return maxMeasure
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  private async findDailyPeriodTelemetryPayloads(
    periodDate: Date,
    processingDate: Date,
  ) {
    const fnName = this.findDailyPeriodTelemetryPayloads.name;

    this.logger.debug(`${fnName} : Start`);
    this.logger.debug(
      `${fnName} : periodDate : ${periodDate}, processingDate : ${processingDate}`,
    );

    try {
      const periodTelemetryPayloads = await this.repo.find({
        where: {
          metric: {
            txnCapturePeriod: periodDate,
            frequency: MetricsFrequency.DAILY,
          },
          // 
          auditDateTime: {
            createdAt: MoreThanOrEqual(processingDate),
          },
        },
      });

      this.logger.debug(
        `${fnName} : Found ${periodTelemetryPayloads.length} records`,
      );

      return periodTelemetryPayloads;
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private findMaxMeasure(
    periodTelemetryPayloads: PeriodTelemetryPayloadAudit[],
  ) {
    const fnName = this.findMaxMeasure.name;

    this.logger.debug(`${fnName} : Start`);

    try {
      const maxMap = new Map<
        string,
        {
          assetId: string;
          virtualDeviceId?: string;
          metricsAttributeId: string;
          txnCapturePeriod: Date;
          measure: number;
        }
      >();

      for (const pTPA of periodTelemetryPayloads) {
        const measure = Number(pTPA.metric?.measure);

        if (Number.isNaN(measure)) continue;

        const key = [
          pTPA.assetId,
          pTPA.virtualDeviceId ?? '',
          pTPA.metric.metricsAttributeId,
        ].join('|');

        const existing = maxMap.get(key);

        if (!existing || measure > existing.measure) {
          maxMap.set(key, {
            assetId: pTPA.assetId,
            virtualDeviceId: pTPA.virtualDeviceId,
            metricsAttributeId: pTPA.metric.metricsAttributeId,
            txnCapturePeriod: pTPA.metric.txnCapturePeriod,
            measure,
          });
        }
      }

      const result = Array.from(maxMap.values());

      this.logger.debug(`${fnName} : result count : ${result.length}`);

      return result;
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}


