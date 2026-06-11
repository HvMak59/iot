import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, IsNull, LessThan, Repository } from 'typeorm';
// import {
//   findAll,
//   deleteRec,
//   softDelete,
//   restore,
// } from '../../utils/cmnFn.repository';

// import serviceConfig from '../../app_config/service.config.json';

import { CreateCurrentTelemetryDto } from './dto/create-current-telemetry.dto';
import { UpdateCurrentTelemetryDto } from './dto/update-current-telemetry.dto';
import { CurrentTelemetryPayload } from './entities/current-telemetry-payload.entity';
import { FindCurrentTelemetryDto } from './dto/find-current-telemetry.dto';
// import {
//   convertpossibleStringTypeToInt,
//   getTryCatchErrorStr,
//   hasPeriodTelemetryIncreased,
//   hasPeriodTelemetryNotIncreased,
//   isPeriodTelemetry,
// } from 'utils/others';
import { FindCurrentTelemetryForAPeriod } from './dto/find-current-telemetry-for-a-period.dto';
// import _ from 'lodash';
import { FindCurrentTelemetryPayloadsByMultipleIDs } from './dto/find-current-telemetry-payloads-byMultipleIDs.dto';
import { Metric } from 'src/metrics/entities/metric.entity';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import {
//   CreateCurrTelemetryEvent,
//   diffToEndOfDayThreshold,
//   KEY_SEPARATOR,
// } from 'src/app_config/constants';
// import { EventEmitter2 } from '@nestjs/event-emitter';
import { CurrentTelemetryPayloadsRepo } from './entities/current-telemetry-payloads.entity';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { diffToEndOfDayThreshold, KEY_SEPARATOR } from 'src/app_config/constants';
import { convertpossibleStringTypeToInt, getTryCatchErrorStr } from 'src/utils/others';
import { InputAlert2Dto } from 'src/alert/dto/input-alert2.dto';
import { IotServerService } from 'src/iot-server/iot-server.service';

@Injectable()
export class CurrentTelemetryPayloadService {
  private readonly logger = winstonServerLogger(
    CurrentTelemetryPayloadService.name,
  );
  // private serviceName = serviceConfig.currentTelemetryPayload.serviceName;
  constructor(
    @InjectRepository(CurrentTelemetryPayload)
    private readonly repo: Repository<CurrentTelemetryPayload>,
    private eventEmitter: EventEmitter2,
    // private iotServerService: IotServerService,
  ) { }

  /* async getAssetPerformanceTelemetry(assetId: string) {
    logger.debug("Inside getAssetPerformanceTelemetry");
    const assetPerformanceTelemetry = await this.repo
      .createQueryBuilder("CurrTelemetryPyld")
      .innerJoinAndSelect(AssetCurrentPerformanceSource, "assetPerfSrc", "assetPerfSrc.assetId = CurrTelemetryPyld.assetId")
      .select("CurrTelemetryPyld.measureName")
      .where("assetPerfSrc.assetId = :assetId", { assetId })
      .getMany();
    return assetPerformanceTelemetry;
  } */

  //async create(createCurrentTelemetryPayloadDto: CreateCurrentTelemetryDto[]) {
  /* async create(createCurrentTelemetryPayloadDto: CreateCurrentTelemetryDto[]) {
    const msgTemplate = "Insert " + this.serviceName;
    const rtrvdCurrTlmtryPyldsMap = new Map<string, CurrentTelemetryPayload>();
    const insertPromises = new Array<Promise<InsertResult>>();
    const updatePromises = new Array<Promise<CreateCurrentTelemetryDto & CurrentTelemetryPayload>>();
    let counter = 0;
    const assetIds = Array.from(new Set(createCurrentTelemetryPayloadDto.map((item) => item.assetId)));
    logger.debug(`${msgTemplate} : CurrentTelemetryPayloadService.create() : Find curr telemetry for : ${assetIds} : Start`);
    const rtrvdCurrTlmtryPylds = await this.repo.find({
      where: {
        assetId: In(assetIds)
      }
    });
    if (rtrvdCurrTlmtryPylds.length > 0) {
      rtrvdCurrTlmtryPylds.forEach( (rec) => {
        const key = `${rec.assetId},${rec.instanceType},${rec.instanceId},${rec.measureName}`;
        logger.info(`${msgTemplate} : CurrentTelemetryPayloadService.create() : Key : ${key}`);
        rtrvdCurrTlmtryPyldsMap.set(key, rec);
      });
      createCurrentTelemetryPayloadDto.forEach(async (incoming, index, crrntTlmtryPyldDtoArray) => {
        try {
          logger.debug(`${msgTemplate} : CurrentTelemetryPayloadService.create() : ${incoming.assetId},${incoming.instanceType},${incoming.instanceId},${incoming.measureName}, ${incoming.txnCaptureTime} : Start`);
          const arrvdCurrTlmtryPayloadKey = `${incoming.assetId},${incoming.instanceType},${incoming.instanceId},${incoming.measureName}`;
          const alreadyStored = rtrvdCurrTlmtryPyldsMap.get(arrvdCurrTlmtryPayloadKey);
          if (alreadyStored) {
            if (incoming.txnCaptureTime) {
              incoming.txnCaptureTime = new Date(incoming.txnCaptureTime);
              if (alreadyStored.txnCaptureTime < incoming.txnCaptureTime) {
                const updateCriteria = {
                  assetId: incoming.assetId,
                  instanceType: incoming.instanceType,
                  instanceId: incoming.instanceId,
                  measureName: incoming.measureName
                }
                //const updateResult = await this.repo.update(updateCriteria, incoming);
                //const updateResult = await this.repo.upsert(incoming, {conflictPaths: ["assetId", "instanceType", "instanceId", "measureName"]});
                //const updateResult = await this.repo.save(incoming); 
                updatePromises.push(this.repo.save(incoming));
                logger.debug(`${msgTemplate} : CurrentTelemetryPayloadService.create() : ${counter} : ${incoming.assetId},${incoming.instanceType},${incoming.instanceId},${incoming.measureName} : updated.`);
                //logger.info(`${msgTemplate} : CurrentTelemetryPayloadService.create() : ${JSON.stringify(updateCriteria)} : Update result : ${JSON.stringify(updateResult)}`);  
              }
              else {
                logger.info(`${msgTemplate} : CurrentTelemetryPayloadService.create() : No update as : Stored time : ${alreadyStored.txnCaptureTime} >= Incoming time : ${incoming.txnCaptureTime}`);
              }
            }
            else {
              logger.info(`${msgTemplate} : CurrentTelemetryPayloadService.create() : txn time not available : ${JSON.stringify(incoming)}`);
            }
          }
          else {
            logger.debug(`${msgTemplate} : CurrentTelemetryPayloadService.create() : Inserting : ${JSON.stringify(incoming)} : Reason 2 : match is not available`);
            //const insertResult = await this.repo.insert(incoming);
            insertPromises.push(this.repo.insert(incoming));
            logger.debug(`${msgTemplate} : CurrentTelemetryPayloadService.create() : ${counter} : ${incoming.assetId},${incoming.instanceType},${incoming.instanceId},${incoming.measureName} : inserted.`);
            //logger.info(`${msgTemplate} : CurrentTelemetryPayloadService.create() : ${JSON.stringify(incoming)} : Insert result : ${insertResult}`);
          }
        } 
        catch (error) {
          logger.error(`${msgTemplate} : CurrentTelemetryPayloadService.create() : ${error} : ${JSON.stringify(incoming)}`);
          logger.debug(`${msgTemplate} : CurrentTelemetryPayloadService.create() : ${incoming.assetId},${incoming.instanceType},${incoming.instanceId},${incoming.measureName} : End?`);
        } finally {
          ++counter;
          if (counter === crrntTlmtryPyldDtoArray.length) {
            logger.debug(`${msgTemplate} : CurrentTelemetryPayloadService.create() : ${incoming.assetId},${incoming.instanceType},${incoming.instanceId},${incoming.measureName} : Finished.`);
            return { counter };
          }
        }
      });
    } else {
        logger.debug(`${msgTemplate} : CurrentTelemetryPayloadService.create() : Inserting all as previous records are not available`);
        insertPromises.push(this.repo.insert(createCurrentTelemetryPayloadDto));
        const insertResult = await this.repo.insert(createCurrentTelemetryPayloadDto);
        logger.debug(`${msgTemplate} : CurrentTelemetryPayloadService.create() : ${JSON.stringify(insertResult)} : inserted.`);
        return insertResult;
    }
  } */

  /* async create(createCurrentTelemetryPayloadDTOs: CreateCurrentTelemetryDto[]) {
    const fName = 'create()';
    let retrievedCurrTlmtryPylds: CurrentTelemetryPayload[];
    try {
      this.logger.debug(
        `${fName} : No of arrived records : ${createCurrentTelemetryPayloadDTOs.length} : Start`,
      );
      const createCurrTelePayloadMap: Map<String, CreateCurrentTelemetryDto> =
        this.currTelemtryPyldByVDIdAndMAId(createCurrentTelemetryPayloadDTOs);

      retrievedCurrTlmtryPylds = await this.repo.find({
        where: {
          virtualDeviceId: In(
            [...createCurrTelePayloadMap.values()].map(
              (ctp) => ctp.virtualDeviceId,
            ),
          ),
        },
      });
      this.logger.debug(
        `${fName} : No of Retrieved payloads : ${retrievedCurrTlmtryPylds.length}`,
      );
      if (retrievedCurrTlmtryPylds.length > 0) {
        for (const retrievedCurrTelemetryPyld of retrievedCurrTlmtryPylds) {
          const createCurrTelemetryPyld = createCurrTelePayloadMap.get(
            retrievedCurrTelemetryPyld.virtualDeviceId!,
          );
          if (createCurrTelemetryPyld) {
            if (
              this.isArrivedTelemetryOld(
                retrievedCurrTelemetryPyld.metric.txnCaptureTime,
                createCurrTelemetryPyld.metric!.txnCaptureTime,
              ) ||
              (isPeriodTelemetry(createCurrTelemetryPyld.metric!) &&
                hasPeriodTelemetryIncreased(
                  retrievedCurrTelemetryPyld.metric,
                  createCurrTelemetryPyld.metric!,
                ))
            ) {
              createCurrTelePayloadMap.delete(
                retrievedCurrTelemetryPyld.virtualDeviceId!,
              );
            }
          }
        }
      }
      for (let createCurrTelemetryPyld of createCurrTelePayloadMap.values()) {
        if (createCurrTelemetryPyld.metric) {
          createCurrTelemetryPyld.metric = new Metric(
            createCurrTelemetryPyld.metric,
          );
        }
      }

      return await this.repo.upsert([...createCurrTelePayloadMap.values()], {
        conflictPaths: ['virtualDeviceId', 'metric.metricsAttributeId'],
      });
    } catch (error) {
      const errMsg = `${fName} : CurrentTelemetryPayloadService.create() : ${error} : End`;
      this.logger.error(errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  } */

  async createV2(
    createCurrentTelemetryPayloadDTOs: CreateCurrentTelemetryDto[],
  ) {
    const fName = this.createV2.name;
    let retrievedCTPLs: CurrentTelemetryPayload[];
    try {
      this.logger.debug(
        `${fName} : No of arrived records : ${createCurrentTelemetryPayloadDTOs.length} : Start`,
      );
      const ctpls = new CurrentTelemetryPayloadsRepo(
        createCurrentTelemetryPayloadDTOs,
      );
      const arrivedCTPLsByAssetIDVDeviceIdMAId =
        ctpls.getCTPLByAssetIdVDeviceIdMAId();
      /* const createCurrTelePayloadMap: Map<String, CreateCurrentTelemetryDto> =
        this.currTelemtryPyldByVDIdAndMAId(createCurrentTelemetryPayloadDTOs); */

      retrievedCTPLs = await this.repo.find({
        where: ctpls.getSearchCriterias(),
      });
      this.logger.debug(
        `${fName} : No of Retrieved payloads : ${retrievedCTPLs.length}`,
      );
      if (retrievedCTPLs.length > 0) {
        const currentTime = new Date();
        const currentDayEndTime = new Date(
          currentTime.getFullYear(),
          currentTime.getMonth(),
          currentTime.getDate(),
          23,
          59,
          59,
          999,
        );
        const diffInMilliSeconds =
          currentDayEndTime.valueOf() - currentTime.valueOf();
        for (const retrievedCTPL of retrievedCTPLs) {
          const retrievedCTPLObj = new CurrentTelemetryPayload(retrievedCTPL);
          const key = retrievedCTPLObj.getKey();
          const createCTPL = arrivedCTPLsByAssetIDVDeviceIdMAId.get(key);
          if (createCTPL) {
            const createCTPLObj = new CurrentTelemetryPayload(createCTPL);
            this.logger.debug(
              `${fName} : createTelemetryPayload found for : ${key}`,
            );
            if (
              retrievedCTPLObj.isArrivedCTPLOlder(createCTPLObj) ||
              (diffInMilliSeconds < diffToEndOfDayThreshold &&
                createCTPLObj.isPeriodTelemetry() &&
                retrievedCTPLObj.hasArrivedCTPLNotIncreased(createCTPLObj))
            ) {
              arrivedCTPLsByAssetIDVDeviceIdMAId.delete(key);
              this.logger.debug(
                `${fName} : createTelemetryPayload deleted for : ${key}`,
              );
            }
          } else {
            this.logger.debug(
              `${fName} : createTelemetryPayload not found for : ${key}`,
            );
          }
        }
      } else {
        this.logger.debug(
          `${fName} : No retrieved current telemetry payloads found`,
        );
      }
      const currTelemetryToBeUpserted: CreateCurrentTelemetryDto[] = [];
      for (let createCurrTelemetryPyld of arrivedCTPLsByAssetIDVDeviceIdMAId.values()) {
        if (createCurrTelemetryPyld.metric) {
          createCurrTelemetryPyld.metric = new Metric(
            createCurrTelemetryPyld.metric,
          );
          const newCreateCurrTelemetryPyld = new CurrentTelemetryPayload(
            createCurrTelemetryPyld,
          );
          const { auditAttribute, ...cCTPL } = newCreateCurrTelemetryPyld;
          this.logger.debug(
            `${fName} : Current Telemetry Payload to be upserted : ${JSON.stringify(
              cCTPL,
            )}`,
          );
          currTelemetryToBeUpserted.push(cCTPL);
        }
      }
      this.logger.debug(
        `${fName} : No of records to be upserted : ${arrivedCTPLsByAssetIDVDeviceIdMAId.size}`,
      );
      const result = await this.repo.save([...currTelemetryToBeUpserted]);
      /* const result = await this.repo.upsert(
        [...createCurrTelePayloadMap.values()],
        {
          conflictPaths: ['virtualDeviceId', 'metric.metricsAttributeId'],
        },
      );
      this.logger.debug(
        `${fName} : No of records upserted : ${result.identifiers.length}`,
      );*/
      this.logger.debug(
        `${fName} : Firing CreateCurrTelemetryEvent with No of records upserted : ${result.length}`,
      );
      this.eventEmitter.emit('telemetry.inserted', result);
      return result;
      /* return await this.repo.save([...createCurrTelePayloadMap.values()]); */
    } catch (error) {
      const errMsg = `${fName} : CurrentTelemetryPayloadService.create() : ${error} : End`;
      this.logger.error(errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(createTelemetryPayloadDto: CreateCurrentTelemetryDto[]) {
    const tobeCreated = this.repo.create(createTelemetryPayloadDto);
    // return await this.repo.save(tobeCreated);
    const saved = await this.repo.save(tobeCreated);

    console.log("created")
    this.eventEmitter.emit(
      'telemetry.inserted',
      saved,
    );
    console.log("event");

    return saved;
  }

  private myWorking = 1;
  // async createOfflineRmuAlert() {
  //   console.log("in service");
  //   const cutoffTime = new Date(Date.now() - 20 * 60 * 1000);

  //   const rows = await this.repo.find({
  //     select: {
  //       id: true,
  //       assetId: true,
  //       deviceId: true,
  //       virtualDeviceId: true,
  //       metric: {
  //         txnCaptureTime: true,
  //         metricsAttributeId: true,
  //       },
  //     },
  //     // where: {
  //     //   metric: {
  //     //     txnCaptureTime: LessThan(new Date(Date.now() - 20 * 60 * 1000)) // Assuming RMU is offline if no telemetry received in last 20 minutes
  //     //   }
  //     // },
  //   });
  //   console.log(rows);

  //   // const latestByRmu = new Map<string, CurrentTelemetryPayload>();

  //   // for (const row of rows) {
  //   //   const key = row.virtualDeviceId!;
  //   //   const existing = latestByRmu.get(key);

  //   //   if (!existing) {
  //   //     latestByRmu.set(key, row);
  //   //   }
  //   // }

  //   const byAsset = new Map<
  //     string,
  //     {
  //       csvVirtualDeviceIDs: Set<string>;
  //       arrivedAlerts2: InputAlert2Dto[];
  //     }
  //   >();

  //   for (const row of rows) {
  //     let assetGroup = byAsset.get(row.assetId!);
  //     if (!assetGroup) {
  //       assetGroup = {
  //         csvVirtualDeviceIDs: new Set<string>(),
  //         arrivedAlerts2: [],
  //       };
  //       byAsset.set(row.assetId!, assetGroup!);
  //     }
  //     assetGroup!.csvVirtualDeviceIDs.add(row.virtualDeviceId!);

  //     const lastTxnTime = new Date(row.metric.txnCaptureTime);

  //     if (lastTxnTime < cutoffTime) {
  //       assetGroup.arrivedAlerts2.push(
  //         new InputAlert2Dto({
  //           alertId: 'RMU_OFFLINE',
  //           assetId: row.assetId,
  //           deviceId: row.deviceId,
  //           virtualDeviceId: row.virtualDeviceId,
  //           sourceAttribute: 'RMU_OFFLINE',
  //           openDateTime: Date.now(),
  //           metricsAttributeId: row.metric.metricsAttributeId,
  //         } as any),
  //       );
  //     }
  //   }

  //   const results = [];

  //   for (const [assetId, group] of byAsset.entries()) {
  //     const result = await this.iotServerService.manageAlerts2(
  //       'token',
  //       assetId,
  //       Array.from(group.csvVirtualDeviceIDs).join(','),
  //       group.arrivedAlerts2,
  //       Date.now(),
  //     );

  //     results.push({
  //       assetId,
  //       ...result,
  //     });
  //   }

  //   return results;
  // }

  private needToCheck = 1;
  // async findOfflineRmu() {
  //   console.log("in service");
  //   const cutoffTime = new Date(Date.now() - 20 * 60 * 1000);

  //   const offlineRmus = await this.repo.find({
  //     select: {
  //       id: true,
  //       assetId: true,
  //       deviceId: true,
  //       virtualDeviceId: true,
  //       metric: {
  //         txnCaptureTime: true,
  //         metricsAttributeId: true,
  //       },
  //     },
  //     where: {
  //       metric: {
  //         txnCaptureTime: LessThan(new Date(Date.now() - 20 * 60 * 1000))
  //       }
  //     },
  //   });
  //   console.log(offlineRmus);

  //   const sortedRmus = new Map<string, CurrentTelemetryPayload>();

  //   for (const row of offlineRmus) {
  //     const key = row.virtualDeviceId!;
  //     const existing = sortedRmus.get(key);

  //     if (!existing) {
  //       sortedRmus.set(key, row);
  //     }
  //   }

  //   return sortedRmus.values();
  // }

  async findOfflineRmu() {
    const cutoffTime = new Date(Date.now() - 20 * 60 * 1000);

    const offlineRmus = await this.repo.find({
      select: {
        id: true,
        assetId: true,
        deviceId: true,
        virtualDeviceId: true,
        metric: {
          txnCaptureTime: true,
          metricsAttributeId: true,
        },
      },
      relations: {
        metric: true,
      },
      // where: {
      //   metric: {
      //     txnCaptureTime: LessThan(cutoffTime),
      //   },
      // },
    });
    const uniqueByVirtualDevice = new Map<string, CurrentTelemetryPayload>();

    const currentTime = new Date();

    for (const row of offlineRmus) {
      if (!row.virtualDeviceId) continue;
      if (!uniqueByVirtualDevice.has(row.virtualDeviceId)) {
        uniqueByVirtualDevice.set(row.virtualDeviceId, row);
      }
    }
    return Array.from(uniqueByVirtualDevice.values());
  }

  // async findAllRmusForOfflineCheck() {
  //   return this.repo.find({
  //     select: {
  //       id: true,
  //       assetId: true,
  //       deviceId: true,
  //       virtualDeviceId: true,
  //       metric: {
  //         txnCaptureTime: true,
  //         metricsAttributeId: true,
  //       },
  //     },
  //     relations: {
  //       metric: true,
  //     },
  //   });
  // }

  async findLatestRmuForOfflineCheck() {
    const currTMPylds = await this.repo.find({
      select: {
        id: true,
        assetId: true,
        deviceId: true,
        virtualDeviceId: true,
        metric: {
          txnCaptureTime: true,
          txnCapturePeriod: true
        },
        device: {
          id: true,
          deviceModelId: true
        }
      },
      relations: ['device']
    });

    const latestByVirtualDevice = new Map<string, CurrentTelemetryPayload>();

    for (const currTMPyld of currTMPylds) {
      if (!currTMPyld.virtualDeviceId) continue;

      const existing = latestByVirtualDevice.get(currTMPyld.virtualDeviceId);

      if (!existing) {
        latestByVirtualDevice.set(currTMPyld.virtualDeviceId, currTMPyld);
      }
    }

    return Array.from(latestByVirtualDevice.values());
  }

  // async findOfflineRmu(token: string) {
  //   const cutoffTime = new Date(Date.now() - 20 * 60 * 1000);

  //   // IMPORTANT:
  //   // We should fetch telemetry rows, then keep only the latest row per RMU.
  //   // If possible, add order so latest comes first.
  //   const rows = await this.repo.find({
  //     select: {
  //       id: true,
  //       assetId: true,
  //       deviceId: true,
  //       virtualDeviceId: true,
  //       metric: {
  //         txnCaptureTime: true,
  //         metricsAttributeId: true,
  //       },
  //     },
  //     relations: {
  //       metric: true,
  //     },
  //   });

  //   const latestByRmu = new Map<string, any>();

  //   for (const row of rows) {
  //     const key = row.virtualDeviceId;
  //     if (!key) continue;

  //     const existing = latestByRmu.get(key);

  //     // keep the latest telemetry row per RMU
  //     if (
  //       !existing ||
  //       new Date(row.metric?.txnCaptureTime).getTime() >
  //       new Date(existing.metric?.txnCaptureTime).getTime()
  //     ) {
  //       latestByRmu.set(key, row);
  //     }
  //   }

  //   // Group by asset because manageAlerts2() accepts one assetId at a time
  //   const byAsset = new Map<
  //     string,
  //     {
  //       csvVirtualDeviceIDs: string[];
  //       arrivedAlerts2: InputAlert2Dto[];
  //     }
  //   >();

  //   for (const row of latestByRmu.values()) {
  //     if (!row.assetId || !row.virtualDeviceId || !row.metric?.txnCaptureTime) {
  //       continue;
  //     }

  //     let assetGroup = byAsset.get(row.assetId);
  //     if (!assetGroup) {
  //       assetGroup = {
  //         csvVirtualDeviceIDs: [],
  //         arrivedAlerts2: [],
  //       };
  //       byAsset.set(row.assetId, assetGroup);
  //     }
  //     assetGroup.csvVirtualDeviceIDs.push(row.virtualDeviceId);

  //     const lastTxnTime = new Date(row.metric.txnCaptureTime);

  //     // offline RMU
  //     if (lastTxnTime < cutoffTime) {
  //       assetGroup.arrivedAlerts2.push(
  //         new InputAlert2Dto({
  //           alertId: 'RMU_OFFLINE',
  //           assetId: row.assetId,
  //           deviceId: row.deviceId,
  //           virtualDeviceId: row.virtualDeviceId,
  //           sourceAttribute: 'RMU_OFFLINE',
  //           openDateTime: Date.now(),
  //           metricsAttributeId: row.metric.metricsAttributeId,
  //         } as any),
  //       );
  //     }
  //   }

  //   const results = [];

  //   for (const [assetId, group] of byAsset.entries()) {
  //     const result = await this.manageAlerts2(
  //       token,
  //       assetId,
  //       [...new Set(group.csvVirtualDeviceIDs)].join(','),
  //       group.arrivedAlerts2,
  //       Date.now(),
  //     );

  //     results.push({
  //       assetId,
  //       ...result,
  //     });
  //   }

  //   return results;
  // }

  private z = 5;
  //   async findOfflineRmu(token: string) {
  //   const cutoffTime = new Date(Date.now() - 20 * 60 * 1000);

  //   const rows = await this.repo.find({
  //     select: {
  //       id: true,
  //       assetId: true,
  //       deviceId: true,
  //       virtualDeviceId: true,
  //       metric: {
  //         txnCaptureTime: true,
  //         metricsAttributeId: true,
  //       },
  //     },
  //     relations: {
  //       metric: true,
  //     },
  //   });

  //   const byAsset = new Map<
  //     string,
  //     {
  //       csvVirtualDeviceIDs: Set<string>;
  //       arrivedAlerts2: InputAlert2Dto[];
  //     }
  //   >();

  //   for (const row of rows) {
  //     if (!row.assetId || !row.virtualDeviceId || !row.metric?.txnCaptureTime) {
  //       continue;
  //     }

  //     let group = byAsset.get(row.assetId);
  //     if (!group) {
  //       group = {
  //         csvVirtualDeviceIDs: new Set<string>(),
  //         arrivedAlerts2: [],
  //       };
  //       byAsset.set(row.assetId, group);
  //     }

  //     // all RMUs of this asset must be sent to manageAlerts2
  //     group.csvVirtualDeviceIDs.add(row.virtualDeviceId);

  //     // 20 minute offline check
  //     const txnTime = new Date(row.metric.txnCaptureTime);
  //     if (txnTime < cutoffTime) {
  //       group.arrivedAlerts2.push(
  //         new InputAlert2Dto({
  //           alertId: 'RMU_OFFLINE',
  //           assetId: row.assetId,
  //           deviceId: row.deviceId,
  //           virtualDeviceId: row.virtualDeviceId,
  //           sourceAttribute: 'RMU_OFFLINE',
  //           openDateTime: txnTime.getTime(), // or Date.now()
  //           metricsAttributeId: row.metric.metricsAttributeId,
  //         } as any),
  //       );
  //     }
  //   }

  //   const results = [];

  //   for (const [assetId, group] of byAsset.entries()) {
  //     const result = await this.manageAlerts2(
  //       token,
  //       assetId,
  //       Array.from(group.csvVirtualDeviceIDs).join(','),
  //       group.arrivedAlerts2,
  //       Date.now(),
  //     );

  //     results.push({
  //       assetId,
  //       ...result,
  //     });
  //   }

  //   return results;
  // }


  async findByIds(ids: string[]) {
    return this.repo.find({
      where: { id: In(ids) },
      relations: ['virtualDevice']
    });
  }


  //   /* private currTelemtryPyldByVDIdAndMAId(
  //     createCurrentTelemetryPayloadDTOs: Partial<CurrentTelemetryPayload>[],
  //   ) {
  //     const createCurrTelePayloadMap: Map<
  //       String,
  //       Partial<CurrentTelemetryPayload>
  //     > = new Map();
  //     for (const createCurrTelePayloadDTO of createCurrentTelemetryPayloadDTOs) {
  //       const key = this.currTelePayloadKey(createCurrTelePayloadDTO);
  //       const getCreateCurrTelePayload = createCurrTelePayloadMap.get(key);
  //       if (getCreateCurrTelePayload) {
  //         if (
  //           new Date(getCreateCurrTelePayload.metric!.txnCaptureTime).valueOf() <
  //           new Date(createCurrTelePayloadDTO.metric!.txnCaptureTime).valueOf()
  //         ) {
  //           createCurrTelePayloadMap.set(
  //             key,
  //             new CurrentTelemetryPayload(createCurrTelePayloadDTO),
  //           );
  //         }
  //       } else {
  //         createCurrTelePayloadMap.set(
  //           this.currTelePayloadKey(createCurrTelePayloadDTO),
  //           new CurrentTelemetryPayload(createCurrTelePayloadDTO),
  //         );
  //       }
  //     }
  //     return createCurrTelePayloadMap;
  //   } */

  //   /* currTelePayloadKey(currentTelemetryPayload: CreateCurrentTelemetryDto) {
  //     return new CurrentTelemetryPayload(currentTelemetryPayload).getKey();
  //   } */

  //   currTelePayloadTxnTime(currentTelemetryPayload: CreateCurrentTelemetryDto) {
  //     return currentTelemetryPayload.metric!.txnCaptureTime;
  //   }

  findAll(
    searchCriteria: FindCurrentTelemetryDto | FindCurrentTelemetryDto[],
    relationsRequired: boolean = false,
  ) {
    const fnName = `findAll(${JSON.stringify(searchCriteria)})`;
    return this.repo.find({ where: searchCriteria })

    // try {
    //   let relations = 
    //   relationsRequired
    //     ? serviceConfig.currentTelemetryPayload.relations
    //     : [];
    //   return findAll<CurrentTelemetryPayload>(
    //     this.repo,
    //     fnName,
    //     relations,
    //     searchCriteria,
    //   );
    // } catch (error) {
    //   const errMsg = getTryCatchErrorStr(error);
    //   this.logger.error(fnName + KEY_SEPARATOR + errMsg);
    //   throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    // }
  }

  //   /* findAllWthRelations() {
  //     const msgTemplate = 'Find ' + this.serviceName + 's' + ' with relations';
  //     return findAll<CurrentTelemetryPayload>(
  //       this.repo,
  //       msgTemplate,
  //       serviceConfig.currentTelemetryPayload.relations,
  //     );
  //   } */

  //   async findOneById(id: string) {
  //     const fnName = `findOneById(${id})`;
  //     try {
  //       return await this.repo.findOne({ where: { id: id } });
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(fnName + KEY_SEPARATOR + errMsg);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   }

  //   async findOneByIdWthRelations(id: string) {
  //     const fnName = `findOneByIdWthRelations(${id})`;
  //     try {
  //       return await this.repo.findOne({
  //         where: {
  //           id: id,
  //         },
  //         relations: serviceConfig.currentTelemetryPayload.relations,
  //       });
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(fnName + KEY_SEPARATOR + errMsg);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   }

  //   findByMultipleIDs(searchCriteria: FindCurrentTelemetryPayloadsByMultipleIDs) {
  //     const fnName = this.findByMultipleIDs.name;
  //     //const input = `Input : ${JSON.stringify(searchCriteria)}`;
  //     this.logger.debug(`${fnName} : Start`);
  //     //this.logger.debug(input);
  //     const assetIDs = searchCriteria.csvAssetIDs?.split(',');
  //     const deviceIDs = searchCriteria.csvDeviceIDs?.split(',');
  //     const virtualDeviceIDs =
  //       searchCriteria.csvVirtualDeviceIDs?.split(',') ?? null;
  //     const attributes = searchCriteria.csvMetricsAttributeIDs?.split(',');
  //     const searchObject: FindCurrentTelemetryDto = {};
  //     if (assetIDs) {
  //       searchObject.virtualDevice = {
  //         assetId: In(_.uniq(assetIDs)),
  //       };
  //     }
  //     if (deviceIDs) {
  //       searchObject.deviceId = In(_.uniq(deviceIDs));
  //     }
  //     if (virtualDeviceIDs) {
  //       searchObject.virtualDeviceId = In(_.uniq(virtualDeviceIDs));
  //     } /* else {
  //       searchObject.virtualDeviceId = IsNull();
  //     } */
  //     if (attributes) {
  //       searchObject.metric = {
  //         metricsAttributeId: In(_.uniq(attributes)),
  //       };
  //     }
  //     this.logger.debug(
  //       `${fnName} : searchObject is : ${JSON.stringify(searchObject)}`,
  //     );
  //     const result = this.repo.findBy(searchObject);
  //     return result;
  //   }

  //   findByMultipleConditions(searchCriteria: FindCurrentTelemetryDto[]) {
  //     const fnName = this.findByMultipleConditions.name;
  //     this.logger.debug(`${fnName} : Start`);
  //     this.logger.debug(`Input : No of conditions : ${searchCriteria.length}`);
  //     const result = this.repo.find({
  //       where: searchCriteria,
  //     });
  //     return result;
  //   }

  //   async findWithInGivenTimeRange(
  //     assetId: string,
  //     csvMetricsAttributeIDs: string,
  //     startTime: number,
  //     endTime: number,
  //     virtualDeviceId?: string,
  // ) {
  //     return await this.repo.find({
  //       where: {
  //         assetId,
  //         virtualDeviceId : virtualDeviceId ?? IsNull(),
  //         metric: {
  //           metricsAttributeId: In(csvMetricsAttributeIDs.split(',')),    
  //           txnCapturePeriod: Between<Date>(
  //             new Date(startTime),
  //             new Date(endTime),
  //           ),
  //         },
  //       },
  //       order: { 
  //         metric: { txnCapturePeriod: 'DESC' }
  //       },
  //     });
  // }

  //   /* async firstMetricOfADevice(
  //     assetID: string,
  //     deviceTypeID: string,
  //     virtualDeviceID: string,
  //   ) {
  //     const currTlmtryPyld = await this.repo.findOne({
  //       where: {
  //         virtualDeviceId: virtualDeviceID,
  //         assetId: assetID,
  //         device: {
  //           deviceModel: {
  //             deviceType: {
  //               deviceTypeMetricsAttributes: {
  //                 displayOrder: 1,
  //                 deviceTypeId: deviceTypeID,
  //               },
  //             },
  //           },
  //         },
  //       },
  //       relations: {
  //         metric: true,
  //       },
  //     });
  //     if (currTlmtryPyld === null) {
  //       return null;
  //     } else {
  //       this.logger.debug(
  //         'Current telemetry payload : ' + JSON.stringify(currTlmtryPyld),
  //       );
  //       const telemetryDisplayProperty: TelemetryDisplayProperty = {
  //         metricsAttributeId: currTlmtryPyld!.metric.metricsAttributeId,
  //         frequency: currTlmtryPyld!.metric!.frequency,
  //         displayName: currTlmtryPyld!.metric.metricsAttributeId,
  //         displayOrder: 1,
  //       };
  //       const telemetryDevice =
  //         TelemetryDevice.createFromTelemetry(currTlmtryPyld);
  //       const currentTelemetryPayloadDTO = new CurrentTelemetryPayloadDTO(
  //         getMetricDTO(currTlmtryPyld.metric),
  //         telemetryDisplayProperty,
  //         telemetryDevice,
  //       );
  //       this.logger.debug(
  //         'First metric of a device : ' +
  //           JSON.stringify(currentTelemetryPayloadDTO),
  //       );
  //       return currentTelemetryPayloadDTO;
  //     }
  //   } */

  //   async update(
  //     id: string,
  //     updateCurrentTelemetryPayloadDto: UpdateCurrentTelemetryDto,
  //   ) {
  //     const fnName = `update(${id})`;
  //     try {
  //       this.logger.debug(fnName + KEY_SEPARATOR + `Start`);
  //       const result = await this.repo.update(
  //         id,
  //         updateCurrentTelemetryPayloadDto,
  //       );
  //       if (result.affected === 0) {
  //         this.logger.debug(fnName + KEY_SEPARATOR + `record does not exist`);
  //       } else this.logger.info(fnName + KEY_SEPARATOR + `updated`);
  //       return result;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(fnName + KEY_SEPARATOR + errMsg);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(fnName + KEY_SEPARATOR + `End`);
  //     }
  //   }

  //   delete(id: string) {
  //     const msgTemplate = 'Delete ' + this.serviceName;
  //     return deleteRec<CurrentTelemetryPayload>(this.repo, id, msgTemplate);
  //   }

  async deleteDeviceGroupForTimePeriod(
    deleteCriteria: FindCurrentTelemetryForAPeriod,
  ) {
    const fName = `deleteDeviceGroupForTimePeriod(${JSON.stringify(
      deleteCriteria,
    )})`;
    try {
      this.logger.debug(`Start`);
      const startTime = convertpossibleStringTypeToInt(
        deleteCriteria.startTime,
      );
      const endTime = convertpossibleStringTypeToInt(deleteCriteria.endTime);
      this.logger.debug(`Start and end time are : ${startTime}, ${endTime}`);
      return await this.repo.delete({
        virtualDeviceId: deleteCriteria.virtualDeviceId,
        metric: {
          metricsAttributeId: deleteCriteria.metricsAttributeId,
          txnCaptureTime: Between<Date>(new Date(startTime), new Date(endTime)),
        },
      });
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(errMsg);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`End`);
    }
  }

  //   softDelete(id: string) {
  //     const msgTemplate = 'Soft delete ' + this.serviceName;
  //     return softDelete<CurrentTelemetryPayload>(this.repo, id, msgTemplate);
  //   }

  //   restore(id: string) {
  //     const msgTemplate = 'Restore ' + this.serviceName;
  //     return restore<CurrentTelemetryPayload>(this.repo, id, msgTemplate);
  //   }

  //   private isArrivedTelemetryOld(retrievedTxnTime: Date, currentTxnTime: Date) {
  //     return (
  //       new Date(retrievedTxnTime).valueOf() > new Date(currentTxnTime).valueOf()
  //     );
  //   }

  //   /* private hasPeriodTelemetryDecreased(
  //     latestAvailableTelemetryPayload: CurrentTelemetryPayload,
  //     incomingTelemetryPayload: CreateCurrentTelemetryDto,
  //   ) {
  //     return (
  //       parseFloat(latestAvailableTelemetryPayload.metric.measure) >
  //       parseFloat(incomingTelemetryPayload.metric!.measure)
  //     );
  //   } */

  //   async findByIds(searchCriteria: string[]) {
  //     return await this.repo.find({
  //       select: {
  //         id: true,
  //         virtualDeviceId: true,
  //         metric: {
  //           metricsAttributeId: true,
  //           measure: true,
  //           txnCaptureTime: true,
  //           txnCapturePeriod: true,
  //         },
  //         asset: {
  //           id: true,
  //           orgId: true /* ,
  //           org: {
  //             id: true,
  //             outgoingUrls: {
  //               url: true,
  //               userName: true,
  //               password: true,
  //             },
  //           }, */,
  //         },
  //         device: {
  //           clientDeviceId: true,
  //           deviceModel: {
  //             deviceTypeId: true,
  //           },
  //         },
  //       },
  //       where: { id: In(searchCriteria) },
  //       relations: ['asset', 'device', 'device.deviceModel'],
  //     });
  //   }
}
