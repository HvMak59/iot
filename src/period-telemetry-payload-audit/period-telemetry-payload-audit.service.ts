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
  getPeriodTime,
  getPeriodTimeInEpoch,
  getTryCatchErrorStr,
} from 'src/utils/others';
import { CreatePeriodTelemetryPayloadAuditDto } from './dto/create-period-telemetry-payload-audit.dto';
import { FindPeriodTelemetryPayloadAuditDto } from './dto/find-period-telemetry-payload-audit.dto';
import { UpdatePeriodTelemetryPayloadAuditDto } from './dto/update-period-telemetry-payload-audit.dto';
import { PeriodTelemetryPayloadAudit } from './entities/period-telemetry-payload-audit.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { KEY_SEPARATOR, SavedTelemetryPayload } from 'src/app_config/constants';
import { Between, LessThan, MoreThanOrEqual } from 'typeorm';
import { TelemetryPayloadService } from 'src/telemetry-payload/telemetry-payload.service';
import { VirtualDeviceGroupService } from 'src/virtual-device-group/virtual-device-group.service';
import { GroupService } from 'src/group/group.service';
import { MetricsAttributeAggregationService } from 'src/metrics-attribute-aggregation/metrics-attribute-aggregation.service';
import { VirtualDeviceService } from 'src/virtual-device/virtual-device.service';
import { audit } from 'rxjs';
import { TelemetryPayload } from 'src/telemetry-payload/entities/telemetry-payload.entity';


@Injectable()
export class PeriodTelemetryPayloadAuditService {
  private readonly logger = winstonServerLogger(
    PeriodTelemetryPayloadAuditService.name,
  );
  constructor(
    @InjectRepository(PeriodTelemetryPayloadAudit)
    private readonly repo: Repository<PeriodTelemetryPayloadAudit>,
    private readonly telemetryPayloadService: TelemetryPayloadService,
    private readonly virtualDeviceService: VirtualDeviceService,
    private readonly metricsAttributeAggregationService: MetricsAttributeAggregationService,
    private readonly groupService: GroupService
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

        const key =
          pTPA.assetId + KEY_SEPARATOR +
          pTPA.virtualDeviceId + KEY_SEPARATOR +
          pTPA.metric.metricsAttributeId;

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

  async findAll(
    // searchCriteria: FindPeriodTelemetryPayloadAuditDto
    asseId: string, virtualDeviceId: string, metricsAttributeId: string, txnCapturePeriod: string
  ) {
    console.log(txnCapturePeriod)
    const date = new Date(Number(txnCapturePeriod).valueOf())
    console.log(date);

    const processingDate = convertInputToDate(txnCapturePeriod);

    const periodTimeInEpoch = getPeriodTimeInEpoch(
      convertpossibleStringTypeToInt(txnCapturePeriod),
      MetricsFrequency.DAILY.toString(),
    );

    // 
    const periodDate = new Date(periodTimeInEpoch);

    const result = await this.repo.find({
      select: {
        id: true,
        metric: {
          metricsAttributeId: true,
          measure: true,
          txnCapturePeriod: true,
          txnCaptureTime: true
        }
      },
      where: {
        assetId: asseId,
        virtualDeviceId: virtualDeviceId,
        metric: {
          metricsAttributeId: metricsAttributeId,
          txnCapturePeriod: periodDate,
          frequency: MetricsFrequency.DAILY,
        },
        auditDateTime: {
          createdAt: MoreThanOrEqual(processingDate),
        }
      },
    });
    console.log(result);
    console.log(result.length);

    return result;
  }




  // New service  - working for max measure 
  async processMaxTelemetryAggregation(
    inputTime: string,
    metricsFrequency: MetricsFrequency,
    isCalculationForced: boolean
  ) {
    // Record Set A
    const recordSetA =
      await this.findPeriodTelemetryRecordSetA(
        inputTime,
        metricsFrequency,
        isCalculationForced,
      );

    // Record Set B
    const recordSetB =
      await this.telemetryPayloadService.findTelemetryPayloadRecordSetB(
        recordSetA,
      );

    const corrected = 4;
    // Record Set C 
    // const recordSetC =
    //   // await this.findRecordSetC(recordSetB);
    //   await this.virtualDeviceService.findRecordSetC(recordSetA);

    // // Record Set D
    // const recordSetD =
    //   await this.findMaxTelemetryValueRecordSetD(
    //     recordSetC,
    //   );

    // const recordSetE =
    //   await this.prepareRecordSetE(
    //     recordSetB,
    //     recordSetD,
    //   );

    const recordSetC =
      await this.virtualDeviceService.findRecordSetC(recordSetA);

    const recordSetD =
      await this.findMaxTelemetryValueRecordSetD(recordSetA);

    const recordSetE =
      await this.prepareRecordSetE(recordSetB, recordSetD);

    // const recordSetF =
    //   await this.prepareRecordSetF(
    //     recordSetE,
    //     recordSetC,
    //   );

    return {
      recordSetA,
      recordSetB,
      recordSetD,
      recordSetE
    };
  }

  private myOldWorking = 5;
  // async findPeriodTelemetryRecordSetA(
  //   inputDate: string,
  //   metricsFrequency: string,
  //   isCalculationForced: boolean,
  // ) {
  //   const whereCondition: any = {
  //     createdOn: inputDate,
  //     frequency: metricsFrequency,
  //   };

  //   if (isCalculationForced == false) {
  //     whereCondition.txnCapturePeriod = LessThan(inputDate);
  //   }

  //   const records = await this.repo.find({
  //     where: whereCondition,
  //     relations: {
  //       metric: true,
  //     },
  //     select: {
  //       assetId: true,
  //       virtualDeviceId: true,
  //       metric: {
  //         metricsAttributeId: true,
  //         txnCapturePeriod: true,
  //         txnCaptureTime: true
  //       },
  //     },
  //   });

  //   const groupedMap = new Map<string, any>();

  //   for (const record of records) {
  //     // const key =
  //     //   record.assetId + KEY_SEPARATOR +
  //     //   record.virtualDeviceId + KEY_SEPARATOR +
  //     //   record.metric.metricsAttributeId + KEY_SEPARATOR +
  //     //   record.metric.txnCapturePeriod

  //     const key = this.getTelemetryKey(record);

  //     if (!groupedMap.has(key)) {
  //       groupedMap.set(key, record);
  //     }
  //   }
  //   return Array.from(groupedMap.values());
  // }

  async findPeriodTelemetryRecordSetA(
    inputTimeInEpoch: string,
    metricsFrequency: MetricsFrequency,
    isCalculationForced: boolean,
  ) {
    const inputDate = convertInputToDate(inputTimeInEpoch);
    // const periodTimeInEpoch = getPeriodTimeInEpoch(
    //   convertpossibleStringTypeToInt(inputTimeInEpoch), //processingDateInEpoch,
    //   metricsFrequency.toString(),
    // );
    // const periodDate: Date = new Date(periodTimeInEpoch);

    const whereCondition: FindPeriodTelemetryPayloadAuditDto = {
      metric: {
        frequency: metricsFrequency,
      },
      auditDateTime: {
        createdAt: MoreThanOrEqual(inputDate),
      },
    };

    if (isCalculationForced == false) {
      whereCondition.metric = {
        frequency: metricsFrequency,
        txnCapturePeriod: LessThan(
          inputDate
        ),
      };
    }

    // console.log("where condition", whereCondition);
    const records = await this.repo.find({
      where: whereCondition,
      select: {
        assetId: true,
        virtualDeviceId: true,
        metric: {
          measure: true,
          metricsAttributeId: true,
          txnCapturePeriod: true,
          txnCaptureTime: true,
          frequency: true
        },
      },
    });

    const groupedRecords = _.groupBy(records, (record: PeriodTelemetryPayloadAudit) =>
      record.getTelemetryKey(),
    );

    return Object.values(groupedRecords).map((group) => group[0]);
  }

  // async findRecordSetC(recordSetB: any[]) {
  //   const recordSetC = [];

  //   const uniqueAssetVDMap = new Map<string, any>();

  //   for (const record of recordSetB) {
  //     const key = record.assetId + KEY_SEPARATOR + record.virtualDeviceId;

  //     if (!uniqueAssetVDMap.has(key)) {
  //       uniqueAssetVDMap.set(key, {
  //         assetId: record.assetId,
  //         virtualDeviceId: record.virtualDeviceId,
  //       });
  //     }
  //   }

  //   for (const item of uniqueAssetVDMap.values()) {
  //     const virtualDevice = await this.virtualDeviceService.findOne({
  //       where: {
  //         assetId: item.assetId,
  //         virtualDeviceId: item.virtualDeviceId,
  //       },
  //     });

  //     if (!virtualDevice) continue;

  //     const childrenVDs = await this.virtualDeviceService.find({
  //       where: {
  //         assetId: item.assetId,
  //         parentVirtualDeviceId: item.virtualDeviceId,
  //       },
  //     });

  //     const group = await this.groupService.findOne({
  //       where: {
  //         assetId: item.assetId,
  //         virtualDeviceId: item.virtualDeviceId,
  //       },
  //     });

  //     const metricsAggregationRecords =
  //       await this.metricsAttributeAggregationService.find({
  //         where: {
  //           groupId: group?.id,
  //         },
  //       });

  //     recordSetC.push({
  //       assetId: item.assetId,
  //       virtualDeviceId: item.virtualDeviceId,
  //       parentVirtualDeviceId: virtualDevice.parentVirtualDeviceId,
  //       childrenVDIDs: childrenVDs.map((child) => child.virtualDeviceId),
  //       groupId: group?.id,
  //       metricsAggregationRecords,
  //     });
  //   }

  //   return recordSetC;
  // }


  private thisWasLast = 5;
  // async findRecordSetC(recordSetB: any[]) {
  //   const recordSetC = [];

  //   const uniqueAssetVDMap = new Map<string, any>();

  //   for (const record of recordSetB) {
  //     const key = record.assetId + KEY_SEPARATOR + record.virtualDeviceId;

  //     if (!uniqueAssetVDMap.has(key)) {
  //       uniqueAssetVDMap.set(key, {
  //         assetId: record.assetId,
  //         virtualDeviceId: record.virtualDeviceId,
  //       });
  //     }
  //   }

  //   for (const item of uniqueAssetVDMap.values()) {
  //     const virtualDevice = await this.virtualDeviceService.findOne({
  //       where: {
  //         assetId: item.assetId,
  //         id: item.virtualDeviceId,
  //       },
  //     });

  //     if (!virtualDevice) continue;

  //     const childrenVDs = await this.virtualDeviceService.find({
  //       where: {
  //         assetId: item.assetId,
  //         parentId: item.virtualDeviceId,
  //       },
  //     });

  //     const group = await this.groupService.findOne({
  //       where: {
  //         assetId: item.assetId,
  //         virtualDeviceId: item.virtualDeviceId,
  //       },
  //     });
  //     //  
  //     const metricsAggregationRecords =
  //       await this.metricsAttributeAggregationService.find({
  //         where: {
  //           groupId: group?.id,
  //         },
  //       });

  //     recordSetC.push({
  //       assetId: item.assetId,
  //       virtualDeviceId: virtualDevice.id,
  //       parentVirtualDeviceId: virtualDevice.parentId,
  //       childrenVDIDs: childrenVDs.map((child) => child.id),
  //       groupId: group?.id,
  //       metricsAggregationRecords,
  //     });
  //   }

  //   return recordSetC;
  // }

  private correctOld = 4;
  // async findMaxTelemetryValueRecordSetD(recordSetB: any[]) {
  //   const maxMap = new Map<string, any>();

  //   for (const record of recordSetB) {
  //     // const key =
  //     //   record.assetId + KEY_SEPARATOR +
  //     //   record.virtualDeviceId + KEY_SEPARATOR +
  //     //   record.metric.metricsAttributeId + KEY_SEPARATOR +
  //     //   record.metric.txnCapturePeriod
  //     // 

  //     const key = this.getTelemetryKey(record);

  //     const existingRecord = maxMap.get(key);

  //     if (!existingRecord) {
  //       maxMap.set(key, record);
  //       continue;
  //     }

  //     const existingValue = Number(existingRecord.metric.measure ?? 0);
  //     const currentValue = Number(record.metric.measure ?? 0);

  //     if (currentValue > existingValue) {
  //       maxMap.set(key, record.metric.measure);
  //     }
  //   }

  //   return Array.from(maxMap.values());
  // }

  async findMaxTelemetryValueRecordSetD(recordSetA: PeriodTelemetryPayloadAudit[]) {
    const maxMap = new Map<string, any>();

    for (const record of recordSetA) {
      const measure = Number(record.metric?.measure);

      if (Number.isNaN(measure)) continue;

      // const key = this.getTelemetryKey(record);
      const key = record.getTelemetryKey();;

      const existingRecord = maxMap.get(key);

      if (!existingRecord) {
        maxMap.set(key, record);
        continue;
      }

      const existingValue = Number(existingRecord.metric?.measure ?? 0);

      if (measure > existingValue) {
        maxMap.set(key, record);
      }
    }
    return Array.from(maxMap.values());
  }


  private correctOldd = 5;
  // async prepareRecordSetE(
  //   recordSetB: any[],
  //   recordSetD: any[]
  // ) {
  //   const recordSetEMap = new Map<string, any>();

  //   for (const recordB of recordSetB) {
  //     const key = this.getTelemetryKey(recordB);

  //     const recordD = recordSetD.find(
  //       (item) => this.getTelemetryKey(item) === key,
  //     );

  //     if (!recordD) {
  //       recordSetEMap.set(key, recordB);
  //       continue;
  //     }

  //     const recordBValue = Number(recordB.metric?.metricsValue ?? 0);
  //     const recordDValue = Number(recordD.metric?.metricsValue ?? 0);

  //     if (recordDValue > recordBValue) {
  //       recordSetEMap.set(key, recordD);
  //     } else {
  //       recordSetEMap.set(key, recordB);
  //     }
  //   }

  //   for (const recordD of recordSetD) {
  //     const key = this.getTelemetryKey(recordD);

  //     if (!recordSetEMap.has(key)) {
  //       recordSetEMap.set(key, recordD);
  //     }
  //   }

  //   return Array.from(recordSetEMap.values());
  // }

  async prepareRecordSetE(
    recordSetB: TelemetryPayload[],
    recordSetD: PeriodTelemetryPayloadAudit[],
  ) {
    const recordSetDMap = new Map<string, any>();

    for (const recordD of recordSetD) {
      // const key = this.getTelemetryKey(recordD);
      const key = recordD.getTelemetryKey();;
      recordSetDMap.set(key, recordD);
    }

    const recordSetEMap = new Map<string, any>();

    for (const recordB of recordSetB) {
      // const key = this.getTelemetryKey(recordB);
      const key = recordB.getTelemetryKey();

      const recordD = recordSetDMap.get(key);

      if (!recordD) {
        recordSetEMap.set(key, recordB);

        continue;
      }

      const recordBValue = Number(recordB.metric?.measure);
      const recordDValue = Number(recordD.metric?.measure);

      if (recordDValue > recordBValue) {
        recordSetEMap.set(key, recordD);
      } else {
        recordSetEMap.set(key, recordB);
      }
    }

    for (const recordD of recordSetD) {
      // const key = this.getTelemetryKey(recordD);
      const key = recordD.getTelemetryKey();

      if (!recordSetEMap.has(key)) {
        recordSetEMap.set(key, recordD);
      }
    }

    return Array.from(recordSetEMap.values());
  }


  //   async prepareRecordSetE(
  //   recordSetB: any[],
  //   recordSetD: any[],
  // ) {
  //   const recordSetDMap =
  //     new Map<string, any>();

  //   for (const recordD of recordSetD) {
  //     recordSetDMap.set(
  //       recordD.getTelemetryKey(),
  //       recordD,
  //     );
  //   }

  //   const recordSetEMap =
  //     new Map<string, any>();

  //   for (const recordB of recordSetB) {
  //     const key =
  //       recordB.getTelemetryKey();

  //     const recordD =
  //       recordSetDMap.get(key);

  //     /**
  //      * D not present
  //      */
  //     if (!recordD) {
  //       recordSetEMap.set(
  //         key,
  //         recordB,
  //       );

  //       continue;
  //     }

  //     const recordBValue = Number(
  //       recordB.metric?.measure,
  //     );

  //     const recordDValue = Number(
  //       recordD.metric?.measure,
  //     );

  //     /**
  //      * store max
  //      */
  //     recordSetEMap.set(
  //       key,
  //       recordDValue > recordBValue
  //         ? recordD
  //         : recordB,
  //     );
  //   }

  //   /**
  //    * Add remaining D records
  //    * that were not in B
  //    */
  //   for (const recordD of recordSetD) {
  //     const key =
  //       recordD.getTelemetryKey();

  //     if (
  //       !recordSetEMap.has(key)
  //     ) {
  //       recordSetEMap.set(
  //         key,
  //         recordD,
  //       );
  //     }
  //   }

  //   return [
  //     ...recordSetEMap.values(),
  //   ];
  // }

  private correctOlddd = 5;
  // async prepareRecordSetF(
  //   recordSetB: any[],
  //   recordSetD: any[]
  // ) {
  //   const recordSetFMap = new Map<string, any>();

  //   for (const recordB of recordSetB) {
  //     const key = this.getTelemetryKey(recordB);

  //     const recordD = recordSetD.find(
  //       (item) => this.getTelemetryKey(item) === key,
  //     );

  //     if (!recordD) {
  //       recordSetFMap.set(key, recordB);
  //       continue;
  //     }

  //     const recordBValue = Number(recordB.metric?.metricsValue ?? 0);
  //     const recordDValue = Number(recordD.metric?.metricsValue ?? 0);

  //     /**
  //      * If Record Set D value > Record Set B value
  //      * then store Record Set D into Record Set F
  //      * else store Record Set B into Record Set F
  //      */
  //     if (recordDValue > recordBValue) {
  //       recordSetFMap.set(key, recordD);
  //     } else {
  //       recordSetFMap.set(key, recordB);
  //     }
  //   }

  //   /**
  //    * Extra safety:
  //    * If any Record D is not found in B,
  //    * still keep D in Record Set F.
  //    */
  //   for (const recordD of recordSetD) {
  //     const key = this.getTelemetryKey(recordD);

  //     if (!recordSetFMap.has(key)) {
  //       recordSetFMap.set(key, recordD);
  //     }
  //   }

  //   return Array.from(recordSetFMap.values());
  // }



  private key = 4;
  // private getTelemetryKey(record: any) {
  //   const key =
  //     record.assetId +
  //     KEY_SEPARATOR +
  //     record.virtualDeviceId +
  //     KEY_SEPARATOR +
  //     record.metric?.metricsAttributeId +
  //     KEY_SEPARATOR +
  //     record.metric.frequency +
  //     KEY_SEPARATOR +
  //     record.metric?.txnCapturePeriod

  //   return key;
  // }


  private idk = 4;
  // async findPeriodTelemetryPayloads(
  //   inputDate: string,
  //   metricsFrequency: string,
  //   isCalculationForced: boolean,
  // ) {
  //   const whereCondition: any = {
  //     frequency: metricsFrequency,
  //     createdOn: inputDate,
  //   };

  //   if (!isCalculationForced) {
  //     whereCondition.txnCapturePeriod = LessThan(inputDate);
  //   }

  //   const records = await this.repo.find({
  //     where: whereCondition,
  //     select: {
  //       assetId: true,
  //       virtualDeviceId: true,
  //       metric: {
  //         metricsAttributeId: true,
  //         txnCapturePeriod: true,
  //         txnCaptureTime: true
  //       },
  //     },
  //     relations: {
  //       metric: true,
  //     },
  //   });

  //   return this.groupByKeys(records);
  // }

  // private groupByKeys(records: PeriodTelemetryPayloadAudit[]) {
  //   const groupedMap = new Map<string, PeriodTelemetryPayloadAudit[]>();

  //   for (const record of records) {
  //     // const key = [
  //     //   record.assetId,
  //     //   record.virtualDeviceId,
  //     //   record.metric.metricsAttributeId,
  //     //   record.metric.txnCapturePeriod,
  //     // ].join('_');

  //     const key = record.assetId +
  //       KEY_SEPARATOR +
  //       record.virtualDeviceId +
  //       KEY_SEPARATOR +
  //       KEY_SEPARATOR +
  //       record.metric.metricsAttributeId +
  //       KEY_SEPARATOR +
  //       record.metric.txnCapturePeriod

  //     if (!groupedMap.has(key)) {
  //       groupedMap.set(key, []);
  //     }

  //     groupedMap.get(key)!.push(record);
  //   }

  //   return groupedMap;
  // }
}

