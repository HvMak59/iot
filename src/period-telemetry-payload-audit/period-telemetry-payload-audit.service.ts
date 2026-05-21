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
  // async processMaxTelemetryAggregation(
  //   inputTime: string,
  //   metricsFrequency: MetricsFrequency,
  //   isCalculationForced: boolean
  // ) {
  //   // Record Set A
  //   const recordSetA =
  //     await this.findPeriodTelemetryRecordSetA(
  //       inputTime,
  //       metricsFrequency,
  //       isCalculationForced,
  //     );

  //   // Record Set B
  //   const recordSetB =
  //     await this.telemetryPayloadService.findTelemetryPayloadRecordSetB(
  //       recordSetA,
  //     );

  //   const corrected = 4;
  //   // Record Set C 
  //   // const recordSetC =
  //   //   // await this.findRecordSetC(recordSetB);
  //   //   await this.virtualDeviceService.findRecordSetC(recordSetA);

  //   // // Record Set D
  //   // const recordSetD =
  //   //   await this.findMaxTelemetryValueRecordSetD(
  //   //     recordSetC,
  //   //   );

  //   // const recordSetE =
  //   //   await this.prepareRecordSetE(
  //   //     recordSetB,
  //   //     recordSetD,
  //   //   );

  //   const recordSetC =
  //     await this.virtualDeviceService.findRecordSetC(recordSetA);

  //   const recordSetD =
  //     await this.findMaxTelemetryValueRecordSetD(recordSetA);

  //   const recordSetE =
  //     await this.prepareRecordSetE(recordSetB, recordSetD);

  //   // const recordSetF =
  //   //   await this.prepareRecordSetF(
  //   //     recordSetE,
  //   //     recordSetC,
  //   //   );

  //   return {
  //     recordSetA,
  //     recordSetB,
  //     recordSetD,
  //     recordSetE
  //   };
  // }

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


  async findPeriodTelemetryPayloads(
    inputTimeInEpoch: string,
    metricsFrequency: MetricsFrequency,
    isCalculationForced: boolean,
  ) {
    const inputDate = convertInputToDate(inputTimeInEpoch);

    const whereCondition: FindPeriodTelemetryPayloadAuditDto = {
      metric: {
        frequency: metricsFrequency,
      },
      auditDateTime: {
        createdAt: MoreThanOrEqual(inputDate),
      },
    };

    if (isCalculationForced == false) {
      this.logger.debug('IsCalculationForced = false');
      whereCondition.metric = {
        frequency: metricsFrequency,
        txnCapturePeriod: LessThan(
          inputDate
        ),
      };
    }

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

    const groupedRecords = _.groupBy(records, (record) => record.getTelemetryKey());

    return groupedRecords;
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






// "recordSetG": [
//     {
//       "assetId": "Super Specialist Technocrats LLP",
//       "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inverters",
//       "aggregation": "sum",
//       "aggStrategy": "last",
//       "metric": {
//         "metricsAttributeId": "Daily_Energy",
//         "measure": "16400.93",
//         "unit": "kWh",
//         "frequency": 1,
//         "txnCaptureTime": "2026-05-15T17:04:44.000Z",
//         "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//         "isCalculated": false,
//         "txnCaptureTimeInEpoch": 1778864684000,
//         "txnCapturePeriodInEpoch": 1778783400000
//       },
//       "childTelemetryRecords": [
//         {
//           "assetId": "Super Specialist Technocrats LLP",
//           "parentVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inverters",
//           "childVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inv1",
//           "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv1",
//           "groupId": "Inverters",
//           "aggregation": "sum",
//           "aggStrategy": "last",
//           "metric": {
//             "metricsAttributeId": "Daily_Energy",
//             "measure": "1740.64",
//             "unit": "kWh",
//             "frequency": 1,
//             "txnCaptureTime": "2026-05-15T17:04:44.000Z",
//             "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//             "isCalculated": false,
//             "txnCaptureTimeInEpoch": 1778864684000,
//             "txnCapturePeriodInEpoch": 1778783400000
//           },
//           "telemetryPayloadId": "351c6eee-3a69-4c04-b5d0-3ddbecaecabe",
//           "telemetryRecord": {
//             "id": "351c6eee-3a69-4c04-b5d0-3ddbecaecabe",
//             "telemetryHeaderId": "91a29a6c-0c89-4e9e-90f6-a32516a799ea",
//             "assetId": "Super Specialist Technocrats LLP",
//             "slaveId": "2",
//             "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv1",
//             "metric": {
//               "metricsAttributeId": "Daily_Energy",
//               "measure": "1740.64",
//               "unit": "kWh",
//               "frequency": 1,
//               "txnCaptureTime": "2026-05-15T17:04:44.000Z",
//               "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//               "isCalculated": false,
//               "txnCaptureTimeInEpoch": 1778864684000,
//               "txnCapturePeriodInEpoch": 1778783400000
//             },
//             "auditDateTime": {
//               "createdAt": 1778783811377,
//               "updatedAt": 1778864812754,
//               "deletedAt": null
//             }
//           }
//         },
//         {
//           "assetId": "Super Specialist Technocrats LLP",
//           "parentVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inverters",
//           "childVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inv2",
//           "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv2",
//           "groupId": "Inverters",
//           "aggregation": "sum",
//           "aggStrategy": "last",
//           "metric": {
//             "metricsAttributeId": "Daily_Energy",
//             "measure": "1737.32",
//             "unit": "kWh",
//             "frequency": 1,
//             "txnCaptureTime": "2026-05-15T17:04:44.000Z",
//             "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//             "isCalculated": false,
//             "txnCaptureTimeInEpoch": 1778864684000,
//             "txnCapturePeriodInEpoch": 1778783400000
//           },
//           "telemetryPayloadId": "b55f1c21-9342-4ef8-ae01-1341971f0c02",
//           "telemetryRecord": {
//             "id": "b55f1c21-9342-4ef8-ae01-1341971f0c02",
//             "telemetryHeaderId": "8fec10d9-ffbd-49b6-a02e-41840058450b",
//             "assetId": "Super Specialist Technocrats LLP",
//             "slaveId": "4",
//             "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv2",
//             "metric": {
//               "metricsAttributeId": "Daily_Energy",
//               "measure": "1737.32",
//               "unit": "kWh",
//               "frequency": 1,
//               "txnCaptureTime": "2026-05-15T17:04:44.000Z",
//               "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//               "isCalculated": false,
//               "txnCaptureTimeInEpoch": 1778864684000,
//               "txnCapturePeriodInEpoch": 1778783400000
//             },
//             "auditDateTime": {
//               "createdAt": 1778783917008,
//               "updatedAt": 1778864918114,
//               "deletedAt": null
//             }
//           }
//         },
//         {
//           "assetId": "Super Specialist Technocrats LLP",
//           "parentVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inverters",
//           "childVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inv3",
//           "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv3",
//           "groupId": "Inverters",
//           "aggregation": "sum",
//           "aggStrategy": "last",
//           "metric": {
//             "metricsAttributeId": "Daily_Energy",
//             "measure": "1612.06",
//             "unit": "kWh",
//             "frequency": 1,
//             "txnCaptureTime": "2026-05-15T17:09:44.000Z",
//             "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//             "isCalculated": false,
//             "txnCaptureTimeInEpoch": 1778864984000,
//             "txnCapturePeriodInEpoch": 1778783400000
//           },
//           "telemetryPayloadId": "f5fb3860-6b29-4a01-8d10-fc422f572a9b",
//           "telemetryRecord": {
//             "id": "f5fb3860-6b29-4a01-8d10-fc422f572a9b",
//             "telemetryHeaderId": "45f64f6a-dab7-4bb5-9d96-d263d587dac2",
//             "assetId": "Super Specialist Technocrats LLP",
//             "slaveId": "1",
//             "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv3",
//             "metric": {
//               "metricsAttributeId": "Daily_Energy",
//               "measure": "1612.06",
//               "unit": "kWh",
//               "frequency": 1,
//               "txnCaptureTime": "2026-05-15T17:09:44.000Z",
//               "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//               "isCalculated": false,
//               "txnCaptureTimeInEpoch": 1778864984000,
//               "txnCapturePeriodInEpoch": 1778783400000
//             },
//             "auditDateTime": {
//               "createdAt": 1778783758604,
//               "updatedAt": 1778865059808,
//               "deletedAt": null
//             }
//           }
//         },
//         {
//           "assetId": "Super Specialist Technocrats LLP",
//           "parentVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inverters",
//           "childVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inv4",
//           "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv4",
//           "groupId": "Inverters",
//           "aggregation": "sum",
//           "aggStrategy": "last",
//           "metric": {
//             "metricsAttributeId": "Daily_Energy",
//             "measure": "1720.37",
//             "unit": "kWh",
//             "frequency": 1,
//             "txnCaptureTime": "2026-05-15T17:05:09.000Z",
//             "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//             "isCalculated": false,
//             "txnCaptureTimeInEpoch": 1778864709000,
//             "txnCapturePeriodInEpoch": 1778783400000
//           },
//           "telemetryPayloadId": "78251afc-c770-4ae8-b603-05eb091a8c9d",
//           "telemetryRecord": {
//             "id": "78251afc-c770-4ae8-b603-05eb091a8c9d",
//             "telemetryHeaderId": "5d0065a6-a4e6-431c-83aa-5a5654118bfa",
//             "assetId": "Super Specialist Technocrats LLP",
//             "slaveId": "3",
//             "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv4",
//             "metric": {
//               "metricsAttributeId": "Daily_Energy",
//               "measure": "1720.37",
//               "unit": "kWh",
//               "frequency": 1,
//               "txnCaptureTime": "2026-05-15T17:05:09.000Z",
//               "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//               "isCalculated": false,
//               "txnCaptureTimeInEpoch": 1778864709000,
//               "txnCapturePeriodInEpoch": 1778783400000
//             },
//             "auditDateTime": {
//               "createdAt": 1778783560157,
//               "updatedAt": 1778864859857,
//               "deletedAt": null
//             }
//           }
//         },
//         {
//           "assetId": "Super Specialist Technocrats LLP",
//           "parentVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inverters",
//           "childVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inv5",
//           "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv5",
//           "groupId": "Inverters",
//           "aggregation": "sum",
//           "aggStrategy": "last",
//           "metric": {
//             "metricsAttributeId": "Daily_Energy",
//             "measure": "1663.94",
//             "unit": "kWh",
//             "frequency": 1,
//             "txnCaptureTime": "2026-05-15T17:05:09.000Z",
//             "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//             "isCalculated": false,
//             "txnCaptureTimeInEpoch": 1778864709000,
//             "txnCapturePeriodInEpoch": 1778783400000
//           },
//           "telemetryPayloadId": "8b9a5f0c-60fe-4d70-81e5-fa07368747b6",
//           "telemetryRecord": {
//             "id": "8b9a5f0c-60fe-4d70-81e5-fa07368747b6",
//             "telemetryHeaderId": "ea106176-ad34-4be0-9814-e6142993d535",
//             "assetId": "Super Specialist Technocrats LLP",
//             "slaveId": "5",
//             "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv5",
//             "metric": {
//               "metricsAttributeId": "Daily_Energy",
//               "measure": "1663.94",
//               "unit": "kWh",
//               "frequency": 1,
//               "txnCaptureTime": "2026-05-15T17:05:09.000Z",
//               "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//               "isCalculated": false,
//               "txnCaptureTimeInEpoch": 1778864709000,
//               "txnCapturePeriodInEpoch": 1778783400000
//             },
//             "auditDateTime": {
//               "createdAt": 1778783665496,
//               "updatedAt": 1778864965313,
//               "deletedAt": null
//             }
//           }
//         },
//         {
//           "assetId": "Super Specialist Technocrats LLP",
//           "parentVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inverters",
//           "childVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inv6",
//           "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv6",
//           "groupId": "Inverters",
//           "aggregation": "sum",
//           "aggStrategy": "last",
//           "metric": {
//             "metricsAttributeId": "Daily_Energy",
//             "measure": "1012.14",
//             "unit": "kWh",
//             "frequency": 1,
//             "txnCaptureTime": "2026-05-15T17:05:09.000Z",
//             "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//             "isCalculated": false,
//             "txnCaptureTimeInEpoch": 1778864709000,
//             "txnCapturePeriodInEpoch": 1778783400000
//           },
//           "telemetryPayloadId": "7feefe00-65e1-4af9-9d8f-7fb19dc382ca",
//           "telemetryRecord": {
//             "id": "7feefe00-65e1-4af9-9d8f-7fb19dc382ca",
//             "telemetryHeaderId": "7cc5d528-678e-401c-b083-88e993397e73",
//             "assetId": "Super Specialist Technocrats LLP",
//             "slaveId": "4",
//             "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv6",
//             "metric": {
//               "metricsAttributeId": "Daily_Energy",
//               "measure": "1012.14",
//               "unit": "kWh",
//               "frequency": 1,
//               "txnCaptureTime": "2026-05-15T17:05:09.000Z",
//               "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//               "isCalculated": false,
//               "txnCaptureTimeInEpoch": 1778864709000,
//               "txnCapturePeriodInEpoch": 1778783400000
//             },
//             "auditDateTime": {
//               "createdAt": 1778783612808,
//               "updatedAt": 1778864912517,
//               "deletedAt": null
//             }
//           }
//         },
//         {
//           "assetId": "Super Specialist Technocrats LLP",
//           "parentVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inverters",
//           "childVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inv7",
//           "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv7",
//           "groupId": "Inverters",
//           "aggregation": "sum",
//           "aggStrategy": "last",
//           "metric": {
//             "metricsAttributeId": "Daily_Energy",
//             "measure": "1722.96",
//             "unit": "kWh",
//             "frequency": 1,
//             "txnCaptureTime": "2026-05-15T17:00:12.000Z",
//             "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//             "isCalculated": false,
//             "txnCaptureTimeInEpoch": 1778864412000,
//             "txnCapturePeriodInEpoch": 1778783400000
//           },
//           "telemetryPayloadId": "2af54c2a-9390-4067-9171-dc0495758d0d",
//           "telemetryRecord": {
//             "id": "2af54c2a-9390-4067-9171-dc0495758d0d",
//             "telemetryHeaderId": "59e7148e-0d3b-4c10-89c5-5c304d3f19ec",
//             "assetId": "Super Specialist Technocrats LLP",
//             "slaveId": "1",
//             "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv7",
//             "metric": {
//               "metricsAttributeId": "Daily_Energy",
//               "measure": "1722.96",
//               "unit": "kWh",
//               "frequency": 1,
//               "txnCaptureTime": "2026-05-15T17:00:12.000Z",
//               "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//               "isCalculated": false,
//               "txnCaptureTimeInEpoch": 1778864412000,
//               "txnCapturePeriodInEpoch": 1778783400000
//             },
//             "auditDateTime": {
//               "createdAt": 1778783454663,
//               "updatedAt": 1778864457110,
//               "deletedAt": null
//             }
//           }
//         },
//         {
//           "assetId": "Super Specialist Technocrats LLP",
//           "parentVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inverters",
//           "childVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inv8",
//           "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv8",
//           "groupId": "Inverters",
//           "aggregation": "sum",
//           "aggStrategy": "last",
//           "metric": {
//             "metricsAttributeId": "Daily_Energy",
//             "measure": "1727.33",
//             "unit": "kWh",
//             "frequency": 1,
//             "txnCaptureTime": "2026-05-15T17:05:09.000Z",
//             "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//             "isCalculated": false,
//             "txnCaptureTimeInEpoch": 1778864709000,
//             "txnCapturePeriodInEpoch": 1778783400000
//           },
//           "telemetryPayloadId": "e9feccaa-436e-4f36-a8ab-3983bf9e3e02",
//           "telemetryRecord": {
//             "id": "e9feccaa-436e-4f36-a8ab-3983bf9e3e02",
//             "telemetryHeaderId": "afd26bd6-2757-4802-a562-b41991f17d5d",
//             "assetId": "Super Specialist Technocrats LLP",
//             "slaveId": "2",
//             "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv8",
//             "metric": {
//               "metricsAttributeId": "Daily_Energy",
//               "measure": "1727.33",
//               "unit": "kWh",
//               "frequency": 1,
//               "txnCaptureTime": "2026-05-15T17:05:09.000Z",
//               "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//               "isCalculated": false,
//               "txnCaptureTimeInEpoch": 1778864709000,
//               "txnCapturePeriodInEpoch": 1778783400000
//             },
//             "auditDateTime": {
//               "createdAt": 1778783507322,
//               "updatedAt": 1778864807287,
//               "deletedAt": null
//             }
//           }
//         },
//         {
//           "assetId": "Super Specialist Technocrats LLP",
//           "parentVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inverters",
//           "childVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inv9",
//           "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv9",
//           "groupId": "Inverters",
//           "aggregation": "sum",
//           "aggStrategy": "last",
//           "metric": {
//             "metricsAttributeId": "Daily_Energy",
//             "measure": "1732.91",
//             "unit": "kWh",
//             "frequency": 1,
//             "txnCaptureTime": "2026-05-15T17:04:44.000Z",
//             "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//             "isCalculated": false,
//             "txnCaptureTimeInEpoch": 1778864684000,
//             "txnCapturePeriodInEpoch": 1778783400000
//           },
//           "telemetryPayloadId": "67e15b98-5b51-4262-a306-6aa3b11261b5",
//           "telemetryRecord": {
//             "id": "67e15b98-5b51-4262-a306-6aa3b11261b5",
//             "telemetryHeaderId": "4f50314e-d299-4d27-81b2-e60dc6c70099",
//             "assetId": "Super Specialist Technocrats LLP",
//             "slaveId": "3",
//             "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv9",
//             "metric": {
//               "metricsAttributeId": "Daily_Energy",
//               "measure": "1732.91",
//               "unit": "kWh",
//               "frequency": 1,
//               "txnCaptureTime": "2026-05-15T17:04:44.000Z",
//               "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//               "isCalculated": false,
//               "txnCaptureTimeInEpoch": 1778864684000,
//               "txnCapturePeriodInEpoch": 1778783400000
//             },
//             "auditDateTime": {
//               "createdAt": 1778783864233,
//               "updatedAt": 1778864865447,
//               "deletedAt": null
//             }
//           }
//         },
//         {
//           "assetId": "Super Specialist Technocrats LLP",
//           "parentVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inverters",
//           "childVirtualDeviceId": "Super Specialist Technocrats LLP:SST Inv10",
//           "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv10",
//           "groupId": "Inverters",
//           "aggregation": "sum",
//           "aggStrategy": "last",
//           "metric": {
//             "metricsAttributeId": "Daily_Energy",
//             "measure": "1731.26",
//             "unit": "kWh",
//             "frequency": 1,
//             "txnCaptureTime": "2026-05-15T17:04:44.000Z",
//             "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//             "isCalculated": false,
//             "txnCaptureTimeInEpoch": 1778864684000,
//             "txnCapturePeriodInEpoch": 1778783400000
//           },
//           "telemetryPayloadId": "6f0fcf77-58db-4d9b-90d0-29f56de00e70",
//           "telemetryRecord": {
//             "id": "6f0fcf77-58db-4d9b-90d0-29f56de00e70",
//             "telemetryHeaderId": "47b8eb63-260b-4e4f-bf4c-c44ae094baa6",
//             "assetId": "Super Specialist Technocrats LLP",
//             "slaveId": "5",
//             "virtualDeviceId": "Super Specialist Technocrats LLP:SST Inv10",
//             "metric": {
//               "metricsAttributeId": "Daily_Energy",
//               "measure": "1731.26",
//               "unit": "kWh",
//               "frequency": 1,
//               "txnCaptureTime": "2026-05-15T17:04:44.000Z",
//               "txnCapturePeriod": "2026-05-14T18:30:00.000Z",
//               "isCalculated": false,
//               "txnCaptureTimeInEpoch": 1778864684000,
//               "txnCapturePeriodInEpoch": 1778783400000
//             },
//             "auditDateTime": {
//               "createdAt": 1778783969772,
//               "updatedAt": 1778864970700,
//               "deletedAt": null
//             }
//           }
//         }
//       ]
//     }
//   ]
