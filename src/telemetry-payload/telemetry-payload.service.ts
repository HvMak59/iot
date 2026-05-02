import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Repository,
} from 'typeorm';


import serviceConfig from '../app_config/service.config.json';

import { TelemetryPayload } from './entities/telemetry-payload.entity';
import { CreateTelemetryPayloadDto } from './dto/create-telemetry-payload.dto';
import { UpdateTelemetryPayloadDto } from './dto/update-telemetry-payload.dto';

import { FindTelemetryPayload } from './dto/find-telemetry-payload-before-given-time.dto';
import { FindTelemetryPayloadForAPeriod } from './dto/find-telemetry-payload-for-a-period.dto';

import { Metric } from 'src/metrics/entities/metric.entity';

import { CurrentTelemetryPayloadService } from 'src/current-telemetry-payload/current-telemetry-payload.service';
import { FindCurrentTelemetryDto } from 'src/current-telemetry-payload/dto/find-current-telemetry.dto';
import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
// import { EventEmitter2 } from '@nestjs/event-emitter';
import { FindTelemetryPayloadDto } from './dto/find-telemetry-payload.dto';
import { start } from 'repl';
import { TelemetryPayloadsRepo } from './entities/telemetry-payload_repo.entity';
import { FindMetricDto } from 'src/metrics/dto/find-metric.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { convertpossibleStringTypeToInt, getTryCatchErrorStr, hasPeriodTelemetryIncreased } from 'src/utils/others';
import _ from 'lodash';
import { KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import { on } from 'events';

@Injectable()
export class TelemetryPayloadService {
  private readonly logger = winstonServerLogger(TelemetryPayloadService.name);
  // private readonly serviceName = serviceConfig.telemetryPayload.serviceName;
  // private readonly eagerRelations =
  //   serviceConfig.telemetryPayload.eagerRelations;
  // private readonly relations = serviceConfig.telemetryPayload.relations;
  // private allRelations = _.union(this.eagerRelations, this.relations);

  //private static nightMap = new Map<string, number>();
  constructor(
    @InjectRepository(TelemetryPayload)
    private readonly repo: Repository<TelemetryPayload>,
    private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
    // private readonly assetService: AssetService,
    // private readonly eventEmitter: EventEmitter2,
  ) { }

  /* async create(createTelemetryPayloadDto: CreateTelemetryPayloadDto[]) {
    const msgTemplate = "Insert " + this.serviceName;
    try {
   for (const record of createTelemetryPayloadDto) {
        this.logger.debug(`Inserting : ${Object.values(record)}`);
      }
        const result = await this.repo.save(createTelemetryPayloadDto);
        this.logger.info(`${msgTemplate} : ${JSON.stringify([...result])} created`);
        return result;
      }
      catch (error) {
      this.logger.error(`${msgTemplate} : ${[...createTelemetryPayloadDto]} : ${error}`);
      throw new Error(error as string);
    }
  } */


  async create(createTelemetryPayloadsDto: CreateTelemetryPayloadDto[]) {
    const fnName = this.create.name;
    const input = `Input No of records : ${createTelemetryPayloadsDto.length}`;
    const msgTemplate = `${fnName} : ${input}`;
    //const createTodayTelemetryPayloads: CreateTodayTelemetryPayloadDto[] = [];
    try {
      this.logger.debug(`${msgTemplate} : Start`);
      const toBeUpserted: CreateTelemetryPayloadDto[] = [];
      const check113000time = new Date(1970, 0, 1, 17, 0, 0, 0);
      const searchCriterias: FindCurrentTelemetryDto[] = [];
      for (const createTelemetryPayload of createTelemetryPayloadsDto) {
        const searchCriteria: FindCurrentTelemetryDto = {
          assetId: createTelemetryPayload.assetId,
          virtualDeviceId: createTelemetryPayload.virtualDeviceId ?? IsNull(),
          metric: {
            metricsAttributeId:
              createTelemetryPayload.metric?.metricsAttributeId,
          },
        };
        searchCriterias.push(searchCriteria);
      }
      const latestAvailableTelemetryPayloads: CurrentTelemetryPayload[] =
        await this.currentTelemetryPayloadService.findAll(searchCriterias);
      this.logger.debug(
        `latestAvailableTelemetryPayloads size is : ${latestAvailableTelemetryPayloads.length}`,
      );
      const groupedCTPLs = _.groupBy(
        latestAvailableTelemetryPayloads,
        (ctpl) => {
          const ctplObj = new CurrentTelemetryPayload(ctpl);
          return ctplObj.getKey();
        },
      );
      for (const createTelemetryPayload of createTelemetryPayloadsDto) {
        //const tplObj = new TelemetryPayload(createTelemetryPayload);
        //const payloadKey = ctplObj.getAttributeKey();
        createTelemetryPayload.metric = new Metric(
          createTelemetryPayload.metric!,
        );
        const metric = createTelemetryPayload.metric;
        this.logger.debug(
          `Processing attribute : ${metric.metricsAttributeId}`,
        );

        if (metric.isPeriodic()) {
          this.logger.debug(`Frequency is periodic : ${metric.frequency}`);
          const metricDate = new Date(metric.txnCaptureTime);
          const incomingRefMetricTime = new Date(
            1970,
            0,
            1,
            metricDate.getHours(),
            metricDate.getMinutes(),
            metricDate.getSeconds(),
            metricDate.getMilliseconds(),
          );
          if (
            isIncomingTimeAfterThreshold(
              incomingRefMetricTime,
              check113000time,
            )
          ) {
            this.logger.debug(
              `${msgTemplate} : metric ref time ${incomingRefMetricTime} is after ${check113000time}`,
            );
            this.logger.debug(
              `createTelemetryPayload.metric.metricsAttributeId : ${createTelemetryPayload.metric.metricsAttributeId}`,
            );
            if (latestAvailableTelemetryPayloads.length > 0) {
              const createTelemetryPayloadObj = new TelemetryPayload(
                createTelemetryPayload,
              );
              const foundCTPLs =
                groupedCTPLs[createTelemetryPayloadObj.getAttributeKey()];
              if (_.isEmpty(foundCTPLs)) {
                this.logger.debug(
                  `Latest metric is not available for : ${createTelemetryPayloadObj.getAttributeKey()}`,
                );
                toBeUpserted.push(createTelemetryPayloadObj);

              } else {
                if (
                  hasPeriodTelemetryIncreased(
                    foundCTPLs[0].metric,
                    createTelemetryPayload.metric!,
                  )
                ) {
                  this.logger.debug(
                    `Arrived telemetry ${parseFloat(
                      createTelemetryPayloadObj.metric.measure,
                    )} has increased over latest available telemetry ${parseFloat(
                      foundCTPLs[0].metric.measure,
                    )}`,
                  );
                  toBeUpserted.push(createTelemetryPayloadObj);
                } else {
                  this.logger.debug(
                    `Arrived telemetry ${parseFloat(
                      createTelemetryPayloadObj.metric.measure,
                    )} has decreased over latest available telemetry ${parseFloat(
                      foundCTPLs[0].metric.measure,
                    )}`,
                  );
                }
              }
            } else {
              toBeUpserted.push(createTelemetryPayload);
            }
          } else {
            this.logger.debug(
              `${msgTemplate} : metric ref time ${incomingRefMetricTime} is before ${check113000time}`,
            );
            toBeUpserted.push(createTelemetryPayload);
          }
        } else {
          toBeUpserted.push(createTelemetryPayload);
        }

      }
      for (const record of toBeUpserted) {
        this.logger.debug(
          `Inserting : ${record.virtualDeviceId} : ${record.metric?.metricsAttributeId} : ${record.metric?.txnCapturePeriod}`,
        );
      }
      // const result = await this.repo.upsert(toBeUpserted, {
      //   conflictPaths: [
      //     'assetId',
      //     'virtualDeviceId',
      //     'metric.metricsAttributeId',
      //     'metric.txnCapturePeriod',
      //   ],
      //   skipUpdateIfNoValuesChanged: false,
      // });
      const result = await this.repo.save(toBeUpserted);
      // this.logger.debug(
      //   `${msgTemplate} : ${result.identifiers.length} upserted`,
      // );
      return result;
    } catch (error) {
      this.logger.error(`${msgTemplate} : ${error}`);
      throw new Error(error as string);
    } finally {
      this.logger.debug(`${msgTemplate} : End`);
    }

    function isIncomingTimeAfterThreshold(
      incomingRefMetricTime: Date,
      check113000time: Date,
    ) {
      return incomingRefMetricTime.valueOf() > check113000time.valueOf();
    }
  }


  async update(
    id: string,
    updateTelemetryPayloadDto: UpdateTelemetryPayloadDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id}, Update object : ${JSON.stringify(
      updateTelemetryPayloadDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (updateTelemetryPayloadDto.id == null) {
      this.logger.debug(
        `${fnName} : TelemetryPayload id not found in updateTelemetryPayloadDto`,
      );
      updateTelemetryPayloadDto.id = id;
    } else if (updateTelemetryPayloadDto.id != id) {
      this.logger.error(
        `${fnName} : TelemetryPayload id : ${id} and Update TelemetryPayload object id : ${updateTelemetryPayloadDto.id} do not match`,
      );
      throw new Error(
        `TelemetryPayload id : ${id} and Update TelemetryPayload object id : ${updateTelemetryPayloadDto.id} do not match`,
      );
    }

    const mergedTelemetryPayload = await this.repo.preload(
      updateTelemetryPayloadDto,
    );
    if (mergedTelemetryPayload == null) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : TelemetryPayload id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : TelemetryPayload id : ${id} not found`);
    } else {
      return await this.repo.save(mergedTelemetryPayload);
    }
  }


  findForATimePeriod(searchCriteria: FindTelemetryPayloadForAPeriod) {
    const msgTemplate = 'Find ' + 's';

    const startTime =
      typeof searchCriteria.startTime == 'string'
        ? Number(searchCriteria.startTime).valueOf()
        : searchCriteria.startTime;
    const endTime =
      typeof searchCriteria.endTime == 'string'
        ? Number(searchCriteria.endTime).valueOf()
        : searchCriteria.endTime;

    this.logger.debug(
      `${msgTemplate} : search criteria : ${JSON.stringify(searchCriteria)}`,
    );
    this.logger.debug(
      `${msgTemplate} : search criteria : ${startTime}, ${endTime}`,
    );
    this.logger.debug(
      `${msgTemplate} : search criteria Metric attribute: 
        ${searchCriteria.metricsAttributeId}`,
    );

    return this.repo.find({
      where: {
        assetId: searchCriteria.assetId,
        virtualDeviceId: searchCriteria.virtualDeviceId,
        metric: {
          metricsAttributeId: searchCriteria.metricsAttributeId,
          txnCapturePeriod: Between<Date>(
            new Date(startTime),
            new Date(endTime),
          ),
        },
      },
      // relations: this.eagerRelations,
      order: {
        metric: {
          txnCaptureTime: 'ASC',
        },
      },
    });
  }

  //   findForMultipleDevicesForATimePeriod(
  //     searchCriteria: FindDevicesPerformanceTelemetryDto,
  //   ) {
  //     const event = `Input : ${JSON.stringify(searchCriteria)}`;
  //     const msgTemplate = 'Find ' + this.serviceName + ` ${event}`;

  //     this.logger.debug(`${msgTemplate} : Start`);
  //     const startTime =
  //       typeof searchCriteria.startTime == 'string'
  //         ? Number(searchCriteria.startTime).valueOf()
  //         : searchCriteria.startTime;
  //     const endTime =
  //       typeof searchCriteria.endTime == 'string'
  //         ? Number(searchCriteria.endTime).valueOf()
  //         : searchCriteria.endTime;
  //     this.logger.debug(`Printing start time : ${startTime}`);

  //     const telemetryPayloadSearchObject: FindOptionsWhere<TelemetryPayload> = {
  //       virtualDeviceId: In(searchCriteria.csvVirtualDeviceIDs.split(',')),
  //       metric: {
  //         metricsAttributeId: searchCriteria.metricsAttributeId,
  //         txnCapturePeriod: Between<Date>(new Date(startTime), new Date(endTime)),
  //       },
  //     };

  //     searchCriteria.csvAssetIDs && searchCriteria.csvAssetIDs.length > 0
  //       ? (telemetryPayloadSearchObject.assetId = In(
  //           searchCriteria.csvAssetIDs.split(','),
  //         ))
  //       : null;

  //     return this.repo.find({
  //       where: telemetryPayloadSearchObject,
  //       relations: this.eagerRelations,
  //       order: {
  //         //assetId: 'ASC',
  //         //virtualDeviceId: 'ASC',
  //         metric: {
  //           txnCaptureTime: 'ASC',
  //         },
  //       },
  //     });
  //   }

  //   findAllWthRelations() {
  //     const msgTemplate = 'Find ' + this.serviceName + 's' + ' with relations';
  //     return findAll<TelemetryPayload>(this.repo, msgTemplate, this.allRelations);
  //   }

  //   async findOneById(id: string) {
  //     const msgTemplate = 'Find ' + this.serviceName;
  //     //return findOne<DeviceInstanceTelemetry>(this.repo, id, msgTemplate, "asset-type");
  //     try {
  //       return await this.repo.findOne({
  //         where: { id: id },
  //         relations: this.eagerRelations,
  //       });
  //     } catch (error) {
  //       this.logger.error(`${msgTemplate} : ${id} : ${error}`);
  //       throw new Error(error as string);
  //     }
  //   }

  //   async findOneByIdWthRelations(id: string) {
  //     const msgTemplate = 'Find ' + this.serviceName + ' with relations';
  //     //return findOne<DeviceInstanceTelemetry>(this.repo, id, msgTemplate, "asset-type", "asset");
  //     try {
  //       return await this.repo.findOne({
  //         where: {
  //           id: id,
  //         },
  //         relations: this.allRelations,
  //       });
  //     } catch (error) {
  //       this.logger.error(`${msgTemplate} : ${id} : ${error}`);
  //       throw new Error(error as string);
  //     }
  //   }

  //   async findByAssetId(assetId: string) {
  //     const msgTemplate = 'Find ' + this.serviceName + ' by asset id';
  //     try {
  //       /* return await this.repo.findBy({
  //         assetId: assetId,
  //       }); */
  //       return await this.repo.find({
  //         where: {
  //           virtualDevice: {
  //             assetId: assetId,
  //           },
  //         },
  //         relations: this.eagerRelations,
  //       });
  //     } catch (error) {
  //       this.logger.error(`${msgTemplate} : ${assetId} : ${error}`);
  //       throw new Error(error as string);
  //     }
  //   }

  //   async findByAssetIdVdIdMeasureDate(
  //     //assetId: string,
  //     vdId: string,
  //     metricsAttributeId: string,
  //     tDate: Date,
  //   ) {
  //     //const msgTemplate = "Find " + this.serviceName + " by asset : " + assetId + ;
  //     const msgTemplate = `Find ${this.serviceName} vdId : ${vdId}, measureName : ${metricsAttributeId}, tDate : ${tDate}`;
  //     const startDate = new Date(tDate.setHours(0, 0, 0, 0));
  //     this.logger.debug(`Start date : ${startDate}`);
  //     const startDate2 = new Date(startDate.setDate(startDate.getDate()));
  //     this.logger.debug(`Start date : ${startDate2}`);
  //     const endDate = new Date(startDate.setDate(startDate2.getDate() + 1));
  //     this.logger.debug(`End date : ${endDate}`);
  //     this.logger.debug(msgTemplate);
  //     try {
  //       const resp = await this.repo.find({
  //         where: {
  //           virtualDeviceId: vdId,
  //           metric: {
  //             metricsAttributeId: metricsAttributeId,
  //             txnCapturePeriod: Between<Date>(startDate2, endDate),
  //           },
  //         },
  //         relations: this.eagerRelations,
  //         order: {
  //           //assetId: 'ASC',
  //           metric: {
  //             txnCaptureTime: 'ASC',
  //           },
  //         },
  //         //assetId: assetId,
  //       });
  //       //resp.forEach((rec) => this.logger.debug(`record key is : ${rec.getKey()}`));
  //       //this.logger.debug(`Response is : ${JSON.stringify([...resp])}`);
  //       return resp;
  //     } catch (error) {
  //       this.logger.error(`${msgTemplate} : ${error}`);
  //       throw new Error(error as string);
  //     }
  //   }

  //   async findOneBeforeOrEqualGivenTime(searchCriteria: FindTelemetryPayload) {
  //     const msgTemplate = 'Find Before Given time ' + this.serviceName;
  //     const event = `Input : ${JSON.stringify(searchCriteria)}`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : ${event} : Start`);
  //       if (searchCriteria.txnCaptureTimeInEpoch) {
  //         this.logger.debug(
  //           `Before conversion : ${searchCriteria.txnCaptureTimeInEpoch}`,
  //         );
  //         /* const isNumber = typeof searchCriteria.txnCaptureTimeInEpoch;
  //         this.logger.debug(isNumber); */
  //         const toTxnCaptureTime: Date =
  //           typeof searchCriteria.txnCaptureTimeInEpoch == 'string'
  //             ? new Date(parseInt(searchCriteria.txnCaptureTimeInEpoch))
  //             : new Date(searchCriteria.txnCaptureTimeInEpoch);
  //         this.logger.debug(
  //           `After conversion toTxnCaptureTime: ${toTxnCaptureTime}`,
  //         );
  //         const beforeTxnCaptureTime = new Date(
  //           toTxnCaptureTime.valueOf() - LAST_METRICS_RANGE,
  //         );
  //         this.logger.debug(
  //           `After conversion BeforeTxnCaptureTime: ${toTxnCaptureTime}`,
  //         );
  //         let result: TelemetryPayload | null;
  //         result = await this.repo.findOne({
  //           where: {
  //             assetId: searchCriteria.assetId,
  //             virtualDeviceId: searchCriteria.virtualDeviceId ?? IsNull(),
  //             metric: {
  //               metricsAttributeId: searchCriteria.metricsAttributeId,
  //               txnCapturePeriod: Between<Date>(
  //                 beforeTxnCaptureTime,
  //                 toTxnCaptureTime,
  //               ),
  //             },
  //           },
  //           relations: this.eagerRelations,
  //           order: {
  //             metric: {
  //               txnCapturePeriod: 'DESC',
  //             },
  //           },
  //         });
  //         if (result == null) {
  //           result = await this.repo.findOne({
  //             where: {
  //               //assetId: searchCriteria.assetId,
  //               virtualDeviceId: searchCriteria.virtualDeviceId ?? IsNull(),
  //               metric: {
  //                 metricsAttributeId: searchCriteria.metricsAttributeId,
  //                 txnCapturePeriod: LessThanOrEqual<Date>(toTxnCaptureTime),
  //               },
  //             },
  //             relations: this.eagerRelations,
  //             order: {
  //               metric: {
  //                 txnCapturePeriod: 'DESC',
  //               },
  //             },
  //           });
  //         }
  //         return result;
  //       } else {
  //       }
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${event} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : ${event} : End`);
  //     }
  //   }

  //   async findManyMetricsAttribsForATimePeriod(
  //     searchCriteria: FindTelemetryPayloadDto[],
  //     startTime: number | string,
  //     endTime: number | string,
  //   ): Promise<TelemetryPayload[]> {
  //     const fnName = this.findManyMetricsAttribsForATimePeriod.name;
  //     this.logger.debug(`${fnName} : Input : ${JSON.stringify([...searchCriteria])}, ${startTime}, ${endTime}`);
  //     const startTimeInt = convertpossibleStringTypeToInt(startTime);
  //       const endTimeInt = convertpossibleStringTypeToInt(endTime);
  //       const whereConditions : FindTelemetryPayloadDto[] = searchCriteria.map((payload) => {
  //         this.logger.debug(`${fnName} : Processing payload : ${JSON.stringify(payload)}`);
  //         const findMetricDTO: FindMetricDto = {
  //           metricsAttributeId: payload.metricsAttributeId,
  //           txnCaptureTime: Between(
  //               new Date(startTimeInt),
  //               new Date(endTimeInt),
  //             )
  //         };
  //         this.logger.debug(`${fnName} : findMetricDTO : ${JSON.stringify(findMetricDTO)}`);
  //         return {
  //           assetId: payload.assetId,
  //           virtualDeviceId: payload.virtualDeviceId ?? IsNull(),
  //           metric: findMetricDTO,
  //         };
  //       });

  //       this.logger.debug(
  //         `findManyMetricsAttribsForATimePeriod : whereConditions : ${JSON.stringify(
  //           [...whereConditions],
  //         )}`,
  //       );

  //       return this.repo.find({
  //         select: {
  //           metric: {
  //             measure: true,
  //             metricsAttributeId: true,
  //             frequency: true,
  //             txnCaptureTime: true,
  //             txnCapturePeriod: true,
  //             unit: true,
  //           },
  //           virtualDeviceId: true,
  //         },
  //         where: whereConditions,
  //         /* where: {
  //           ...whereConditions,
  //           metric: {
  //             txnCapturePeriod: Between(
  //               new Date(startTimeInt),
  //               new Date(endTimeInt),
  //             ),
  //           },
  //         }, */
  //         order: {
  //           assetId: 'ASC',
  //           virtualDeviceId: 'ASC',
  //           metric: {
  //             metricsAttributeId: 'ASC',
  //             txnCaptureTime: 'ASC',
  //           },
  //         },
  //       });

  //   }

  //   /* findWithInGivenTimeRange(
  //     searchCriteria: FindTelemetryPayloadsFromMultipleIDs,
  // ) {
  //     const searchCriteriaObj = this.getFindTelemetryPayloadDTOFromMultipleIDs(
  //       searchCriteria,
  //     );
  //     this.logger.debug(
  //       `Find With In Given Time Range In Desc Order : Input : ${JSON.stringify(
  //         searchCriteria,
  //       )}`,
  //     );
  //     return this.repo.find({
  //       where: searchCriteriaObj,
  //       order: { metric: { txnCapturePeriod: 'ASC' } },
  //     });
  // } */

  // async lastRecsOfGivenTimeRange(
  //     searchCriteria: FindTelemetryPayloadDto[],
  //     startTime: number | string,
  //     endTime: number | string,
  //   ): Promise<TelemetryPayload[]> {
  //     const fnName = this.lastRecsOfGivenTimeRange.name;
  //     this.logger.debug(`${fnName} : Input : ${JSON.stringify([...searchCriteria])}, ${startTime}, ${endTime}`);
  //     const telemetryPayloads = await this.findManyMetricsAttribsForATimePeriod(
  //       searchCriteria,
  //       startTime,
  //       endTime,
  //     );

  //     const telemetryPayloadRepo = new TelemetryPayloadsRepo(telemetryPayloads);

  //     const tpByDeviceMap = telemetryPayloadRepo.byAttributeKey();

  //     const outputTelemetryPayloads: TelemetryPayload[] = [];

  //     for ( const [td, telemetryPylods] of Object.entries(tpByDeviceMap)) {
  //       this.logger.debug(`${fnName} : Processing device in the map : ${td}`);
  //       this.logger.debug(`${fnName} : telemetryPylods for device ${JSON.stringify(td)} : No of records ${telemetryPylods.length}`);
  //       if (telemetryPylods.length == 0) {
  //         this.logger.debug(`${fnName} No telemetry payloads for device : ${JSON.stringify(td)}`);
  //       } else {
  //         this.logger.debug(`${fnName} : Adding ${JSON.stringify(td)} : Added record ${JSON.stringify(telemetryPylods[telemetryPylods.length - 1])}`);
  //         outputTelemetryPayloads.push(telemetryPylods[telemetryPylods.length - 1]);
  //       }
  //     }

  //     this.logger.debug(`${fnName} : result : ${JSON.stringify([...outputTelemetryPayloads])}`);

  //     return outputTelemetryPayloads;
  //   }

  //   /* async lastRecsOfGivenTimeRange(
  //     searchCriteria: FindTelemetryPayloadsFromMultipleIDs,
  //   ) {
  //     const fnName = this.lastRecsOfGivenTimeRange.name;
  //     const telemetryPayloads = await this.findWithInGivenTimeRange(
  //       searchCriteria,
  //     );

  //     const telemetryPayloadRepo = new TelemetryPayloadsRepo(telemetryPayloads);

  //     const tpByDeviceMap = telemetryPayloadRepo.byTelemetryDevice();

  //     const outputTelemetryPayloads: TelemetryPayload[] = [];

  //     Object.entries(tpByDeviceMap)

  //     for ( const [td, telemetryPylods] of Object.entries(tpByDeviceMap)) {
  //       if (telemetryPylods.length == 0) {
  //         this.logger.debug(`${fnName} No telemetry payloads for device : ${JSON.stringify(td)}`);
  //       } else {
  //         outputTelemetryPayloads.push(telemetryPylods[telemetryPylods.length - 1]);
  //       }
  //     }

  //     this.logger.debug(`${fnName} : result : ${JSON.stringify([...outputTelemetryPayloads])}`);

  //     return outputTelemetryPayloads;
  //   } */

  //   async update(
  //     id: string,
  //     updateTelemetryPayloadDto: UpdateTelemetryPayloadDto,
  //   ) {
  //     const fnName = this.update.name;
  //     const input = `Input : Id : ${id}, Update object : ${JSON.stringify(
  //       updateTelemetryPayloadDto,
  //     )}`;

  //     this.logger.debug(fnName + KEY_SEPARATOR + input);

  //     if (updateTelemetryPayloadDto.id == null) {
  //       this.logger.debug(
  //         `${fnName} : TelemetryPayload id not found in updateTelemetryPayloadDto`,
  //       );
  //       updateTelemetryPayloadDto.id = id;
  //     } else if (updateTelemetryPayloadDto.id != id) {
  //       this.logger.error(
  //         `${fnName} : TelemetryPayload id : ${id} and Update TelemetryPayload object id : ${updateTelemetryPayloadDto.id} do not match`,
  //       );
  //       throw new Error(
  //         `TelemetryPayload id : ${id} and Update TelemetryPayload object id : ${updateTelemetryPayloadDto.id} do not match`,
  //       );
  //     }

  //     const mergedTelemetryPayload = await this.repo.preload(
  //       updateTelemetryPayloadDto,
  //     );
  //     if (mergedTelemetryPayload == null) {
  //       this.logger.error(
  //         `${fnName} : ${NO_RECORD} : TelemetryPayload id : ${id} not found`,
  //       );
  //       throw new Error(`${NO_RECORD} : TelemetryPayload id : ${id} not found`);
  //     } else {
  //       return await this.repo.save(mergedTelemetryPayload);
  //     }
  //   }

  //   delete(id: string) {
  //     const msgTemplate = 'Delete ' + this.serviceName;
  //     return deleteRec<TelemetryPayload>(this.repo, id, msgTemplate);
  //   }

  //   softDelete(id: string) {
  //     const msgTemplate = 'Soft delete ' + this.serviceName;
  //     return softDelete<TelemetryPayload>(this.repo, id, msgTemplate);
  //   }

  async deleteDeviceGroupForTimePeriod(
    deleteCriteria: FindTelemetryPayloadForAPeriod,
  ) {
    const msgTemplate = `Delete Telemetry for Interval `;
    const event = `Input : ${JSON.stringify(deleteCriteria)}`;

    try {
      this.logger.debug(`${msgTemplate} : ${event} : Start`);
      this.logger.debug(
        `${msgTemplate} : ${event} : Find Telemetry Delete Criteria : ${JSON.stringify(
          deleteCriteria,
        )}`,
      );
      const startTime = convertpossibleStringTypeToInt(
        deleteCriteria.startTime,
      );
      /* typeof deleteCriteria.startTime == 'string'
          ? Number(deleteCriteria.startTime).valueOf()
          : deleteCriteria.startTime; */
      const endTime = convertpossibleStringTypeToInt(deleteCriteria.endTime);
      /*  typeof deleteCriteria.endTime == 'string'
          ? Number(deleteCriteria.endTime).valueOf()
          : deleteCriteria.endTime; */

      this.logger.debug(
        `${msgTemplate} : Start and end time are : ${startTime}, ${endTime}`,
      );
      return await this.repo.delete({
        assetId: deleteCriteria.assetId,
        virtualDeviceId: deleteCriteria.virtualDeviceId,
        metric: {
          metricsAttributeId: deleteCriteria.metricsAttributeId,
          txnCapturePeriod: Between<Date>(
            new Date(startTime),
            new Date(endTime),
          ),
        },
      });
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${msgTemplate} : ${event} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async findTelemetryPayloadRecordSetB(recordSetA: any[]) {
    const whereConditions = [];

    for (const record of recordSetA) {
      whereConditions.push({
        assetId: record.assetId,
        virtualDeviceId: record.virtualDeviceId,
        txnCapturePeriod: record.txnCapturePeriod,
        metric: {
          metricsAttributeId: record.metric?.metricsAttributeId,
          txnCapturePeriod: record.metric?.txnCapturePeriod
        },
      });
    }

    if (!whereConditions.length) {
      return [];
    }

    return this.repo.find({
      where: whereConditions,
      relations: {
        metric: true,
      },
    });
  }


  //   restore(id: string) {
  //     const msgTemplate = 'Restore ' + this.serviceName;
  //     return restore<TelemetryPayload>(this.repo, id, msgTemplate);
  //   }

  //   getKey(telemetryPayload: TelemetryPayload) {
  //     return (
  //       telemetryPayload.virtualDeviceId +
  //       KEY_SEPARATOR +
  //       telemetryPayload.metric.metricsAttributeId +
  //       KEY_SEPARATOR +
  //       telemetryPayload.metric.txnCapturePeriod
  //     );
  //   }

  //   /* getFindTelemetryPayloadDTOFromMultipleIDs = (
  //     searchCriteria: FindTelemetryPayloadsFromMultipleIDs,
  //   ): FindOptionsWhere<TelemetryPayload> => {
  //     const fnName = this.getFindTelemetryPayloadDTOFromMultipleIDs.name;
  //     const findMetricDTO: FindMetricDto = {};
  //     const findTelemetryPayloadDTO: FindOptionsWhere<TelemetryPayload> = {};
  //     if (searchCriteria.csvAssetIDs && searchCriteria.csvAssetIDs.length > 0) {
  //       this.logger.debug(
  //         `${fnName} : Asset IDs : ${searchCriteria.csvAssetIDs}`,
  //       );
  //       findTelemetryPayloadDTO.assetId = In(searchCriteria.csvAssetIDs.split(','));
  //     }
  //     if (searchCriteria.csvVirtualDeviceIDs && searchCriteria.csvVirtualDeviceIDs.length > 0) {
  //       this.logger.debug(
  //         `${fnName} : Virtual Device IDs : ${searchCriteria.csvVirtualDeviceIDs}`,
  //       );
  //       findTelemetryPayloadDTO.virtualDeviceId = In(
  //         searchCriteria.csvVirtualDeviceIDs.split(','),
  //       );
  //     } else {
  //       findTelemetryPayloadDTO.virtualDeviceId = IsNull();
  //     }
  //     if (searchCriteria.csvMetricsAttributeIDs && searchCriteria.csvMetricsAttributeIDs.length > 0) {
  //       this.logger.debug(
  //         `${fnName} : Metrics Attribute IDs : ${searchCriteria.csvMetricsAttributeIDs}`,
  //       );
  //       findMetricDTO.metricsAttributeId = In(
  //         searchCriteria.csvMetricsAttributeIDs.split(','),
  //       );

  //     }
  //     if (searchCriteria.startTime && searchCriteria.endTime) {
  //       const startTime = convertpossibleStringTypeToInt(
  //         searchCriteria.startTime,
  //       );
  //       const endTime = convertpossibleStringTypeToInt(searchCriteria.endTime);
  //       this.logger.debug(
  //         `${fnName} : Start Time : ${startTime}, End Time : ${endTime}`,
  //       );
  //       findMetricDTO.txnCapturePeriod = Between<Date>(
  //         new Date(startTime),
  //         new Date(endTime),
  //       );
  //     }
  //     findTelemetryPayloadDTO.metric = findMetricDTO;
  //     this.logger.debug(
  //       `${fnName} : Generated FindTelemetryPayload DTO : ${JSON.stringify(
  //         findTelemetryPayloadDTO,
  //       )}`,
  //     );
  //     return findTelemetryPayloadDTO;
  //   } */

  //   /*  private hasPeriodTelemetryDecreased(
  //     latestAvailableTelemetryPayload: CurrentTelemetryPayload,
  //     incomingTelemetryPayload: CreateTelemetryPayloadDto,
  //   ) {
  //     return (
  //       parseFloat(latestAvailableTelemetryPayload.metric.measure) >
  //       parseFloat(incomingTelemetryPayload.metric!.measure)
  //     );
  //   } */
}
