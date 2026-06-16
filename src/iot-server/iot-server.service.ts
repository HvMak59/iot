import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';

// import serviceConfig from '../../app_config/service.config.json';
// import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';
// import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TelemetryDevice } from './dto/telemetry-device.dto';
import { CurrentTelemetryPayloadDTO } from './dto/current-telemetry-payload.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { InputAlert2Dto } from 'alert/dto/input-alert2.dto';
// import { Alert } from 'alert/entities/alert.entity';
// import { CurrentOpenAlert } from 'current-open-alert/entities/current-open-alert.entity';
// import { FindCurrentOpenAlertDto } from 'current-open-alert/dto/find-current-open-alert.dto';
import { In, IsNull } from 'typeorm';
// import _, { find, max, size } from 'lodash';
import _ from 'lodash'
import { CurrentOpenAlertService } from 'src/current-open-alert/current-open-alert.service';
import { AlertService } from 'src/alert/alert.service';
import { CreateAlertDto } from 'src/alert/dto/create-alert.dto';
import { InputAlert2Dto } from 'src/alert/dto/input-alert2.dto';
import { Alert } from 'src/alert/entities/alert.entity';
import { FindDeviceModelAlertByMultipleIDs } from 'src/device-model-alert/dto/find-device-model-alert-byMultipleIDs.dto';
import { DEVICE_MODEL_WITH_ALERTS_URL, KEY_SEPARATOR, PUBLISH_INTERVAL_IN_SECONDS, SEPARATOR } from 'src/app_config/constants';
import { getTelemetryPayloadKey, getTokenString, getTryCatchErrorStr } from 'src/utils/others';
import { DeviceModel } from 'src/device-model/entities/device-model.entity';
import { AlertMaster } from 'src/alert-master/entities/alert-master.entity';
import { CurrentOpenAlert } from 'src/current-open-alert/entities/current-open-alert.entity';
import { FindCurrentOpenAlertDto } from 'src/current-open-alert/dto/find-current-open-alert.dto';
import { FindAlertDto } from 'src/alert/dto/find-alert.dto';
import { AlertGateway } from 'src/websocket/alert.gateway';
import { AlertStatus, Relations } from 'src/utils/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrgService } from 'src/org/org.service';
import { FindDevicesFromMultipleIDs } from 'src/device/dto/find-device-from-multiple-IDs.dto';
import { DeviceService } from 'src/device/device.service';
import { DeviceDto } from './dto/device.dto';
import { TelemetryPayload } from 'src/telemetry-payload/entities/telemetry-payload.entity';
import { FindTelemetryPayloadForAPeriod } from 'src/telemetry-payload/dto/find-telemetry-payload-for-a-period.dto';
import { CurrentTelemetryPayloadService } from 'src/current-telemetry-payload/current-telemetry-payload.service';
import { TelemetryPayloadService } from 'src/telemetry-payload/telemetry-payload.service';
import { PeriodTelemetryPayloadAuditService } from 'src/period-telemetry-payload-audit/period-telemetry-payload-audit.service';
import { VirtualDeviceService } from 'src/virtual-device/virtual-device.service';
import { MetricsFrequency } from 'src/common';
import { PeriodTelemetryPayloadAudit } from 'src/period-telemetry-payload-audit/entities/period-telemetry-payload-audit.entity';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
import { log } from 'console';
import { CreateTelemetryPayloadDto } from 'src/telemetry-payload/dto/create-telemetry-payload.dto';
import { ParentAggregationResult } from './interface/parent-aggregation-result.interface';
// import { CurrentOpenAlertService } from 'current-open-alert/current-open-alert.service';
// import { DEVICE_MODEL_WITH_ALERTS_URL, KEY_SEPARATOR } from 'src/app_config/constants';
// import { AlertService } from 'alert/alert.service';
// import { FindAlertDto } from 'alert/dto/find-alert.dto';
// import { InputAlertDto } from 'alert/dto/input-alert.dto';
// import { CreateAlertDto } from 'alert/dto/create-alert.dto';
// import { getTokenString } from 'src/utils/others';
// import { DeviceModel } from 'device-model/entities/device-model.entity';
// import { FindDeviceModelAlertByMultipleIDs } from 'device-model-alert/dto/find-device-model-alert-byMultipleIDs.dto';
// import { AlertMaster } from 'alert-master/entities/alert-master.entity';

@Injectable()
export class IotServerService {
  private schema;
  private appServer;
  private appPort;
  private baseURL;
  private readonly logger = winstonServerLogger('iot-service');
  // private serviceName = serviceConfig.iotService.serviceName;
  private serviceName = '';
  constructor(
    private readonly httpService: HttpService,
    private readonly orgService: OrgService,
    private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
    // private readonly assetTypeCurrentPerformanceSourceService: AssetTypeCurrentPerformanceSourceService,
    // private readonly assetService: AssetService,
    private readonly currentOpenAlertService: CurrentOpenAlertService,
    // private readonly assetCurrentPerformanceSourceService: AssetCurrentPerformanceSourceService,
    private readonly telemetryPayloadService: TelemetryPayloadService,
    // private readonly userService: UserService,
    // private readonly periodTelemetryPayloadAuditService: PeriodTelemetryPayloadAuditService,
    // private readonly deviceModelService: DeviceModelService,
    private readonly deviceService: DeviceService,
    private readonly alertService: AlertService,
    // private readonly deviceTypeMetricsAttributeService: DeviceTypeMetricsAttributeService,
    // private readonly deviceModelAlertService: DeviceModelAlertService,
    // private readonly todayTelemetryPayloadService: TodayTelemetryPayloadService,
    private readonly eventEmitter: EventEmitter2,

    private readonly periodTelemetryPayloadAuditService: PeriodTelemetryPayloadAuditService,
    private readonly virtualDeviceService: VirtualDeviceService,
  ) {
    this.schema = process.env['SCHEMA'];
    this.appServer = process.env['APP_SERVER'];
    this.appPort = process.env['APP_PORT'];
    this.baseURL = `${this.schema}://${this.appServer}:${this.appPort}`;
  }


  async saveTelemetryAlerts3(token: string, inputAlert2DTOs: InputAlert2Dto[]) {
    const fnName = this.saveTelemetryAlerts3.name;
    const input = `Input : ${JSON.stringify([...inputAlert2DTOs])}`;
    const createAlertObjs: CreateAlertDto[] = [];
    const savedTelemetryAlerts: Alert[] = [];
    this.logger.debug(`${this.serviceName} : ${fnName} : Start`);
    this.logger.debug(`${this.serviceName} : ${fnName} : Input : ${input}`);

    const directDeviceModelIDs: Set<string> = new Set<string>();
    const passthruDeviceModelIDs: Set<string> = new Set<string>();
    const directDeviceAlertIDs: Set<string> = new Set<string>();
    const passthruDeviceAlertIDs: Set<string> = new Set<string>();
    const deviceModelIDs: Set<string> = new Set<string>();
    const deviceAlertIDs: Set<string> = new Set<string>();

    this.logger.debug("InputAlerts", inputAlert2DTOs);
    for (const inputAlert2Dto of inputAlert2DTOs) {

      if (
        inputAlert2Dto.passthruDeviceId &&
        inputAlert2Dto.passthruDeviceModelId
      ) {
        this.logger.debug("in for if");
        deviceModelIDs.add(inputAlert2Dto.passthruDeviceModelId);
        deviceAlertIDs.add(inputAlert2Dto.alertId!);
        /* passthruDeviceModelIDs.add(inputAlert2Dto.passthruDeviceModelId);
        passthruDeviceAlertIDs.add(inputAlert2Dto.alertId!); */
      } else {
        this.logger.debug("in for else");
        deviceModelIDs.add(inputAlert2Dto.deviceModelId!);
        deviceAlertIDs.add(inputAlert2Dto.alertId!);
        /* directDeviceModelIDs.add(inputAlert2Dto.deviceModelId!);
        directDeviceAlertIDs.add(inputAlert2Dto.alertId!); */
      }
    }
    /* directDeviceModelIDs.forEach((dvcMdlId) => deviceModelIDs.add(dvcMdlId));
    passthruDeviceModelIDs.forEach((passthruDvcMdlId) =>
      deviceModelIDs.add(passthruDvcMdlId),
    ); */
    this.logger.debug(
      `${fnName} : No of device model IDs : ${deviceModelIDs.size}`,
    );
    this.logger.debug(
      `${fnName} : No of device alert IDs : ${deviceAlertIDs.size}`,
    );
    // 
    /* deviceModelIDs.add(...directDeviceModelIDs, ...passthruDeviceModelIDs);
    deviceAlertIDs.add(...directDeviceAlertIDs, ...passthruDeviceAlertIDs); */
    if (!_.isEmpty(deviceModelIDs) && !_.isEmpty(deviceAlertIDs)) {
      const searchObject: FindDeviceModelAlertByMultipleIDs = {
        csvAlertIDs: Array.from(deviceAlertIDs).join(','),
        csvDeviceModelIDs: Array.from(deviceModelIDs).join(','),
      };
      this.logger.debug(
        'Find master alerts only using device : search object : ' +
        JSON.stringify(searchObject),
      );
      this.httpService.axiosRef.defaults.headers.common['Authorization'] =
        getTokenString(token);
      const deviceModelWithAlertsUrl = new URL(
        DEVICE_MODEL_WITH_ALERTS_URL,
        this.baseURL,
      );
      const deviceModelAlertResp = await firstValueFrom(
        this.httpService.get<DeviceModel[]>(deviceModelWithAlertsUrl.href, {
          params: searchObject,
        }),
      );
      const dvcMdlWthAlrts: DeviceModel[] = deviceModelAlertResp.data;

      if (!dvcMdlWthAlrts || dvcMdlWthAlrts.length == 0) {
        this.logger.debug(
          `${fnName} : No device model alerts found for direct device models`,
        );
      } else {
        this.logger.debug(
          `Received Device model with alerts : ${JSON.stringify([
            ...dvcMdlWthAlrts,
          ])}`,
        );
        const alertsByDeviceModel = new Map<string, AlertMaster>();
        for (const deviceModel of dvcMdlWthAlrts) {
          if (
            deviceModel.alertMasterIdentifiers &&
            deviceModel.alertMasterIdentifiers.length > 0
          ) {
            for (const alertMasterIdentifier of deviceModel.alertMasterIdentifiers) {
              this.logger.debug(
                `${fnName} : Found alert master identifier for device model ${deviceModel.id
                } : ${JSON.stringify(alertMasterIdentifier)}`,
              );
              if (
                alertMasterIdentifier.alertMasterRecs &&
                alertMasterIdentifier.alertMasterRecs.length > 0
              ) {
                this.logger.debug(
                  `${fnName} : Found ${alertMasterIdentifier.alertMasterRecs.length} alerts for device model ${deviceModel.id}`,
                );
                for (const alert of alertMasterIdentifier.alertMasterRecs) {
                  const key =
                    deviceModel.id +
                    KEY_SEPARATOR +
                    alert.alertId +
                    KEY_SEPARATOR +
                    alert.passthru;
                  alertsByDeviceModel.set(key, alert);
                }
              } else {
                this.logger.debug(
                  `${fnName} : No alerts found for device model ${deviceModel.id} and alert master identifier ${alertMasterIdentifier.id}`,
                );
              }
            }
          } else {
            this.logger.debug(
              `No alert master identifiers for ${deviceModel.id}`,
            );
          }
        }
        for (const [key, alert] of alertsByDeviceModel.entries()) {
          this.logger.debug(
            `${fnName} : alertsByDeviceModel Found alert for key ${key} : ${JSON.stringify(
              alert,
            )}`,
          );
        }
        //
        this.logger.debug("inputalert", inputAlert2DTOs);
        for (const inputAlertDTO of inputAlert2DTOs) {
          this.logger.debug(
            `Passthru device model id : ${inputAlertDTO.passthruDeviceModelId}, Device model id : ${inputAlertDTO.deviceModelId}`,
          );
          const dMId =
            inputAlertDTO.passthruDeviceModelId ?? inputAlertDTO.deviceModelId;
          this.logger.debug(`dMId : ${dMId}`);
          const key =
            dMId +
            KEY_SEPARATOR +
            inputAlertDTO.alertId +
            KEY_SEPARATOR +
            (inputAlertDTO.passthruDeviceId ? true : false);
          this.logger.debug(
            `${fnName} : createAlertKey : ${key} for inputAlertDTO : ${JSON.stringify(
              inputAlertDTO,
            )}`,
          );
          this.logger.debug(
            `Alert master level is : ${alertsByDeviceModel.get(key)?.alertLevel
            }`,
          );
          const createAlertObj = CreateAlertDto.createFromInputAlert2DTO(
            inputAlertDTO,
            alertsByDeviceModel.get(key),
          );
          // 
          this.logger.debug(
            `${fnName} : createAlertObj level is : ${createAlertObj.alertLevel}`,
          );
          createAlertObjs.push(createAlertObj);
        }
      }
      // this.logger.debug(createAlertObjs);
      if (!_.isEmpty(createAlertObjs)) {
        this.logger.debug(
          `${fnName} : No of create alert objects : ${createAlertObjs.length}`,
        );
        const createdTelemetryAlerts = await this.alertService.createBulk3(
          createAlertObjs,
        );
        const createCurrentOpenAlerts =
          await this.currentOpenAlertService.createBulk3(createAlertObjs);
        savedTelemetryAlerts.push(...createdTelemetryAlerts);
        return savedTelemetryAlerts;
      }
    }
  }

  // async manageAlerts(
  //   assetID: string,
  //   csvVirtualDeviceIDs: string,
  //   arrivedAlerts: InputAlertDto[],
  //   closeDateTime?: number,
  // ) {
  //   const fnName = this.manageAlerts.name;

  //   const createdAlerts: Alert[] = [];
  //   const toBeCreatedAlerts: InputAlertDto[] = [];

  //   const toBeDeletedCurrOpenAlerts: CurrentOpenAlert[] = [];
  //   const deletedCurrentOpenAlerts: CurrentOpenAlert[] = [];

  //   const closedAlerts: Alert[] = [];

  //   const toBeIncrementedCOAlerts: CurrentOpenAlert[] = [];
  //   const incrementedCurrentOpenAlerts: CurrentOpenAlert[] = [];
  //   const incrementdAlerts: Alert[] = [];

  //   const searchObj: FindCurrentOpenAlertDto = {
  //     virtualDeviceId: In(csvVirtualDeviceIDs.split(',')),
  //     assetId: assetID,
  //   };

  //   const currentOpenAlerts = await this.currentOpenAlertService.findAll(
  //     searchObj,
  //   );

  //   if (_.isEmpty(arrivedAlerts)) {
  //     this.logger.debug(`${fnName} : No arrived alerts`);

  //     if (!_.isEmpty(currentOpenAlerts)) {
  //       const { deletedCOAlerts, clsdAlerts } = await this.closeAlerts(
  //         currentOpenAlerts,
  //         closeDateTime,
  //       );
  //       deletedCurrentOpenAlerts.push(...deletedCOAlerts);
  //       closedAlerts.push(...clsdAlerts);
  //     } else {
  //       this.logger.debug(
  //         `${fnName} :  No ArrivedAlerts and CurrentOpenAlerts`,
  //       );
  //     }
  //   } else {
  //     this.logger.debug(
  //       `${fnName} : No of arrived alerts : ${arrivedAlerts.length}`,
  //     );
  //     const arrivedAlertMap = new Map(
  //       arrivedAlerts.map((arrivedAlert) => [
  //         arrivedAlert.assetId +
  //         KEY_SEPARATOR +
  //         (arrivedAlert.virtualDeviceId ??
  //           arrivedAlert.virtualDevice?.id ??
  //           '') +
  //         KEY_SEPARATOR +
  //         (arrivedAlert.sourceAttribute ?? '') +
  //         /* (arrivedAlert.metricsAttributeId ??
  //           arrivedAlert.metricsAttribute?.id ??
  //           '') + */
  //         KEY_SEPARATOR +
  //         arrivedAlert.alertId,
  //         arrivedAlert,
  //       ]),
  //     );

  //     if (!_.isEmpty(currentOpenAlerts)) {
  //       this.logger.debug(`${fnName} : in currentOpenAlert`);

  //       for (const currOpenAlert of currentOpenAlerts) {
  //         const currentOpenAlertObj = new CurrentOpenAlert(currOpenAlert);
  //         const key = currentOpenAlertObj.getKey();

  //         const matchingAlert = arrivedAlertMap.get(key);

  //         if (matchingAlert) {
  //           this.logger.debug(`${fnName} : matched`);
  //           currentOpenAlertObj.alertCount++;
  //           toBeIncrementedCOAlerts.push(currentOpenAlertObj);
  //           arrivedAlertMap.delete(key);
  //         } else {
  //           this.logger.debug(`${fnName} : not matched`);
  //           toBeDeletedCurrOpenAlerts.push(currentOpenAlertObj);
  //         }
  //       }
  //       if (!_.isEmpty(toBeDeletedCurrOpenAlerts)) {
  //         const { deletedCOAlerts, clsdAlerts } = await this.closeAlerts(
  //           toBeDeletedCurrOpenAlerts,
  //           closeDateTime,
  //         );
  //         deletedCurrentOpenAlerts.push(...deletedCOAlerts);
  //         closedAlerts.push(...clsdAlerts);
  //       }

  //       if (!_.isEmpty(toBeIncrementedCOAlerts)) {
  //         this.logger.debug(`${fnName} : incremented currOAlert array`);
  //         const incrmntdCOAlerts: CurrentOpenAlert[] =
  //           await this.currentOpenAlertService.save(toBeIncrementedCOAlerts);
  //         incrementedCurrentOpenAlerts.push(...incrmntdCOAlerts);
  //         const findAlertDTOs = this.findOpenAlertObjsFromCrntOpnAlrts(
  //           toBeIncrementedCOAlerts,
  //         );
  //         const toBeIncrementedAlerts = await this.alertService.findAll(
  //           findAlertDTOs,
  //         );
  //         for (const alert of toBeIncrementedAlerts) {
  //           alert.alertCount++;
  //         }
  //         const incrmntdAlerts: Alert[] = await this.alertService.save(
  //           toBeIncrementedAlerts,
  //         );
  //         incrementdAlerts.push(...incrmntdAlerts);
  //       }
  //     }

  //     this.logger.debug(`${fnName} : Outside currentOpenAlerts`);

  //     toBeCreatedAlerts.push(...arrivedAlertMap.values());

  //     const crtdAlerts: Alert[] = await this.saveTelemetryAlerts2(
  //       toBeCreatedAlerts,
  //     );

  //     createdAlerts.push(...crtdAlerts);
  //   }

  //   // Return the result
  //   return {
  //     createdAlerts: createdAlerts,
  //     //deletedCurrentOpenAlerts: deletedCurrentOpenAlerts,
  //     closedAlerts: closedAlerts,
  //     //incrementedCurrentOpenAlerts: incrementedCurrentOpenAlerts,
  //     incrementedAlerts: incrementdAlerts,
  //   };
  // }


  private sirShownWorking = 5;
  // async processMaxTelemetryAggregation(
  //   inputDate: string,
  //   metricsFrequency: MetricsFrequency,
  //   isCalculationForced: boolean
  // ) {
  //   this.logger.debug("in processMaxTelemetryAggregation service");
  //   const periodTMPyld =
  //     await this.periodTelemetryPayloadAuditService.findPeriodTelemetryRecordSetA(
  //       inputDate,
  //       metricsFrequency,
  //       isCalculationForced,
  //     );

  //   const telemetryPyld =
  //     await this.telemetryPayloadService.findTelemetryPayloadRecordSetB(
  //       periodTMPyld,
  //     );

  //   const recordSetC = await this.virtualDeviceService.findRecordSetC(periodTMPyld);

  //   const periodTMWthMaxMeasure = await this.findMaxTelemetryValueRecordSetD(periodTMPyld);

  //   const maxMeasureMtrcs = await this.prepareRecordSetE(telemetryPyld, periodTMWthMaxMeasure);
  //   this.logger.debug("SetE", maxMeasureMtrcs);

  //   const recordSetF = await this.prepareRecordSetF(maxMeasureMtrcs, recordSetC);

  //   const recordSetG = await this.prepareRecordSetG(recordSetF);

  //   return {
  //     // periodTMPyld,
  //     // telemetryPyld,
  //     // periodTMWthMaxMeasure,
  //     maxMeasureMtrcs,
  //     recordSetG
  //   };
  // }

  async processMaxTelemetryAggregation(
    inputDate: string,
    metricsFrequency: MetricsFrequency,
    isCalculationForced: boolean
  ) {
    const fnName = this.processMaxTelemetryAggregation.name;
    const input = `Input: InputDate : ${inputDate}, MetricsFrequency: ${metricsFrequency}, IsCalculationForced: ${isCalculationForced}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const periodTMPylds = await this.periodTelemetryPayloadAuditService.findPeriodTelemetryPayloads(inputDate, metricsFrequency, isCalculationForced);

    const telemetryPylds = await this.telemetryPayloadService.findTelemetryPayloads(periodTMPylds);

    const parentVDs = await this.virtualDeviceService.findParentVirtualDevices(periodTMPylds);

    const periodTMWthMaxMeasure = await this.findMaxPeriodTelemetryPayloadValue(periodTMPylds);

    const maxMeasureMtrcsMap = await this.findMaxTelmetryPayload(telemetryPylds, periodTMWthMaxMeasure);

    const aggregationInputRecords = await this.recordsForAggregation(parentVDs, maxMeasureMtrcsMap);

    const aggregatedParentTelemetryPayloads = await this.aggregatedRecords(aggregationInputRecords);

    return {
      aggregatedParentTelemetryPayloads
    };
  }

  async findMaxPeriodTelemetryPayloadValue(
    periodTMPylds: Record<string, PeriodTelemetryPayloadAudit[]>,
  ) {
    const result = Object.values(periodTMPylds)
      .map((records) =>
        _.maxBy(
          records,
          (record) => Number(record.metric?.measure ?? 0),
        ),
      )
      .filter(
        (record): record is PeriodTelemetryPayloadAudit => Boolean(record),
      );

    return result;
  }

  async findMaxTelmetryPayload(
    telemetryPylds: TelemetryPayload[],
    periodTMPylds: PeriodTelemetryPayloadAudit[]
  ) {
    const periodTeleMPyldsMap = new Map<string, PeriodTelemetryPayloadAudit>();

    for (const periodTeleMPyld of periodTMPylds) {
      const key = periodTeleMPyld.getTelemetryKey();
      periodTeleMPyldsMap.set(key, periodTeleMPyld);
    }

    const maxMeasureMtrcsMap = new Map<string, TelemetryPayload | PeriodTelemetryPayloadAudit>();

    for (const telemetryPyld of telemetryPylds) {
      const key = telemetryPyld.getTelemetryKey();
      const periodTeleMPyld = periodTeleMPyldsMap.get(key);

      if (!periodTeleMPyld) {
        maxMeasureMtrcsMap.set(key, telemetryPyld);
      }
      else {
        const teleMPValue = Number(telemetryPyld.metric?.measure ?? 0);
        const periodTeleMPValue = Number(periodTeleMPyld.metric?.measure ?? 0);

        if (periodTeleMPValue > teleMPValue) {
          this.logger.debug(
            `PeriodTelemetryPayload value ${periodTeleMPValue} is greater than TelemetryPayload value ${teleMPValue}`,
          );
          maxMeasureMtrcsMap.set(key, periodTeleMPyld);
        } else {
          this.logger.debug(
            `TelemetryPayload value ${teleMPValue} is greater than or equal to PeriodTelemetryPayload value ${periodTeleMPValue}`,
          );
          maxMeasureMtrcsMap.set(key, telemetryPyld);
        }
      }
    }

    for (const periodTeleMPyld of periodTMPylds) {
      const key = periodTeleMPyld.getTelemetryKey();

      if (maxMeasureMtrcsMap.has(key) == false) {
        maxMeasureMtrcsMap.set(key, periodTeleMPyld);
      }
    }

    return Array.from(maxMeasureMtrcsMap.values());
  }

  async recordsForAggregation(
    parentVDs: VirtualDevice[],
    maxMeasureMtrcs: (TelemetryPayload | PeriodTelemetryPayloadAudit)[]
  ) {
    const result = [];

    for (const parentVD of parentVDs) {

      const childVDs = parentVD.children ?? [];

      if (childVDs.length === 0) {
        this.logger.debug('There is not any children for parentId:', parentVD.id);
        continue;
      }

      const metricToAggKeyMap =
        new Map<string, Map<string, (TelemetryPayload | PeriodTelemetryPayloadAudit)[]>>();
      // metric -> (freq:period -> records)

      for (const child of childVDs) {

        for (const record of maxMeasureMtrcs) {

          if (record.assetId !== parentVD.assetId || record.virtualDeviceId !== child.id) {
            this.logger.debug("Not matching payload");
            continue;
          }

          const metricId = record.metric.metricsAttributeId;
          const aggregationKey = record.metric.frequency + KEY_SEPARATOR + record.metric?.txnCapturePeriod;

          if (metricToAggKeyMap.has(metricId) == false) {
            metricToAggKeyMap.set(metricId, new Map());
          }

          const aggKeyMap = metricToAggKeyMap.get(metricId)!;
          const existing = aggKeyMap.get(aggregationKey);

          if (existing) {
            existing.push(record);
          } else {
            aggKeyMap.set(aggregationKey, [record]);
          }
        }
      }

      for (const vdGroup of parentVD.virtualDeviceGroups ?? []) {

        const group = vdGroup.group;

        for (const groupAgg of group?.groupMetricsAttributeAggregations ?? []) {

          const metricsAgg = groupAgg.metricsAttributeAggregation;
          const configuredMetricId = metricsAgg.metricsAttributeId;
          const aggregation = metricsAgg.aggregation;

          const aggKeyMap = metricToAggKeyMap.get(configuredMetricId);

          if (!aggKeyMap || aggKeyMap.size === 0) {
            this.logger.debug(`No mathcing record for: ${configuredMetricId}`);
            continue;
          }

          for (const telemetryRecords of aggKeyMap.values()) {

            if (!telemetryRecords.length) continue;

            const firstRecord = telemetryRecords[0];

            result.push({
              assetId: parentVD.assetId,
              virtualDeviceId: parentVD.id,
              groupId: vdGroup.groupId,
              metricId: configuredMetricId,
              frequency: firstRecord.metric.frequency,
              txnCapturePeriod: firstRecord.metric?.txnCapturePeriod,
              aggregation,
              telemetryRecords,
            });
          }
        }
      }
    }
    return result;
  }

  async aggregatedRecords(
    aggregationInputRecords: any[],
  ) {

    const result: CreateTelemetryPayloadDto[] = [];

    for (const record of aggregationInputRecords) {
      const values =
        record.telemetryRecords.map(
          (r: any) => Number(r.metric?.measure ?? 0),
        );

      if (values.length == 0) {
        continue;
      }
      // this.logger.debug("values", values);
      this.logger.debug(`values for ${record.virtualDeviceId}: asset ${record.assetId}`, values);

      let aggregatedValue = 0;

      this.logger.debug("aggregation strategy", record.aggregation);

      switch (record.aggregation) {
        case 'sum':
          aggregatedValue = _.sum(values);
          break;

        case 'avg':
          aggregatedValue = _.sum(values) / values.length;
          break;

        default:
          break;
      }

      aggregatedValue = Number(
        aggregatedValue.toFixed(2),
      );

      result.push({
        assetId: record.assetId,
        virtualDeviceId: record.virtualDeviceId,
        metric: {
          metricsAttributeId: record.metricId,
          frequency: record.frequency,
          txnCapturePeriod: record.txnCapturePeriod,
          txnCaptureTime: new Date(),
          measure: String(aggregatedValue),
        },
      } as CreateTelemetryPayloadDto);
    }
    return result;
  }














  // async findMaxTelmetryPayload(
  //   telemetryPylds: TelemetryPayload[],
  //   periodTeleMPylds: {
  //     parentMaxRecord: PeriodTelemetryPayloadAudit;
  //   }[],
  // ) {

  //   const periodTeleMPyldsMap = new Map<string, PeriodTelemetryPayloadAudit>();

  //   for (const periodTeleMPyld of periodTeleMPylds) {
  //     const maxRecord = periodTeleMPyld.parentMaxRecord;
  //     const key = maxRecord.getTelemetryKey();

  //     periodTeleMPyldsMap.set(key, maxRecord);
  //   }

  //   const maxMeasureMtrcsMap = new Map<string, any>();

  //   for (const telemetryPyld of telemetryPylds) {

  //     const key = telemetryPyld.getTelemetryKey();
  //     const periodTeleMPyld = periodTeleMPyldsMap.get(key);

  //     // No max record 
  //     if (!periodTeleMPyld) {
  //       maxMeasureMtrcsMap.set(
  //         key,
  //         telemetryPyld,
  //       );
  //       continue;
  //     }

  //     const teleMPValue = Number(telemetryPyld.metric?.measure ?? 0);
  //     const periodTeleMPValue = Number(periodTeleMPyld.metric?.measure ?? 0);

  //     if (periodTeleMPValue > teleMPValue) {
  //       this.logger.debug(
  //         `PeriodTelemetryPayload value ${periodTeleMPValue} is greater than TelemetryPayload value ${teleMPValue} for key ${key}`,
  //       );
  //       maxMeasureMtrcsMap.set(key, periodTeleMPyld);
  //     }
  //     else {
  //       this.logger.debug(
  //         `TelemetryPayload value ${teleMPValue} is greater than or equal to PeriodTelemetryPayload value ${periodTeleMPValue} for key ${key}`,
  //       );
  //       maxMeasureMtrcsMap.set(key, telemetryPyld);
  //     }
  //   }

  //   for (const periodTeleMPyld of periodTeleMPylds) {
  //     const maxRecord = periodTeleMPyld.parentMaxRecord;
  //     const key = maxRecord.getTelemetryKey();

  //     if (!maxMeasureMtrcsMap.has(key)) {
  //       maxMeasureMtrcsMap.set(key, maxRecord);
  //     }
  //   }
  //   return Array.from(maxMeasureMtrcsMap.values());
  // }


  //   async findMaxTelmetryPayload(
  //   telemetryPylds: TelemetryPayload[],
  //   periodTMPylds: PeriodTelemetryPayloadAudit[],
  // ) {

  //   const periodTeleMPyldsMap =
  //     new Map<string, PeriodTelemetryPayloadAudit>();

  //   for (const periodTeleMPyld of periodTMPylds) {

  //     const key =
  //       periodTeleMPyld.getTelemetryKey();

  //     periodTeleMPyldsMap.set(
  //       key,
  //       periodTeleMPyld,
  //     );
  //   }

  //   const maxMeasureMtrcsMap =
  //     new Map<
  //       string,
  //       TelemetryPayload |
  //       PeriodTelemetryPayloadAudit
  //     >();

  //   for (const telemetryPyld of telemetryPylds) {

  //     const key =
  //       telemetryPyld.getTelemetryKey();

  //     const periodTeleMPyld =
  //       periodTeleMPyldsMap.get(key);

  //     if (!periodTeleMPyld) {

  //       maxMeasureMtrcsMap.set(
  //         key,
  //         telemetryPyld,
  //       );

  //       continue;
  //     }

  //     const teleMPValue =
  //       Number(
  //         telemetryPyld.metric?.measure ?? 0,
  //       );

  //     const periodTeleMPValue =
  //       Number(
  //         periodTeleMPyld.metric?.measure ?? 0,
  //       );

  //     maxMeasureMtrcsMap.set(
  //       key,
  //       periodTeleMPValue > teleMPValue
  //         ? periodTeleMPyld
  //         : telemetryPyld,
  //     );
  //   }

  //   /**
  //    * include remaining period records
  //    */
  //   for (const periodTeleMPyld of periodTMPylds) {

  //     const key =
  //       periodTeleMPyld.getTelemetryKey();

  //     if (!maxMeasureMtrcsMap.has(key)) {

  //       maxMeasureMtrcsMap.set(
  //         key,
  //         periodTeleMPyld,
  //       );
  //     }
  //   }

  //   return maxMeasureMtrcsMap;
  // }

  async findMaxPeriodTelemetryPayloadValuez(
    parentVDs: VirtualDevice[],
    periodTMPyld: Record<string, PeriodTelemetryPayloadAudit[]>,
  ) {
    const result: ParentAggregationResult[] = [];

    for (const parentVD of parentVDs) {
      const childVDs = parentVD.children ?? [];
      if (!childVDs.length) continue;

      for (const vdGroup of parentVD.virtualDeviceGroups ?? []) {
        const group = vdGroup.group;

        for (const groupAgg of group?.groupMetricsAttributeAggregations ?? []) {

          const metricsAgg = groupAgg.metricsAttributeAggregation;
          const configuredMetricId = metricsAgg.metricsAttributeId;
          const frequency = metricsAgg.metricsAttribute.frequency;

          for (const child of childVDs) {
            for (const [key, records] of Object.entries(periodTMPyld)) {

              if (!records?.length) continue;

              const first = records[0];
              const metric = first.metric;

              if (
                first.assetId !== child.assetId ||
                first.virtualDeviceId !== child.id ||
                metric?.metricsAttributeId !== configuredMetricId ||
                metric?.frequency !== frequency
              ) {
                continue;
              }

              const txnCapturePeriod = metric?.txnCapturePeriod;

              const childWiseMaxRecords = this.findMaxRecordsPerChildVD(
                parentVD,
                configuredMetricId,
                frequency,
                txnCapturePeriod!,
                records,
              );

              if (!childWiseMaxRecords.length) continue;

              const parentMaxRecord = _.maxBy(
                childWiseMaxRecords,
                (r) => Number(r?.metric?.measure ?? 0),
              );

              if (!parentMaxRecord) continue;

              result.push({
                assetId: parentVD.assetId,
                virtualDeviceId: parentVD.id,
                groupId: vdGroup.groupId,
                metricId: configuredMetricId,
                frequency,
                txnCapturePeriod,
                aggregation: metricsAgg.aggregation,
                childWiseMaxRecords,
                parentMaxRecord,
              });
            }
          }
        }
      }
    }

    return result;
  }

  async findMaxPeriodTelemetryPayloadValueWorking(
    parentVDs: VirtualDevice[],
    periodTMPyld: Record<string, PeriodTelemetryPayloadAudit[]>,
  ) {
    const result: ParentAggregationResult[] = [];

    const allRecords = Object.values(periodTMPyld).flat();

    const telemetryGroups = _.groupBy(
      allRecords,
      (record) =>
        [
          record.assetId,
          record.metric?.metricsAttributeId,
          record.metric?.frequency,
          record.metric?.txnCapturePeriod,
        ].join(SEPARATOR),
    );

    for (const parentVD of parentVDs) {

      for (const vdGroup of parentVD.virtualDeviceGroups ?? []) {

        const group = vdGroup.group;
        const aggregations = group?.groupMetricsAttributeAggregations ?? [];

        for (const groupAgg of aggregations) {

          const metricsAgg = groupAgg.metricsAttributeAggregation;
          const configuredMetricId = metricsAgg.metricsAttributeId;

          for (const telemetryRecords of Object.values(telemetryGroups)) {

            if (telemetryRecords.length == 0) {
              this.logger.debug('No telemetry records found');
              continue;
            }

            const firstRecord = telemetryRecords[0];

            const metricId = firstRecord.metric?.metricsAttributeId;
            const frequency = firstRecord.metric?.frequency;
            const txnCapturePeriod = firstRecord.metric?.txnCapturePeriod;

            if (configuredMetricId !== metricId) {
              continue;
            }

            const childWiseMaxRecords = this.findMaxRecordsPerChildVD(
              parentVD,
              metricId!,
              frequency!,
              txnCapturePeriod!,
              telemetryRecords,
            );

            if (childWiseMaxRecords.length == 0) {
              this.logger.debug("There is not any matching records for: ", parentVD);
              continue;
            }

            const parentMaxRecord = _.maxBy(
              childWiseMaxRecords,
              (record) => Number(record!.metric?.measure ?? 0),
            );

            if (!parentMaxRecord) {
              continue;
            }

            result.push({
              assetId: parentVD.assetId,
              virtualDeviceId: parentVD.id,
              groupId: vdGroup.groupId,
              metricId,
              frequency,
              txnCapturePeriod,
              aggregation: metricsAgg.aggregation,
              childWiseMaxRecords,
              parentMaxRecord,
            });
          }
        }
      }
    }
    return result;
  }

  async recordsForAggregationcld(
    parentVDs: VirtualDevice[],
    maxMeasureMtrcs: (TelemetryPayload | PeriodTelemetryPayloadAudit)[]
  ) {
    const result = [];

    const aggregationLookupMap = _.groupBy(
      maxMeasureMtrcs,
      (record) =>
        record.assetId +
        KEY_SEPARATOR +
        record.virtualDeviceId +
        KEY_SEPARATOR +
        record.metric?.metricsAttributeId,
    );

    for (const parentVD of parentVDs) {

      const childVDs = parentVD.children ?? [];

      if (childVDs.length === 0) {
        this.logger.debug('There is not any children for parentId:', parentVD.id);
        continue;
      }

      const metricToAggKeyMap =
        new Map<string, Map<string, (TelemetryPayload | PeriodTelemetryPayloadAudit)[]>>();

      for (const child of childVDs) {

        for (const lookupKey of Object.keys(aggregationLookupMap)) {
          const [assetId, virtualDeviceId, metricId] = lookupKey.split(KEY_SEPARATOR);

          if (assetId !== parentVD.assetId || virtualDeviceId !== child.id) {
            this.logger.debug('Not matching');
            continue;
          }

          if (metricToAggKeyMap.has(metricId) == false) {
            metricToAggKeyMap.set(metricId, new Map());
          }

          const aggKeyMap = metricToAggKeyMap.get(metricId)!;
          const records = aggregationLookupMap[lookupKey];

          for (const record of records) {
            const aggregationKey =
              record.metric.frequency +
              KEY_SEPARATOR +
              record.metric?.txnCapturePeriod;

            const existing = aggKeyMap.get(aggregationKey);
            if (existing) {
              existing.push(record);
            } else {
              aggKeyMap.set(aggregationKey, [record]);
            }
          }
        }
      }

      for (const vdGroup of parentVD.virtualDeviceGroups ?? []) {

        const group = vdGroup.group;

        for (const groupAgg of group?.groupMetricsAttributeAggregations ?? []) {

          const metricsAgg = groupAgg.metricsAttributeAggregation;
          const configuredMetricId = metricsAgg.metricsAttributeId;
          const aggregation = metricsAgg.aggregation;

          const aggKeyMap = metricToAggKeyMap.get(configuredMetricId);

          if (!aggKeyMap || aggKeyMap.size === 0) {
            this.logger.debug("empty map");
            continue;
          }

          for (const telemetryRecords of aggKeyMap.values()) {

            if (!telemetryRecords.length) continue;

            const firstRecord = telemetryRecords[0];

            result.push({
              assetId: parentVD.assetId,
              virtualDeviceId: parentVD.id,
              groupId: vdGroup.groupId,
              metricId: configuredMetricId,
              frequency: firstRecord.metric.frequency,
              txnCapturePeriod: firstRecord.metric?.txnCapturePeriod,
              aggregation,
              telemetryRecords,
            });
          }
        }
      }
    }

    return result;
  }

  async recordsForAggregationWorki(
    parentVDs: VirtualDevice[],
    maxMeasureMtrcs: (TelemetryPayload | PeriodTelemetryPayloadAudit)[]
  ) {
    const result = [];

    const aggregationLookupMap = _.groupBy(
      maxMeasureMtrcs,
      (record) =>
        record.assetId +
        KEY_SEPARATOR +
        record.virtualDeviceId +
        KEY_SEPARATOR +
        record.metric?.metricsAttributeId,
    );

    for (const parentVD of parentVDs) {

      const childVDs = parentVD.children ?? [];
      console.log(childVDs.length);

      if (childVDs.length == 0) {
        this.logger.debug('There is not any children for parentId:', parentVD.id);
        continue;
      }

      for (const vdGroup of parentVD.virtualDeviceGroups ?? []) {

        const group = vdGroup.group;

        for (const groupAgg of group?.groupMetricsAttributeAggregations ?? []) {

          const metricsAgg = groupAgg.metricsAttributeAggregation;
          const configuredMetricId = metricsAgg.metricsAttributeId;
          const aggregation = metricsAgg.aggregation;

          const parentAggregationMap =
            new Map<string, (TelemetryPayload | PeriodTelemetryPayloadAudit)[]>();

          for (const child of childVDs) {

            const lookupKey =
              parentVD.assetId +
              KEY_SEPARATOR +
              child.id +
              KEY_SEPARATOR +
              configuredMetricId;

            const matchedRecords = aggregationLookupMap[lookupKey] ?? [];

            for (const record of matchedRecords) {

              const aggregationKey = record.metric.frequency + KEY_SEPARATOR + record.metric?.txnCapturePeriod;
              const existing = parentAggregationMap.get(aggregationKey);

              if (existing) {
                existing.push(record);
              } else {
                parentAggregationMap.set(
                  aggregationKey,
                  [record],
                );
              }
            }
          }

          for (const telemetryRecords of parentAggregationMap.values()) {

            if (!telemetryRecords.length) {
              continue;
            }

            const firstRecord = telemetryRecords[0];

            result.push({
              assetId: parentVD.assetId,
              virtualDeviceId: parentVD.id,
              groupId: vdGroup.groupId,
              metricId: configuredMetricId,
              frequency: firstRecord.metric.frequency,
              txnCapturePeriod: firstRecord.metric?.txnCapturePeriod,
              aggregation,
              telemetryRecords,
            });
          }
        }
      }
    }
    // console.log(result)
    return result;
  }

  async recordsForAggregation1(
    parentVDs: VirtualDevice[],
    maxMeasureMtrcsMap: Map<string, TelemetryPayload | PeriodTelemetryPayloadAudit>,
  ) {

    const result = [];

    for (const parentVD of parentVDs) {

      const childVDs = parentVD.children ?? [];

      if (!childVDs.length) {
        continue;
      }

      for (const vdGroup of parentVD.virtualDeviceGroups ?? []) {

        const group = vdGroup.group;

        for (const groupAgg of group?.groupMetricsAttributeAggregations ?? []) {

          const metricsAgg = groupAgg.metricsAttributeAggregation;
          const configuredMetricId = metricsAgg.metricsAttributeId;
          const aggregation = metricsAgg.aggregation;

          const parentAggregationMap =
            new Map<string, (TelemetryPayload | PeriodTelemetryPayloadAudit)[]>();

          for (const child of childVDs) {

            for (const record of maxMeasureMtrcsMap.values()) {

              const metric = record.metric;

              if (
                record.assetId !== child.assetId ||
                record.virtualDeviceId !== child.id ||
                metric?.metricsAttributeId !== configuredMetricId
              ) {
                continue;
              }

              const aggregationKey = metric?.frequency + KEY_SEPARATOR + metric?.txnCapturePeriod;
              const existing = parentAggregationMap.get(aggregationKey);

              if (existing) {
                existing.push(record);
              } else {
                parentAggregationMap.set(
                  aggregationKey,
                  [record],
                );
              }
            }
          }

          for (const telemetryRecords of parentAggregationMap.values()) {

            if (telemetryRecords.length == 0) {
              this.logger.debug("Empty telemetry Records");
              continue;
            }

            const firstRecord = telemetryRecords[0];

            result.push({
              assetId: parentVD.assetId,
              virtualDeviceId: parentVD.id,
              groupId: vdGroup.groupId,
              metricId: configuredMetricId,
              frequency: firstRecord.metric?.frequency,
              txnCapturePeriod: firstRecord.metric?.txnCapturePeriod,
              aggregation,
              telemetryRecords,
            });
          }
        }
      }
    }

    return result;
  }

  async recordsForAggregation2(
    parentVDs: VirtualDevice[],
    maxMeasureMtrcs: (TelemetryPayload | PeriodTelemetryPayloadAudit)[],
  ) {

    const result = [];

    // Fast lookup
    const telemetryMap = _.groupBy(
      maxMeasureMtrcs,
      (record) => record.getTelemetryKey()
    );

    for (const parentVD of parentVDs) {

      const childVDs = parentVD.children ?? [];

      if (!childVDs.length) {
        continue;
      }

      for (const vdGroup of parentVD.virtualDeviceGroups ?? []) {
        const group = vdGroup.group;

        for (const groupAgg of group?.groupMetricsAttributeAggregations ?? []) {

          const metricsAgg = groupAgg.metricsAttributeAggregation;
          const configuredMetricId = metricsAgg.metricsAttributeId;
          const aggregation = metricsAgg.aggregation;

          const telemetryRecords = [];

          for (const child of childVDs) {

            for (const records of Object.values(telemetryMap)) {

              const first = records[0];

              if (!first) {
                continue;
              }

              const metric = first.metric;

              if (
                first.assetId === child.assetId &&
                first.virtualDeviceId === child.id &&
                metric?.metricsAttributeId === configuredMetricId
              ) {
                telemetryRecords.push(...records);
              }
            }
          }

          if (!telemetryRecords.length) {
            continue;
          }

          const firstRecord = telemetryRecords[0];

          result.push({
            assetId: parentVD.assetId,
            virtualDeviceId: parentVD.id,
            groupId: vdGroup.groupId,
            metricId: configuredMetricId,
            frequency: firstRecord.metric?.frequency,
            txnCapturePeriod: firstRecord.metric?.txnCapturePeriod,
            aggregation,
            telemetryRecords,
          });
        }
      }
    }

    return result;
  }

  async findMaxTelmetryPayloadWorking(
    telemetryPylds: TelemetryPayload[],
    periodTeleMPylds: {
      parentMaxRecord: PeriodTelemetryPayloadAudit;
      childWiseMaxRecords: PeriodTelemetryPayloadAudit[];
    }[],
  ) {
    const periodTeleMPyldsMap = new Map<string, PeriodTelemetryPayloadAudit>();

    for (const periodTeleMPyld of periodTeleMPylds) {
      for (const childRecord of periodTeleMPyld.childWiseMaxRecords) {
        const key = childRecord.getTelemetryKey();
        periodTeleMPyldsMap.set(key, childRecord);
      }
    }

    const maxMeasureMtrcsMap = new Map<string, any>();

    for (const telemetryPyld of telemetryPylds) {
      const key = telemetryPyld.getTelemetryKey();
      const periodTeleMPyld = periodTeleMPyldsMap.get(key);

      if (!periodTeleMPyld) {
        maxMeasureMtrcsMap.set(key, telemetryPyld);
        continue;
      }

      const teleMPValue = Number(telemetryPyld.metric?.measure ?? 0);
      const periodTeleMPValue = Number(periodTeleMPyld.metric?.measure ?? 0);

      if (periodTeleMPValue > teleMPValue) {
        this.logger.debug(
          `PeriodTelemetryPayload value ${periodTeleMPValue} is greater than TelemetryPayload value ${teleMPValue} for key ${key}`,
        );
        maxMeasureMtrcsMap.set(key, periodTeleMPyld);
      } else {
        this.logger.debug(
          `TelemetryPayload value ${teleMPValue} is greater than or equal to PeriodTelemetryPayload value ${periodTeleMPValue} for key ${key}`,
        );
        maxMeasureMtrcsMap.set(key, telemetryPyld);
      }
    }

    for (const periodTeleMPyld of periodTeleMPylds) {
      for (const childRecord of periodTeleMPyld.childWiseMaxRecords) {
        const key = childRecord.getTelemetryKey();
        if (!maxMeasureMtrcsMap.has(key)) {
          maxMeasureMtrcsMap.set(key, childRecord);
        }
      }
    }

    return Array.from(maxMeasureMtrcsMap.values());
  }

  async recordsForAggregationWorking(
    periodTMWthMaxMeasure: {
      assetId: string;
      virtualDeviceId: string;
      groupId: string;
      metricId: string;
      frequency: MetricsFrequency,
      txnCapturePeriod: Date,
      aggregation: string;
      childWiseMaxRecords: PeriodTelemetryPayloadAudit[];
    }[],
    maxMeasureMtrcs: (TelemetryPayload | PeriodTelemetryPayloadAudit)[],
  ) {
    const recordSetEMap = new Map<string, any>();

    for (const record of maxMeasureMtrcs) {
      recordSetEMap.set(
        record.getTelemetryKey(),
        record,
      );
    }

    const result = [];

    for (const record of periodTMWthMaxMeasure) {

      // Replace matched records with updated records from E
      const telemetryRecords =
        // record.childWiseMaxRecords.map(
        record.childWiseMaxRecords.map(
          (rec) => {
            const key = rec.getTelemetryKey();

            return (
              recordSetEMap.get(key) ??
              rec
            );
          },
        );

      result.push({
        assetId: record.assetId,
        virtualDeviceId: record.virtualDeviceId,
        groupId: record.groupId,
        metricId: record.metricId,
        frequency: record.frequency,
        txnCapturePeriod: record.txnCapturePeriod,
        aggregation: record.aggregation,
        telemetryRecords,
      });
    }
    return result;
  }



  private findMaxRecordsPerChildVD(
    parentVD: VirtualDevice,
    metricId: string,
    frequency: MetricsFrequency,
    txnCapturePeriod: Date,
    telemetryRecords: (
      TelemetryPayload |
      PeriodTelemetryPayloadAudit
    )[],
  ) {

    const childrenVDIDs = parentVD.children?.map((child) => child.id) ?? [];

    const matchedRecords = telemetryRecords.filter((record) => {
      const isMatchingMetric = record.metric?.metricsAttributeId === metricId;
      const isMatchingChild = childrenVDIDs.includes(record.virtualDeviceId!,);
      const isMatchingAsset = record.assetId === parentVD.assetId;
      const isMatchingFrequency = record.metric?.frequency === frequency;
      const isMatchingPeriod =
        new Date(record.metric?.txnCapturePeriod!).getTime()
        ===
        new Date(txnCapturePeriod).getTime();

      return (
        isMatchingMetric &&
        isMatchingChild &&
        isMatchingAsset &&
        isMatchingFrequency &&
        isMatchingPeriod
      );
    });

    const groupedByChild = _.groupBy(
      matchedRecords,
      (record) => record.virtualDeviceId,
    );

    return Object.values(groupedByChild)
      .map((records) =>
        _.maxBy(
          records,
          (record) =>
            Number(record.metric?.measure ?? 0),
        ),
      )
      .filter(
        (record,): record is PeriodTelemetryPayloadAudit => Boolean(record),
      );
  }







  // async findMaxTelemetryValueRecordSetDSomeErroroffreqAndPeriod(
  //   parentVDs: VirtualDevice[],
  //   periodTMPyld: Record<
  //     string,
  //     PeriodTelemetryPayloadAudit[]
  //   >,
  // ) {
  //   const result: {
  //     assetId: string;
  //     virtualDeviceId: string;
  //     groupId: string;
  //     metricId: string;
  //     aggregation: string;
  //     matchedRecords: PeriodTelemetryPayloadAudit[];
  //     maxRecord: PeriodTelemetryPayloadAudit;
  //   }[] = [];

  //   const allRecords = Object.values(periodTMPyld).flat();

  //   for (const parentVD of parentVDs) {

  //     for (const vdGroup of parentVD.virtualDeviceGroups ?? []) {
  //       const group = vdGroup.group;
  //       const aggregations = group?.groupMetricsAttributeAggregations ?? [];

  //       for (const groupAgg of aggregations) {
  //         const metricsAgg = groupAgg.metricsAttributeAggregation;
  //         const metricId = metricsAgg.metricsAttributeId;

  //         const matchedRecords =
  //           this.findMatchedTelemetryRecords(
  //             parentVD,
  //             metricId,
  //             allRecords,
  //           );

  //         if (!matchedRecords.length) {
  //           continue;
  //         }

  //         const maxRecord = _.maxBy(
  //           matchedRecords,
  //           (record) => Number(record.metric?.measure ?? 0),
  //         );

  //         if (!maxRecord) {
  //           continue;
  //         }

  //         result.push({
  //           assetId: parentVD.assetId,
  //           virtualDeviceId: parentVD.id,
  //           groupId: vdGroup.groupId,
  //           metricId,
  //           aggregation: metricsAgg.aggregation,
  //           matchedRecords,
  //           maxRecord,
  //         });
  //       }
  //     }
  //   }
  //   return result;
  // }

  private r = 4
  // async findMaxTelemetryValueRecordSetDIDK(
  //   parentVDs: VirtualDevice[],
  //   periodTMPyld: Record<
  //     string,
  //     PeriodTelemetryPayloadAudit[]
  //   >,
  // ) {

  //   const result: {
  //     assetId: string;
  //     virtualDeviceId: string;
  //     groupId: string;
  //     metricId: string;
  //     frequency: MetricsFrequency;
  //     txnCapturePeriod: Date;
  //     aggregation: string;
  //     matchedRecords: PeriodTelemetryPayloadAudit[];
  //     maxRecord: PeriodTelemetryPayloadAudit;
  //   }[] = [];

  //   const allRecords = Object.values(periodTMPyld).flat();

  //   const telemetryGroups = _.groupBy(
  //     allRecords,
  //     (record) =>
  //       [
  //         record.assetId,
  //         record.metric?.metricsAttributeId,
  //         record.metric?.frequency,
  //         record.metric?.txnCapturePeriod,
  //       ].join(SEPARATOR),
  //   );

  //   for (const parentVD of parentVDs) {

  //     for (const vdGroup of parentVD.virtualDeviceGroups ?? []) {

  //       const group = vdGroup.group;
  //       const aggregations = group?.groupMetricsAttributeAggregations ?? [];

  //       for (const groupAgg of aggregations) {

  //         const metricsAgg = groupAgg.metricsAttributeAggregation;
  //         const configuredMetricId = metricsAgg.metricsAttributeId;

  //         for (const telemetryRecords of Object.values(telemetryGroups)) {

  //           if (telemetryRecords.length == 0) {
  //             this.logger.debug('no telemetry records');
  //             continue;
  //           }

  //           const sample = telemetryRecords[0];

  //           const metricId = sample.metric?.metricsAttributeId;

  //           const frequency = sample.metric?.frequency;

  //           const txnCapturePeriod = sample.metric?.txnCapturePeriod;

  //           if (configuredMetricId !== metricId) {
  //             continue;
  //           }

  //           const matchedRecords =
  //             this.findMatchedTelemetryRecords(
  //               parentVD,
  //               metricId!,
  //               frequency!,
  //               txnCapturePeriod!,
  //               telemetryRecords,
  //             );

  //           if (!matchedRecords.length) {
  //             continue;
  //           }

  //           const maxRecord = _.maxBy(
  //             matchedRecords,
  //             (record) =>
  //               Number(record!.metric?.measure ?? 0),
  //           );

  //           if (!maxRecord) {
  //             continue;
  //           }

  //           result.push({
  //             assetId: parentVD.assetId,
  //             virtualDeviceId: parentVD.id,
  //             groupId: vdGroup.groupId,
  //             metricId,
  //             frequency,
  //             txnCapturePeriod,
  //             aggregation: metricsAgg.aggregation,
  //             matchedRecords,
  //             maxRecord,
  //           });
  //         }
  //       }
  //     }
  //   }

  //   return result;
  // }


  // added fetchmatching and record D   test this 


  private findMatchedTelemetryRecordsKeepThis(
    parentVD: VirtualDevice,
    metricId: string,
    frequency: MetricsFrequency,
    txnCapturePeriod: Date,
    records: (
      TelemetryPayload |
      PeriodTelemetryPayloadAudit
    )[],
  ) {

    const childrenVDIDs =
      parentVD.children?.map(
        (child) => child.id,
      ) ?? [];

    return records.filter((record) => {
      const isMatchingMetric =
        record.metric?.metricsAttributeId ===
        metricId;

      const isMatchingChild =
        childrenVDIDs.includes(
          record.virtualDeviceId!,
        );

      const isMatchingAsset =
        record.assetId ===
        parentVD.assetId;

      const isMatchingFrequency =
        record.metric?.frequency ===
        frequency;

      const isMatchingPeriod =
        new Date(
          record.metric?.txnCapturePeriod!,
        ).getTime() ===
        new Date(txnCapturePeriod).getTime();

      return (
        isMatchingMetric &&
        isMatchingChild &&
        isMatchingAsset &&
        isMatchingFrequency &&
        isMatchingPeriod
      );
    });
  }

  // async findMaxTelemetryValueRecordSetDOld(
  //   parentVDs: VirtualDevice[],
  //   periodTMPyld: Record<string, PeriodTelemetryPayloadAudit[]>,
  // ) {
  //   const result = [];

  //   for (const parentVD of parentVDs) {
  //     const childrenVDIDs = parentVD.children?.map(
  //       (child) => child.id,
  //     ) ?? [];

  //     if (childrenVDIDs.length == 0) {
  //       this.logger.debug(
  //         `No children for parent virtual device ${parentVD.id}`,
  //       );
  //       continue;
  //     }

  //     for (const vdGroup of parentVD.virtualDeviceGroups ?? []) {
  //       const group = vdGroup.group;
  //       const aggregations = group?.groupMetricsAttributeAggregations ?? [];

  //       for (const groupAgg of aggregations) {
  //         const metricsAgg = groupAgg.metricsAttributeAggregation;
  //         const metricId = metricsAgg.metricsAttributeId;

  //         let matchedRecords: PeriodTelemetryPayloadAudit[] = [];

  //         for (const records of Object.values(periodTMPyld)) {
  //           if (records.length == 0) {
  //             this.logger.debug(`Empty record array for a key in periodTMPyld, skipping...`);
  //             continue;
  //           }

  //           const sample = records[0];

  //           const isMatchingMetric =
  //             sample.metric?.metricsAttributeId === metricId;

  //           const isMatchingChild =
  //             childrenVDIDs.includes(
  //               sample.virtualDeviceId!,
  //             );

  //           const isMatchingAsset = sample.assetId === parentVD.assetId;

  //           if (
  //             isMatchingMetric &&
  //             isMatchingChild &&
  //             isMatchingAsset
  //           ) {
  //             matchedRecords.push(...records);
  //           }
  //         }

  //         if (!matchedRecords.length) {
  //           continue;
  //         }

  //         const maxRecord = _.maxBy(
  //           matchedRecords,
  //           (record) =>
  //             Number(record.metric?.measure ?? 0),
  //         );

  //         if (maxRecord) {
  //           result.push(maxRecord);
  //         }
  //         // result.push({
  //         //   assetId: parentVD.assetId,
  //         //   virtualDeviceId: parentVD.id,
  //         //   groupId: vdGroup.groupId,
  //         //   metricId,
  //         //   aggregation: metricsAgg.aggStrategy,
  //         //   maxMeasure: maxRecord?.metric?.measure ?? null,
  //         //   telemetryRecord: maxRecord,
  //         // });
  //       }
  //     }
  //   }

  //   return result;
  // }
  // async findMaxTelemetryValueRecordSetDOptimized(
  //   parentVDs: VirtualDevice[],
  //   periodTMPyld: Record<
  //     string,
  //     PeriodTelemetryPayloadAudit[]
  //   >,
  // ) {
  //   const result: PeriodTelemetryPayloadAudit[] = [];
  //   const allRecords = Object.values(periodTMPyld).flat();

  //   for (const parentVD of parentVDs) {
  //     for (const vdGroup of parentVD.virtualDeviceGroups ?? []) {
  //       const group = vdGroup.group;
  //       const aggregations = group?.groupMetricsAttributeAggregations ?? [];

  //       for (const groupAgg of aggregations) {
  //         const metricsAgg = groupAgg.metricsAttributeAggregation;
  //         const metricId = metricsAgg.metricsAttributeId;

  //         const matchedRecords =
  //           this.findMatchedTelemetryRecords(
  //             parentVD,
  //             metricId,
  //             allRecords,
  //           );

  //         if (!matchedRecords.length) {
  //           continue;
  //         }

  //         const maxRecord = _.maxBy(
  //           matchedRecords,
  //           (record) =>
  //             Number(record.metric?.measure ?? 0),
  //         );

  //         if (maxRecord) {
  //           result.push(maxRecord);
  //         }
  //       }
  //     }
  //   }

  //   return result;
  // }
  // async prepareRecordSetEOptimized(
  //   telemetryPylds: TelemetryPayload[],
  //   periodTMWthMaxMeasure: PeriodTelemetryPayloadAudit[],
  // ) {

  //   const recordSetDMap = new Map<string, PeriodTelemetryPayloadAudit>();

  //   for (const record of periodTMWthMaxMeasure) {
  //     const key = record.getTelemetryKey();
  //     recordSetDMap.set(key, record);
  //   }

  //   const recordSetEMap = new Map<string, any>();

  //   for (const record of telemetryPylds) {
  //     const key = record.getTelemetryKey();

  //     const recordD = recordSetDMap.get(key);

  //     if (!recordD) {
  //       recordSetEMap.set(key, record);
  //       continue;
  //     }

  //     const recordBValue = Number(record.metric?.measure ?? 0);
  //     const recordDValue = Number(recordD.metric?.measure ?? 0);

  //     if (recordDValue > recordBValue) {
  //       recordSetEMap.set(key, recordD);
  //     }
  //     else {
  //       recordSetEMap.set(key, record);
  //     }
  //   }

  //   // missingRecords 
  //   for (const recordD of periodTMWthMaxMeasure) {
  //     const key = recordD.getTelemetryKey();

  //     if (!recordSetEMap.has(key)) {
  //       recordSetEMap.set(key, recordD);
  //     }
  //   }

  //   return Array.from(recordSetEMap.values());
  // }
  // async prepareRecordSetEOld(
  //   recordSetB: TelemetryPayload[],
  //   recordSetD: PeriodTelemetryPayloadAudit[],
  // ) {
  //   const recordSetDMap = new Map<string, any>();

  //   for (const recordD of recordSetD) {
  //     // const key = this.getTelemetryKey(recordD);
  //     const key = recordD.getTelemetryKey();;
  //     recordSetDMap.set(key, recordD);
  //   }

  //   const recordSetEMap = new Map<string, any>();

  //   for (const recordB of recordSetB) {
  //     // const key = this.getTelemetryKey(recordB);
  //     const key = recordB.getTelemetryKey();

  //     const recordD = recordSetDMap.get(key);

  //     if (!recordD) {
  //       recordSetEMap.set(key, recordB);

  //       continue;
  //     }

  //     const recordBValue = Number(recordB.metric?.measure);
  //     const recordDValue = Number(recordD.metric?.measure);

  //     if (recordDValue > recordBValue) {
  //       recordSetEMap.set(key, recordD);
  //     } else {
  //       recordSetEMap.set(key, recordB);
  //     }
  //   }

  //   for (const recordD of recordSetD) {
  //     // const key = this.getTelemetryKey(recordD);
  //     const key = recordD.getTelemetryKey();

  //     if (!recordSetEMap.has(key)) {
  //       recordSetEMap.set(key, recordD);
  //     }
  //   }

  //   return Array.from(recordSetEMap.values());
  // }
  // async prepareRecordSetFOptimized(
  //   parentVDs: VirtualDevice[],
  //   recordSetE: (
  //     TelemetryPayload |
  //     PeriodTelemetryPayloadAudit
  //   )[],
  // ) {
  //   const result = [];

  //   for (const parentVD of parentVDs) {
  //     for (const vdGroup of parentVD.virtualDeviceGroups ?? []) {
  //       const group = vdGroup.group;
  //       const aggregations = group?.groupMetricsAttributeAggregations ?? [];

  //       for (const groupAgg of aggregations) {
  //         const metricsAgg = groupAgg.metricsAttributeAggregation;
  //         const metricId = metricsAgg.metricsAttributeId;

  //         const matchedRecords =
  //           this.findMatchedTelemetryRecords(
  //             parentVD,
  //             metricId,
  //             recordSetE,
  //           );

  //         if (!matchedRecords.length) {
  //           continue;
  //         }

  //         result.push({
  //           assetId: parentVD.assetId,
  //           virtualDeviceId: parentVD.id,
  //           groupId: vdGroup.groupId,
  //           metricId,
  //           aggregation: metricsAgg.aggStrategy,
  //           telemetryRecords: matchedRecords,
  //         });
  //       }
  //     }
  //   }
  //   return result;
  // }
  // async prepareRecordSetFOld(
  //   recordSetE: any[],
  //   recordSetC: any[],
  // ) {
  //   const recordSetF: any[] = [];

  //   const recordSetEMap = _.groupBy(
  //     recordSetE,
  //     (record) => record.virtualDeviceId,
  //   );

  //   // this.logger.debug("recordSetEMap", recordSetEMap);
  //   // this.logger.debug("recordSetC", recordSetC[0].metricsAggregationRecords);

  //   for (const recordC of recordSetC) {
  //     const {
  //       assetId,
  //       virtualDeviceId: parentVDId,
  //       parentVirtualDeviceId,
  //       childrenVDIDs,
  //       groupId,
  //       metricsAggregationRecords,
  //     } = recordC;
  //     // 
  //     // this.logger.debug(
  //     //   assetId,
  //     // virtualDeviceId,
  //     // parentVirtualDeviceId,
  //     //   childrenVDIDs,
  //     //   groupId,
  //     //   metricsAggregationRecords
  //     // )

  //     for (const childVDId of childrenVDIDs) {
  //       const childTelemetryRecords = recordSetEMap[childVDId] ?? [];

  //       for (const aggregationRecord of metricsAggregationRecords) {
  //         const {
  //           metricsAttributeId,
  //           aggregation,
  //           aggStrategy,
  //         } = aggregationRecord;

  //         const matchingTelemetry =
  //           childTelemetryRecords.filter(
  //             (telemetry) =>
  //               telemetry.metric?.metricsAttributeId ===
  //               metricsAttributeId,
  //           );
  //         // 
  //         for (const telemetry of matchingTelemetry) {
  //           recordSetF.push({
  //             assetId,
  //             parentVirtualDeviceId: parentVDId,
  //             childVirtualDeviceId: childVDId,
  //             virtualDeviceId: telemetry.virtualDeviceId,
  //             groupId,
  //             aggregation,
  //             aggStrategy,
  //             metric: telemetry.metric,
  //             telemetryPayloadId: telemetry.id,
  //             telemetryRecord: telemetry,
  //           });
  //         }
  //       }
  //     }
  //   }
  //   return recordSetF;
  // }
  // async prepareRecordSetGOld(
  //   recordSetF: any[],
  // ) {
  //   const groupedRecords = _.groupBy(
  //     recordSetF,
  //     (record) =>
  //       [
  //         record.parentVirtualDeviceId,
  //         record.metric?.metricsAttributeId,
  //         record.aggregation,
  //         record.aggStrategy,
  //       ].join(KEY_SEPARATOR),
  //   );

  //   const recordSetG: any[] = [];

  //   for (const groupRecords of Object.values(groupedRecords)) {
  //     if (groupRecords.length == 0) {
  //       this.logger.error(
  //         `Empty group found during aggregation processing.`,
  //       );
  //       continue;
  //     }

  //     const firstRecord = groupRecords[0];

  //     const {
  //       assetId,
  //       parentVirtualDeviceId,
  //       aggregation,
  //       aggStrategy,
  //       metric,
  //     } = firstRecord;

  //     const measures = groupRecords.map(
  //       (record) => Number(record.metric?.measure),
  //     );

  //     let aggregatedValue = 0;

  //     switch (aggregation) {
  //       case 'sum':
  //         aggregatedValue = _.sum(measures);
  //         break;

  //       case 'avg':
  //         aggregatedValue = measures.length > 0 ? _.sum(measures) / measures.length : 0;
  //         break;

  //       default:
  //         aggregatedValue = 0;
  //     }

  //     recordSetG.push({
  //       assetId,
  //       virtualDeviceId: parentVirtualDeviceId,
  //       aggregation,
  //       aggStrategy,
  //       metric: {
  //         ...metric,
  //         measure: aggregatedValue.toString(),
  //       },
  //       childTelemetryRecords: groupRecords,
  //     });
  //   }
  //   return recordSetG;
  // }

  async manageAlerts2(
    token: string,
    assetID: string,
    csvVirtualDeviceIDs: string,
    arrivedAlerts2: InputAlert2Dto[],
    //csvSourceAttributes?: string,
    closeDateTime?: number,
    alertId?: string,  // added this and if block of 430 line 
  ) {
    this.logger.debug("in managealerts2");
    const fnName = this.manageAlerts2.name;

    const createdAlerts: Alert[] = [];
    const toBeCreatedAlerts: InputAlert2Dto[] = [];

    const toBeDeletedCurrOpenAlerts: CurrentOpenAlert[] = [];
    const deletedCurrentOpenAlerts: CurrentOpenAlert[] = [];

    const closedAlerts: Alert[] = [];

    const toBeIncrementedCOAlerts: CurrentOpenAlert[] = [];
    const incrementedCurrentOpenAlerts: CurrentOpenAlert[] = [];
    const incrementdAlerts: Alert[] = [];

    const searchObj: FindCurrentOpenAlertDto = {
      virtualDeviceId: In(csvVirtualDeviceIDs.split(',')),
      assetId: assetID,
    };

    if (alertId) {
      searchObj.alertId = alertId;
    }

    /* if (csvSourceAttributes && csvSourceAttributes.length > 0) {
      searchObj.sourceAttribute = In(csvSourceAttributes.split(','));
    } else {
      searchObj.sourceAttribute = IsNull();
    } */
    this.logger.debug(`${fnName} : searchObj : ${JSON.stringify(searchObj)}`);

    const currentOpenAlerts = await this.currentOpenAlertService.findAll(
      searchObj,
    );

    if (_.isEmpty(arrivedAlerts2)) {
      this.logger.debug(`${fnName} : No arrived alerts`);

      if (!_.isEmpty(currentOpenAlerts)) {
        const { deletedCOAlerts, clsdAlerts } = await this.closeAlerts(
          currentOpenAlerts,
          closeDateTime,
        );
        deletedCurrentOpenAlerts.push(...deletedCOAlerts);
        closedAlerts.push(...clsdAlerts);
      } else {
        this.logger.debug(
          `${fnName} :  No ArrivedAlerts and CurrentOpenAlerts`,
        );
      }
    } else {
      this.logger.debug(
        `${fnName} : No of arrived alerts : ${arrivedAlerts2.length}`,
      );
      const arrivedAlert2Map = new Map(
        arrivedAlerts2.map((arrivedAlert2) => [
          arrivedAlert2.assetId +
          KEY_SEPARATOR +
          (arrivedAlert2.virtualDeviceId ??
            arrivedAlert2.virtualDevice?.id ??
            '') +
          KEY_SEPARATOR +
          (arrivedAlert2.sourceAttribute ?? '') +
          /*  (arrivedAlert2.metricsAttributeId ?? 
            arrivedAlert2.metricsAttribute?.id ??
            '') + */
          KEY_SEPARATOR +
          arrivedAlert2.alertId,
          arrivedAlert2,
        ]),
      );

      if (!_.isEmpty(currentOpenAlerts)) {
        this.logger.debug(`${fnName} : in currentOpenAlert`);
        // 
        for (const currOpenAlert of currentOpenAlerts) {
          const currentOpenAlertObj = new CurrentOpenAlert(currOpenAlert);
          const key = currentOpenAlertObj.getKey();

          const matchingAlert = arrivedAlert2Map.get(key);

          if (matchingAlert) {
            this.logger.debug(`${fnName} : matched`);
            currentOpenAlertObj.alertCount++;
            toBeIncrementedCOAlerts.push(currentOpenAlertObj);
            arrivedAlert2Map.delete(key);
          } else {
            this.logger.debug(`${fnName} : not matched`);
            toBeDeletedCurrOpenAlerts.push(currentOpenAlertObj);
          }
        }
        if (!_.isEmpty(toBeDeletedCurrOpenAlerts)) {
          const { deletedCOAlerts, clsdAlerts } = await this.closeAlerts(
            toBeDeletedCurrOpenAlerts,
            closeDateTime,
          );
          deletedCurrentOpenAlerts.push(...deletedCOAlerts);
          closedAlerts.push(...clsdAlerts);
        }
        // 
        if (!_.isEmpty(toBeIncrementedCOAlerts)) {
          this.logger.debug(`${fnName} : incremented currOAlert array`);
          const incrmntdCOAlerts: CurrentOpenAlert[] =
            await this.currentOpenAlertService.save(toBeIncrementedCOAlerts);
          incrementedCurrentOpenAlerts.push(...incrmntdCOAlerts);
          const findAlertDTOs = this.findOpenAlertObjsFromCrntOpnAlrts(
            toBeIncrementedCOAlerts,
          );
          const toBeIncrementedAlerts = await this.alertService.findAll(
            findAlertDTOs,
          );
          for (const alert of toBeIncrementedAlerts) {
            alert.alertCount++;
          }
          const incrmntdAlerts: Alert[] = await this.alertService.save(
            toBeIncrementedAlerts,
          );
          incrementdAlerts.push(...incrmntdAlerts);
        }
      }

      this.logger.debug(`${fnName} : Outside currentOpenAlerts`);

      toBeCreatedAlerts.push(...arrivedAlert2Map.values());

      const crtdAlerts: Alert[] | undefined = await this.saveTelemetryAlerts3(
        token,
        toBeCreatedAlerts,
      );
      // 

      if (crtdAlerts && crtdAlerts.length > 0) {
        createdAlerts.push(...crtdAlerts);
      }
    }

    // if (createdAlerts.length > 0) {
    //   this.alertGateway.sendAlerts(assetID, AlertStatus.CREATED, createdAlerts);
    // }

    // if (closedAlerts.length > 0) {
    //   this.alertGateway.sendAlerts(assetID, AlertStatus.CLOSED, closedAlerts);
    // }

    // if (incrementdAlerts.length > 0) {
    //   this.alertGateway.sendAlerts(assetID, AlertStatus.INCREMENTED, incrementdAlerts);
    // }

    if (createdAlerts.length > 0) {
      this.eventEmitter.emit('alert.created', createdAlerts);
    }

    if (closedAlerts.length > 0) {
      this.eventEmitter.emit('alert.closed', closedAlerts);
    }

    if (incrementdAlerts.length > 0) {
      // this.eventEmitter.emit('alert.incremented', {
      //   assetId: assetID,
      //   alerts: incrementdAlerts,
      // });

      this.eventEmitter.emit('alert.incremented', incrementdAlerts);
    }

    return {
      createdAlerts: createdAlerts,
      //deletedCurrentOpenAlerts: deletedCurrentOpenAlerts,
      closedAlerts: closedAlerts,
      //incrementedCurrentOpenAlerts: incrementedCurrentOpenAlerts,
      incrementedAlerts: incrementdAlerts,
    };
  }


  private async closeAlerts(
    currentOpenAlerts: CurrentOpenAlert[],
    closeDateTime?: number,
  ) {
    const fnName = this.closeAlerts.name;
    this.logger.debug(`${fnName} : in currentOpenAlert`);

    const idsToBeDeleted = currentOpenAlerts.map((alert) => alert.id);
    const deletedCOAlerts: CurrentOpenAlert[] =
      await this.currentOpenAlertService.bulkDelete(idsToBeDeleted);

    this.logger.debug(`${fnName} : after deletion now close`);
    const findOpenAlertDTOs =
      this.findOpenAlertObjsFromCrntOpnAlrts(currentOpenAlerts);
    this.logger.debug(
      `Alerts to be closed : ${JSON.stringify([...findOpenAlertDTOs])}`,
    );
    const clsdAlerts: Alert[] = await this.alertService.closeAlerts2(
      findOpenAlertDTOs,
      closeDateTime,
    );

    return {
      deletedCOAlerts,
      clsdAlerts,
    };
  }

  private findOpenAlertObjsFromCrntOpnAlrts(
    currentOpenAlerts: CurrentOpenAlert[],
  ): FindAlertDto[] {
    const findAlertDTOs: FindAlertDto[] = [];
    for (const currentOpenAlert of currentOpenAlerts) {
      const findAlertDTO: FindAlertDto = {
        assetId: currentOpenAlert.assetId,
        alertId: currentOpenAlert.alertId,
        closeDateTime: IsNull(),
      };
      findAlertDTO.virtualDeviceId =
        currentOpenAlert.virtualDeviceId ??
        currentOpenAlert.virtualDevice?.id ??
        IsNull();
      /* currentOpenAlert.virtualDeviceId
        ? (findAlertDTO.virtualDeviceId = currentOpenAlert.virtualDeviceId)
        : null; */
      findAlertDTO.sourceAttribute =
        currentOpenAlert.sourceAttribute ?? IsNull();
      /* currentOpenAlert.sourceAttribute
        ? (findAlertDTO.sourceAttribute = currentOpenAlert.sourceAttribute)
        : null; */
      /* currentOpenAlert.metricsAttributeId
        ? (findAlertDTO.metricsAttributeId =
            currentOpenAlert.metricsAttributeId)
        : null; */
      findAlertDTOs.push(findAlertDTO);
    }
    return findAlertDTOs;
  }

  private async getDescendentsOrgs(csvOrgIDs: string, withAssets = false) {
    const searchObj = {
      csvOrgIDs: csvOrgIDs,
    };

    return await this.orgService.findDescendents(searchObj, withAssets);
  }


  async findDevicesFromMultipleIDs2(findDevices: FindDevicesFromMultipleIDs) {
    const fnName = this.findDevicesFromMultipleIDs2.name;
    const input = `Input : ${JSON.stringify(findDevices)}`;
    //try {
    this.logger.debug(`${fnName} : Start`);
    this.logger.debug(`${fnName} : ${input}`);

    const [orgResults, ownerOrgResults] = await Promise.all([
      findDevices.csvOrgIDs
        ? this.getDescendentsOrgs(findDevices.csvOrgIDs)
        : Promise.resolve(null),
      findDevices.csvOwnerOrgIDs
        ? this.getDescendentsOrgs(findDevices.csvOwnerOrgIDs)
        : Promise.resolve(null),
    ]);

    if (orgResults && !_.isNil(orgResults)) {
      const csvOrgIDs = orgResults.map((org) => org.id).join(',');
      findDevices.csvOrgIDs = csvOrgIDs;
      this.logger.debug(`${fnName} : csvOrgIDs are : ${findDevices.csvOrgIDs}`);
    }

    if (ownerOrgResults && !_.isNil(ownerOrgResults)) {
      const csvOwnerOrgIDs = ownerOrgResults.map((org) => org.id).join(',');
      findDevices.csvOwnerOrgIDs = csvOwnerOrgIDs;
      this.logger.debug(
        `${fnName} : csvOwnerOrgIDs are : ${findDevices.csvOwnerOrgIDs}`,
      );
    }

    /* if (findDevices.csvOwnerOrgIDs) {
      const orgs = await this.getDescendentsOrgs(findDevices.csvOwnerOrgIDs);
      if (!_.isNil(orgs)) {
        const csvOrgIDs = orgs.map((org) => org.id).join(',');
        findDevices.csvOwnerOrgIDs = csvOrgIDs;
        this.logger.debug(
          `${fnName} : csvOwnerOrgIDs are : ${findDevices.csvOwnerOrgIDs}`,
        );
      }
    } */

    const devices = await this.deviceService.findAllByMultipleIDs2(
      findDevices,
      Relations.MIN,
    );

    this.logger.debug(`No of devices : ${devices?.length}`);
    const deviceDTOs: DeviceDto[] = [];
    _.isEmpty(devices)
      ? null
      : devices!.map((device) => deviceDTOs.push(new DeviceDto(device)));
    /*  this.logger.debug(`Returning ${deviceDTOs.length} DeviceDTOs`);
    this.logger.debug(`${fnName} : ${JSON.stringify([...deviceDTOs])}`); */
    //deviceDTOs.sort((a, b) => a.serialNo.localeCompare(b.serialNo));
    return deviceDTOs;
  }

  async saveTelemetryMetrics(telemetryPayloads: TelemetryPayload[]) {
    this.logger.debug(`Save Telemetry Metrics : Start`);
    const msgTemplate = `Save Telemetry Metrics : ${this.serviceName}`;
    const event = `Input : Nos are : ${telemetryPayloads.length}`;
    try {
      this.logger.debug(`${msgTemplate} : ${event} : Star t`);
      const txnCaptureTimeInEpoch =
        telemetryPayloads[0].metric.txnCaptureTime.valueOf();
      const currentTimeInEpoch = Date.now().valueOf();
      if (currentTimeInEpoch - txnCaptureTimeInEpoch > 600000 /*milliSecondsIn10Mins*/) {
        await this.deleteAdjacentTelemetryMetrics(
          telemetryPayloads,
          msgTemplate,
          event,
        );
        this.logger.debug('Finished deleting adjacent telemetry metrics');
      } else {
        this.logger.debug('No need to delete adjacent telemetry metrics');
      }
      const savedTelemetryPayloads = await this.telemetryPayloadService.create(
        telemetryPayloads,
      );

      const savedCurrentTelemetryPayloads =
        await this.currentTelemetryPayloadService.createV2(telemetryPayloads);

      return savedTelemetryPayloads;
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${this.serviceName} : ${event} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async deleteAdjacentTelemetryMetrics(
    telemetryPayloads: TelemetryPayload[],
    msgTemplate: string,
    event: string,
  ) {
    for (const telemetryPayload of telemetryPayloads) {
      const telemetryPayloadObj = new TelemetryPayload(telemetryPayload);
      // if (telemetryPayloadObj.isForVirtualDeviceGroup()) {
      //   const findTelemetryPayloadsForATimePeriod =
      //     new FindTelemetryPayloadForAPeriod(telemetryPayloadObj);
      //   const txnCaptureTimeInEpoch = new Date(
      //     telemetryPayloadObj.metric.txnCaptureTime,
      //   ).valueOf();
      //   const deleteStartTime =
      //     txnCaptureTimeInEpoch - (PUBLISH_INTERVAL_IN_SECONDS / 2) * 1000;
      //   const deleteEndTime =
      //     txnCaptureTimeInEpoch + (PUBLISH_INTERVAL_IN_SECONDS / 2) * 1000;
      //   findTelemetryPayloadsForATimePeriod.updateTimeRange(
      //     deleteStartTime,
      //     deleteEndTime,
      //   );

      //   await this.deleteDeviceGroupTelemetryForAPeriod(
      //     findTelemetryPayloadsForATimePeriod,
      //   );

      //   /* const deleteDeviceGroupTelemetryForAPeriodURL = new URL(
      //     DELETE_DEVICE_GROUP_TELEMETRY_FOR_A_PERIOD_URL,
      //     this.baseURL,
      //   );
      //   getSearchParamsforURL(
      //     deleteDeviceGroupTelemetryForAPeriodURL,
      //     JSON.stringify(findTelemetryPayloadsForATimePeriod),
      //   );
      //   this.logger.debug(
      //     `${msgTemplate} : ${event} : Delete Device Group Telemetry URL : ${deleteDeviceGroupTelemetryForAPeriodURL.href}`,
      //   );

      //   const deleteDeviceGroupTelemetryForAPeriodURLResp =
      //     await firstValueFrom(
      //       this.httpService.delete(
      //         deleteDeviceGroupTelemetryForAPeriodURL.href,
      //       ),
      //     );
      //   this.logger.debug(
      //     `${msgTemplate} : ${event} : Delete Device Group Telemetry URL : ${deleteDeviceGroupTelemetryForAPeriodURL.href}`,
      //   );
      //   throwErrIfSrvcRespFailure(deleteDeviceGroupTelemetryForAPeriodURLResp); */
      // } else {
      this.logger.debug(
        `${msgTemplate} : ${event} : Telemetry for ${telemetryPayload.virtualDeviceId} not deleted`,
      );
      // }
    }
  }

  async deleteDeviceGroupTelemetryForAPeriod(
    deleteCriteria: FindTelemetryPayloadForAPeriod,
  ) {
    const msgTemplate = `Delete Device Group Telemetry For a Period : ${this.serviceName}`;
    const event = `Input : ${JSON.stringify(deleteCriteria)}`;
    try {
      this.logger.debug(`${msgTemplate} : ${event} : Start`);
      const deletedDeviceGroupTelemetry =
        await this.telemetryPayloadService.deleteDeviceGroupForTimePeriod(
          deleteCriteria,
        );
      this.logger.debug(
        `${msgTemplate} : ${event} : Deleted Telemetry ${JSON.stringify(
          deletedDeviceGroupTelemetry,
        )}`,
      );
      /* const telemetryPayloadURL = new URL(
        SOFT_DELETE_DEVICE_GROUP_TELEMETRY_PAYLOAD_FOR_A_TIME_PERIOD_URL,
        this.baseURL,
      );
      getSearchParamsforURL(
        telemetryPayloadURL,
        JSON.stringify(deleteCriteria),
      );
      this.logger.debug(
        `${msgTemplate} : ${event} : Telemetry Payload URL : ${telemetryPayloadURL.href}`,
      );
      const telemetryPayloadURLResp = await firstValueFrom(
        this.httpService.delete(telemetryPayloadURL.href),
      );
      throwErrIfSrvcRespFailure(telemetryPayloadURLResp);
      this.logger.debug(
        `${msgTemplate} : ${event} : Deleted Telemetry ${JSON.stringify(
          telemetryPayloadURLResp.data,
        )}`,
      ); */

      /* const currTelemetryPayloadURL = new URL(
        DELETE_DEVICE_GROUP_CURR_TELEMETRY_PAYLOAD_FOR_A_TIME_PERIOD_URL,
        this.baseURL,
      );
      getSearchParamsforURL(
        currTelemetryPayloadURL,
        JSON.stringify(deleteCriteria),
      );
      this.logger.debug(
        `${msgTemplate} : ${event} : Current Telemetry Payload URL : ${currTelemetryPayloadURL.href}`,
      );
      const currTelemetryPayloadURLResp = await firstValueFrom(
        this.httpService.delete(currTelemetryPayloadURL.href),
      );
      throwErrIfSrvcRespFailure(currTelemetryPayloadURLResp); */
      const deletedCurrTelePayloads =
        await this.currentTelemetryPayloadService.deleteDeviceGroupForTimePeriod(
          deleteCriteria,
        );
      this.logger.debug(
        `${msgTemplate} : ${event} : Deleted Current Telemetry ${JSON.stringify(
          deletedCurrTelePayloads,
        )}`,
      );
      return deletedCurrTelePayloads;
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${msgTemplate} : ${event} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${msgTemplate} : ${event} : End`);
    }
  }


  /* async authenticateUser(findUserDto: FindUserDto) {
    const msgTemplate =
      'Authenticate user ' +
      this.serviceName +
      ' Input user ' +
      JSON.stringify(findUserDto);
    try {
      let authenticateUserURL = new URL(USER_AUTHENTICATE_URL, this.baseURL);
      authenticateUserURL = getSearchParamsforURL(
        authenticateUserURL,
        JSON.stringify(findUserDto),
      );
      this.logger.debug(`${msgTemplate} : ${authenticateUserURL.toString()}`);
      const userResp = await firstValueFrom(
        this.httpService.get<User>(authenticateUserURL.toString()).pipe(
          catchError((error: AxiosError) => {
            this.logger.error('Catches error here');
            const errMsg = createErrMsg(msgTemplate, error);
            this.logger.debug(errMsg);
            throw errMsg;
          }),
        ),
      );
      this.logger.debug('Here');
      this.logger.debug(`${msgTemplate} : ${getServiceResponseStatus(userResp)}`);
      if (userResp.status == HttpStatus.OK && userResp.data) {
        const user = userResp.data;

        if (userResp.data.orgs && userResp.data.orgs.length > 0) {
          this.logger.debug(
            `${msgTemplate} : Orgs : ${JSON.stringify([
              ...userResp.data.orgs,
            ])} for user ${userResp.data.id}`,
          );
          const csvUserOrgs = userResp.data.orgs.map((org) => org.id);
          const descendentOrgs = await this.getDescedentsOrgsAssets(
            csvUserOrgs,
            msgTemplate,
          );
          user.orgs = descendentOrgs;
          return user;
        } else {
          const errMsg = `${user.id} does not have any associated orgs`;
          this.logger.error(`${msgTemplate} : ${errMsg}`);
          throw new Error(errMsg);
        }
      } else {
        const errMsg = getServiceResponseStatus(userResp);
        this.logger.error(`${msgTemplate} : ${errMsg}`);
        throw new Error(errMsg);
      }
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${msgTemplate} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  } */

  /* async adaptAlertsAndTelemetry(
    telemetryAdaptorID: string,
    createTelemetries: CreateTelemetryPayloadDto[],
    deviceTypeID?: string,
  ) {
    const msgTemplate = this.serviceName + ' createAlertsAndTelemetry() : ';
    const event = `Telemetry Adaptor ID : ${telemetryAdaptorID}, Device type : ${deviceTypeID}, No of records : ${createTelemetries?.length}`;

    try {
      const dataModelAdaptorURL = new URL(
        DATA_MODEL_ADAPTOR_NESTED_RELATIONS_FIND_ONE_URL,
        this.baseURL,
      );
      dataModelAdaptorURL.searchParams.append('id', telemetryAdaptorID);
      deviceTypeID
        ? dataModelAdaptorURL.searchParams.append('deviceTypeID', deviceTypeID)
        : null;
      this.logger.debug(
        `${msgTemplate} : ${event} : Data Model Adaptor URL : ${dataModelAdaptorURL.href}`,
      );
      const dataModelAdaptorResp = await firstValueFrom(
        this.httpService.get<DataModelAdaptor>(dataModelAdaptorURL.href),
      );
      this.logger.debug(
        `${msgTemplate} : ${event} : ${getServiceResponseStatus(
          dataModelAdaptorResp,
        )}`,
      );
      this.logger.debug(
        `Data Model Adaptor : ${JSON.stringify(dataModelAdaptorResp.data)}`,
      );
      const dataModelAdaptor = new DataModelAdaptor(
        dataModelAdaptorResp.data as Partial<DataModelAdaptor>,
      );
      const metricsAttributeMap = dataModelAdaptor.getMetricsAttributeMap();
      metricsAttributeMap.forEach((value, key) =>
        this.logger.debug(
          `Metrics attribute Key : ${key}, value : ${JSON.stringify(value)}`,
        ),
      );
      for (const inputTelemetry of createTelemetries) {
        const metricsAttributeAdaptor = metricsAttributeMap.get(
          inputTelemetry.metric?.attribute as string,
        );
        if (metricsAttributeAdaptor) {
          const metricsAttributeAdaptorObj = new MetricsAttributeAdaptor(
            metricsAttributeAdaptor,
          );
          if (metricsAttributeAdaptorObj.isAlert()) {
            const currOpenAlertURL = new URL(
              CURRENT_OPEN_ALERT_URL,
              this.baseURL,
            );
            const alertDTO = new AlertFromTelemetry(
              inputTelemetry,
              metricsAttributeAdaptor,
            );
            this.logger.debug(`Current Open Alert URL : ${currOpenAlertURL.href}`);
            const currentOpenAlert = new CreateCurrentOpenAlertDto(alertDTO);
            const currOpenAlertURLResp = await firstValueFrom(
              this.httpService.post(currOpenAlertURL.href, currentOpenAlert),
            );
            this.logger.debug(
              `${msgTemplate} : ${event} : ${getServiceResponseStatus(
                currOpenAlertURLResp,
              )}`,
            );
          } else {
            this.logger.debug(
              `${msgTemplate} : ${event} : ${JSON.stringify(
                metricsAttributeAdaptorObj,
              )} is not an alert}`,
            );
          }
        }
        this.logger.debug(`Input Telemetry : ${JSON.stringify(inputTelemetry)}`);
      }

      return dataModelAdaptorResp.data;
    } catch (error) {
      const errMsg = `${event} : ${getTryCatchErrorStr(error)}`;
      this.logger.error(`${msgTemplate} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  } */
  //   async getAssetTypeCurrentPerformanceTelemetry(
  //     csvOrgIDs: string,
  //     assetTypeID: string,
  //   ) {
  //     const msgTemplate =
  //       this.serviceName + ' getAssetTypeCurrentPerformanceTelemetry() : ';
  //     const event = 'csvOrgIDs : ' + csvOrgIDs + ' assetType : ' + assetTypeID;
  //     this.logger.debug(`${msgTemplate} : Inputs : ${event}`);

  //     try {
  //       let capacityDto: CapacityDto | undefined;
  //       const withAssets = true;
  //       const rcvdOrgs = await this.getDescendentsOrgs(csvOrgIDs, withAssets);
  //       throwErrIfNoData(rcvdOrgs, `No descedent orgs for ${csvOrgIDs}`);
  //       /* throwErrIfSrvcRespFailure(descedentOrgsWithAssetsResp);
  //       throwErrIfNoRespData(descedentOrgsWithAssetsResp, 'No orgs'); */
  //       //const rcvdOrgs = rcvdOrgs.data as Org[];
  //       let totalCapacity = 0;
  //       let capacityUnit;
  //       //Get csvAssetIDs in org class
  //       const uniqueAssets = this.extractUniqueAssetsFromOrgs(rcvdOrgs);
  //       const assetIDsFilteredByGivenAssetType = new Array<string>();

  //       const assetsFilteredByGivenAssetType = uniqueAssets.filter(
  //         (asset) => assetTypeID == asset.assetTypeId,
  //       );
  //       if (_.isNil(assetsFilteredByGivenAssetType)) {
  //         const errMsg = `${event} : No assets for ${assetTypeID}`;
  //         throw new Error(errMsg);
  //       } else {
  //         for (const asset of assetsFilteredByGivenAssetType) {
  //           if (asset.capacityMeasure) {
  //             totalCapacity += asset.capacityMeasure;
  //           }
  //           assetIDsFilteredByGivenAssetType.push(asset.id);
  //         }
  //         capacityUnit = assetsFilteredByGivenAssetType[0].capacityUnitId;
  //         this.logger.debug(
  //           `Asset IDs filtered by asset type : ${assetIDsFilteredByGivenAssetType.toString()}`,
  //         );

  //         const filteredAssetIDs = assetIDsFilteredByGivenAssetType.join(',');
  //         let assetTypeCurrPerfSrcsSearchCriteria: FindAssetTypeCurrentPerformanceSourceByMultipleIDsDto =
  //           {
  //             assetTypeId: assetTypeID,
  //             csvAssetIDs: filteredAssetIDs,
  //             displayOnlyForAssetType: true,
  //           };
  //         const assetTypeCurrPerfSrcs =
  //           await this.getAssetTypeCurrPerfSrcsBySelectedAssetIDs(
  //             assetTypeCurrPerfSrcsSearchCriteria,
  //           );

  //         if (assetTypeCurrPerfSrcs.length == 0) {
  //           this.logger.debug(
  //             `${msgTemplate} : ${event} : No asset type current performance for asset type : ${assetTypeID}`,
  //           );
  //           return {};
  //         }

  //         /* throwErrIfNoData(
  //           assetTypeCurrPerfSrcs,
  //           `No asset type curr perf srcs for asset type : ${assetTypeID}and assetIDs : ${filteredAssetIDs}`,
  //         ); */
  //         /* throwErrIfSrvcRespFailure(assetTypeCurrPerfSrcsWithSelectedAssetsResp);

  //         throwErrIfNoRespData(
  //           assetTypeCurrPerfSrcsWithSelectedAssetsResp,
  //           `No asset type curr perf srcs for asset type : ${assetTypeID}`,
  //         ); */

  //         /* const assetTypeCurrPerfSrcs =
  //           assetTypeCurrPerfSrcsWithSelectedAssetsResp.data as AssetTypeCurrentPerformanceSource[]; */

  //         /* const assetIDSet: Set<string> = new Set();
  //         const virtualDeviceIDSet: Set<string> = new Set();
  //         const attributeSet: Set<string> = new Set(); */
  //         const findCTPLDTOs: FindCurrentTelemetryDto[] = [];
  //         for (const assetTypeCurrPerfSrc of assetTypeCurrPerfSrcs) {
  //           const assetCurrPerfSrcs =
  //             assetTypeCurrPerfSrc.assetCurrentPerformanceSources as AssetCurrentPerformanceSource[];
  //           if (assetCurrPerfSrcs.length > 0) {
  //             for (const assetCurrPerfSrc of assetCurrPerfSrcs) {
  //               const findCTPLDTO: FindCurrentTelemetryDto = {
  //                 assetId: assetCurrPerfSrc.assetId,
  //                 virtualDeviceId: assetCurrPerfSrc.virtualDeviceId ?? IsNull(),
  //                 metric: {
  //                   metricsAttributeId: assetCurrPerfSrc.metricsAttributeId ?? assetTypeCurrPerfSrc.metricsAttributeId,
  //                 }
  //               }
  //               findCTPLDTOs.push(findCTPLDTO);
  //               /* assetIDSet.add(assetCurrPerfSrc.assetId);
  //               if (assetCurrPerfSrc.virtualDeviceId) {
  //                 virtualDeviceIDSet.add(assetCurrPerfSrc.virtualDeviceId);
  //               } else {
  //                 //we need to add virtualDevice Id null criteria
  //               }
  //               const metricsAttributeId = assetCurrPerfSrc.metricsAttributeId ?? assetCurrPerfSrc.metricsAttributeId;
  //               metricsAttributeId ? attributeSet.add(metricsAttributeId) : null; */
  //             }
  //           } else {
  //             this.logger.debug(
  //               `${msgTemplate} : ${event} : No asset curr perf srcs for asset type ${assetTypeCurrPerfSrc.assetTypeId}`,
  //             );
  //           }
  //         }
  //         /* const assetIDs = Array.from(assetIDSet).toString();
  //         const virtualDeviceIDs =
  //           virtualDeviceIDSet.size > 0
  //             ? Array.from(virtualDeviceIDSet).toString()
  //             : null;
  //         const attributes = Array.from(attributeSet).toString();

  //         //this.logger.debug(`AssetIDs : ${assetIDs}`);
  //         this.logger.debug(`virtual device ids : ${virtualDeviceIDs}`);
  //         this.logger.debug(`attributes : ${attributes}`); */

  //         /*  let currTelemetryPayloadsForMultipleAssetsURL = new URL(
  //           CURR_TELEMETRY_PAYLOAD_BY_MULTIPLE_IDs_URL,
  //           this.baseURL,
  //         ); */
  //         /* const currTelemetrySearchObject: FindCurrentTelemetryPayloadsByMultipleIDs =
  //           {
  //             csvAssetIDs: assetIDs,
  //             //csvVirtualDeviceIDs: virtualDeviceIDs,
  //             csvMetricsAttributeIDs: attributes,
  //           };
  //         virtualDeviceIDs == null
  //           ? null
  //           : (currTelemetrySearchObject.csvVirtualDeviceIDs = virtualDeviceIDs); */

  //         /* const currentTelemetryPayloads =
  //           await this.getCurrentTelemetryPayloadsByMultipleIDs(
  //             currTelemetrySearchObject,
  //           ); */
  //         const currentTelemetryPayloads = await this.currentTelemetryPayloadService.findByMultipleConditions(
  //           findCTPLDTOs
  //         );
  //         /* currTelemetryPayloadsForMultipleAssetsURL = getSearchParamsforURL(
  //           currTelemetryPayloadsForMultipleAssetsURL,
  //           JSON.stringify(currTelemetrySearchObject),
  //         );
  //         this.logger.debug(
  //           `${msgTemplate} : ${event} : ${decodeURI(
  //             currTelemetryPayloadsForMultipleAssetsURL.href,
  //           )}`,
  //         );
  //         const currTelemetryPayloadsForMultipleAssetsResp = await firstValueFrom(
  //           this.httpService.get<CurrentTelemetryPayload[]>(
  //             currTelemetryPayloadsForMultipleAssetsURL.toString(),
  //           ),
  //         );
  //         throwErrIfSrvcRespFailure(currTelemetryPayloadsForMultipleAssetsResp);
  //         const currTelemetryPayloads =
  //           currTelemetryPayloadsForMultipleAssetsResp.data as CurrentTelemetryPayload[]; */
  //         //const currTelemetryPayloadObjs: CurrentTelemetryPayload[] = [];
  //         const currTelemetryPyldDTOs: CurrentTelemetryPayloadDTO[] = [];
  //         if (currentTelemetryPayloads.length > 0) {
  //           const currTelemetryMap: Map<string, CurrentTelemetryPayload> =
  //             new Map();
  //           this.logger.debug(
  //             `No of curr Telemetries fetched : ${currentTelemetryPayloads.length}`,
  //           );
  //           for (const currTelemetryPyld of currentTelemetryPayloads) {
  //             const currTelemetryPyldObj = new CurrentTelemetryPayload(
  //               currTelemetryPyld,
  //             );
  //             currTelemetryMap.set(
  //               currTelemetryPyldObj.getKey(),
  //               currTelemetryPyldObj,
  //             );
  //           }
  //           for (const assetTypeCurrPerfSrc of assetTypeCurrPerfSrcs) {
  //             let utilizedCapacity = 0;
  //             let updateTime;
  //             const assetCurrPerfSrcs =
  //               assetTypeCurrPerfSrc.assetCurrentPerformanceSources;
  //             if (assetCurrPerfSrcs.length > 0) {
  //               let aggregatedValue = 0;
  //               let counter = 0;
  //               let txnCaptureTimeInEpoch = new Date(0).valueOf();
  //               let txnCapturePeriod = new Date(0);
  //               let frequency = MetricsFrequency.INSTANT; //Default value is provided. Overide is below;
  //               const metricsAttributeId =
  //                 assetCurrPerfSrcs[0].metricsAttributeId ?? assetTypeCurrPerfSrc.metricsAttributeId;
  //               for (const assetCurrPerfSrc of assetCurrPerfSrcs) {
  //                 const assetCurrPerfSrcObj = new AssetCurrentPerformanceSource(
  //                   assetCurrPerfSrc,
  //                 );
  //                 const key = assetCurrPerfSrcObj.getKey();
  //                 const currTelemetryPyld = currTelemetryMap.get(key);
  //                 if (currTelemetryPyld) {
  //                   frequency = currTelemetryPyld.metric.frequency;
  //                   const incomingValue = currTelemetryPyld.metric.measure;
  //                   let sumOfAllValues = 0;
  //                   if (currTelemetryPyld.metric.txnCaptureTimeInEpoch) {
  //                     txnCaptureTimeInEpoch = max([
  //                       txnCaptureTimeInEpoch,
  //                       currTelemetryPyld.metric.txnCaptureTimeInEpoch,
  //                     ])!;
  //                   }
  //                   if (currTelemetryPyld.metric.txnCapturePeriod) {
  //                     txnCapturePeriod = maximumDate(
  //                       txnCapturePeriod,
  //                       currTelemetryPyld.metric.txnCapturePeriod,
  //                     );
  //                   }
  //                   /* maximumDate(
  //                     txnCaptureTimeInEpoch,
  //                     currTelemetryPyld.metric.txnCaptureTime,
  //                   ) */ switch (assetTypeCurrPerfSrc.aggregation) {
  //                     case 'sum':
  //                       counter++;
  //                       aggregatedValue =
  //                         aggregatedValue + parseFloat(incomingValue);
  //                       break;
  //                     case 'max':
  //                       counter++;
  //                       aggregatedValue < parseFloat(incomingValue)
  //                         ? (aggregatedValue = parseFloat(
  //                             currTelemetryPyld?.metric.measure,
  //                           ))
  //                         : null;
  //                       break;
  //                     case 'avg':
  //                       counter++;
  //                       sumOfAllValues =
  //                         sumOfAllValues + parseFloat(incomingValue);
  //                       aggregatedValue = sumOfAllValues / counter;
  //                       break;
  //                     default:
  //                       this.logger.error(
  //                         `${msgTemplate} : ${event} : Invalid aggregation : ${assetTypeCurrPerfSrc.aggregation}`,
  //                       );
  //                       break;
  //                   }
  //                 } else {
  //                   this.logger.error(
  //                     `${msgTemplate} ${event}: Measure not available for ${key}`,
  //                   );
  //                 }
  //               }
  //               this.logger.debug(
  //                 `Input to telemetryMeasure : ${assetTypeCurrPerfSrc.label}`,
  //               );
  //               if (counter > 0) {
  //                 try {
  //                   const metric: Partial<Metric> = {
  //                     //metricsAttributeId: assetCurrPerfSrcs[0].metricsAttributeId,
  //                     measure: aggregatedValue.toString(),
  //                     //unit: assetTypeCurrPerfSrc.unitId,
  //                     txnCaptureTimeInEpoch: txnCaptureTimeInEpoch.valueOf(),
  //                     txnCapturePeriod: txnCapturePeriod,
  //                     txnCapturePeriodInEpoch: txnCapturePeriod.valueOf(),
  //                   };
  //                   this.logger.debug(`Metric : ${metricsAttributeId}`);
  //                   if (metricsAttributeId) {
  //                   const telemetryDisplayProperty: TelemetryDisplayProperty = {
  //                     metricsAttributeId: metricsAttributeId,
  //                     frequency: frequency,
  //                     unit: assetTypeCurrPerfSrc.unitId,
  //                     displayName: assetTypeCurrPerfSrc.label, //metricsAttributeId,
  //                     //displayName: metric.metricsAttributeId,
  //                     displayPriority: assetTypeCurrPerfSrc.displayPriority,
  //                     displayOrder: assetTypeCurrPerfSrc.displayOrder,
  //                   };
  //                   const currTelemetryPyldDTO = new CurrentTelemetryPayloadDTO(
  //                     metric,
  //                     telemetryDisplayProperty,
  //                   );
  //                   currTelemetryPyldDTOs.push(currTelemetryPyldDTO);
  //                   if (assetTypeCurrPerfSrc.isCapacity) {
  //                     utilizedCapacity = aggregatedValue;
  //                     updateTime = txnCaptureTimeInEpoch;
  //                     capacityDto = {
  //                       utilized: utilizedCapacity,
  //                       total: totalCapacity,
  //                       unit: capacityUnit,
  //                       updateTime: updateTime?.valueOf(),
  //                     };
  //                   }
  //                 } else {
  //                   throw new Error(`Metrics Attribute ID is null for asset (type) current performance source : ${JSON.stringify(assetTypeCurrPerfSrc)}` );
  //                 }
  //                 } catch (error) {
  //                   this.logger.error(
  //                     `${msgTemplate} : ${event} : Error in creating telemetry payload DTO : ${getTryCatchErrorStr(
  //                       error,
  //                     )}`,
  //                   );
  //                 }
  //               } else {
  //                 this.logger.debug(
  //                   `${msgTemplate} : ${event} : No asset curr perf src/curr telemetry records for asset type curr perf src : ${assetTypeCurrPerfSrc.id}`,
  //                 );
  //               }
  //             } else {
  //               capacityDto = {
  //                 utilized: 0,
  //                 total: totalCapacity,
  //                 unit: capacityUnit,
  //                 updateTime: new Date().valueOf(),
  //               };
  //             }
  //           }
  //         } else {
  //           capacityDto = {
  //             utilized: 0,
  //             total: totalCapacity,
  //             unit: capacityUnit,
  //             updateTime: new Date().valueOf(),
  //           };
  //         }
  //         const assetTypeCurrentPerformance: AssetTypeCurrentPerformance = {
  //           capacity: capacityDto,
  //           currentTelemetryPayloads: currTelemetryPyldDTOs,
  //         };
  //         return assetTypeCurrentPerformance;
  //       }
  //     } catch (error) {
  //       const srvcErr = `${event} : In try-catch : ${error}`;
  //       this.logger.error(`${msgTemplate} : ${srvcErr}`);
  //       throw new HttpException(srvcErr, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   }
  //   /*Pending virtual Device ID changes */
  //   /* async getAssetTypeCurrentPerformanceTelemetry(
  //     csvOrgIDs: string,
  //     assetTypeID: string,
  //   ) {
  //     const msgTemplate =
  //       this.serviceName + ' getAssetTypeCurrentPerformanceTelemetry() : ';
  //     const event = 'csvOrgIDs : ' + csvOrgIDs + ' assetType : ' + assetTypeID;
  //     this.logger.debug(`${msgTemplate} : Inputs : ${event}`);

  //     try {
  //       let capacityDto: CapacityDto | undefined;
  //       const descedentOrgsWithAssetsResp =
  //         await this.getDescedentsOrgsWithAssets(csvOrgIDs);
  //       throwErrIfSrvcRespFailure(descedentOrgsWithAssetsResp);
  //       throwErrIfNoRespData(descedentOrgsWithAssetsResp, 'No orgs');
  //       const rcvdOrgs = descedentOrgsWithAssetsResp.data as Org[];
  //       let totalCapacity = 0;
  //       let capacityUnit;
  //       //Get csvAssetIDs in org class
  //       const uniqueAssets = this.extractUniqueAssetsFromOrgs(rcvdOrgs);
  //       const assetIDsFilteredByGivenAssetType = new Array<string>();

  //       const assetsFilteredByGivenAssetType = uniqueAssets.filter(
  //         (asset) => assetTypeID == asset.assetTypeId,
  //       );
  //       if (_.isNil(assetsFilteredByGivenAssetType)) {
  //         const errMsg = `${event} : No assets for ${assetTypeID}`;
  //         throw new Error(errMsg);
  //       } else {
  //         for (const asset of assetsFilteredByGivenAssetType) {
  //           if (asset.capacityMeasure) {
  //             totalCapacity += asset.capacityMeasure;
  //           }
  //           assetIDsFilteredByGivenAssetType.push(asset.id);
  //         }
  //         capacityUnit = assetsFilteredByGivenAssetType[0].capacityUnitId;
  //         this.logger.debug(
  //           `Asset IDs filtered by asset type : ${assetIDsFilteredByGivenAssetType.toString()}`,
  //         );
  //         let assetTypeCurrPerfSrcsSearchCriteria: FindAssetTypeCurrentPerformanceSourceByMultipleIDsDto =
  //           {
  //             assetTypeId: assetTypeID,
  //             csvAssetIDs: assetIDsFilteredByGivenAssetType.join(','),
  //             displayOnlyForAssetType: true,
  //           };
  //         const assetTypeCurrPerfSrcsWithSelectedAssetsResp =
  //           await this.getAssetTypeCurrPerfSrcsBySelectedAssetIDs(
  //             assetTypeCurrPerfSrcsSearchCriteria,
  //           );

  //         throwErrIfSrvcRespFailure(assetTypeCurrPerfSrcsWithSelectedAssetsResp);

  //         throwErrIfNoRespData(
  //           assetTypeCurrPerfSrcsWithSelectedAssetsResp,
  //           `No asset type curr perf srcs for asset type : ${assetTypeID}`,
  //         );

  //         const assetTypeCurrPerfSrcs =
  //           assetTypeCurrPerfSrcsWithSelectedAssetsResp.data as AssetTypeCurrentPerformanceSource[];

  //         const assetIDSet: Set<string> = new Set();
  //         const virtualDeviceIDSet: Set<string> = new Set();
  //         const attributeSet: Set<string> = new Set();

  //         for (const assetTypeCurrPerfSrc of assetTypeCurrPerfSrcs) {
  //           const assetCurrPerfSrcs =
  //             assetTypeCurrPerfSrc.assetCurrentPerformanceSources as AssetCurrentPerformanceSource[];
  //           if (assetCurrPerfSrcs.length > 0) {
  //             for (const assetCurrPerfSrc of assetCurrPerfSrcs) {
  //               assetIDSet.add(assetCurrPerfSrc.assetId);
  //               virtualDeviceIDSet.add(assetCurrPerfSrc.virtualDeviceId);
  //               attributeSet.add(assetCurrPerfSrc.metricsAttributeId);
  //             }
  //           } else {
  //             this.logger.debug(
  //               `${msgTemplate} : ${event} : No asset curr perf srcs for asset type ${assetTypeCurrPerfSrc.assetTypeId}`,
  //             );
  //           }
  //         }
  //         const assetIDs = Array.from(assetIDSet).toString();
  //         const virtualDeviceIDs = Array.from(virtualDeviceIDSet).toString();
  //         const attributes = Array.from(attributeSet).toString();

  //         this.logger.debug(`AssetIDs : ${assetIDs}`);
  //         this.logger.debug(`virtual device ids : ${virtualDeviceIDs}`);
  //         this.logger.debug(`attributes : ${attributes}`);

  //         let currTelemetryPayloadsForMultipleAssetsURL = new URL(
  //           CURR_TELEMETRY_PAYLOAD_BY_MULTIPLE_IDs_URL,
  //           this.baseURL,
  //         );
  //         const currTelemetrySearchObject = {
  //           csvAssetIDs: assetIDs,
  //           csvVirtualDeviceIDs: virtualDeviceIDs,
  //           csvAttributes: attributes,
  //         };

  //         currTelemetryPayloadsForMultipleAssetsURL = getSearchParamsforURL(
  //           currTelemetryPayloadsForMultipleAssetsURL,
  //           JSON.stringify(currTelemetrySearchObject),
  //         );
  //         this.logger.debug(
  //           `${msgTemplate} : ${event} : ${decodeURI(
  //             currTelemetryPayloadsForMultipleAssetsURL.href,
  //           )}`,
  //         );
  //         const currTelemetryPayloadsForMultipleAssetsResp = await firstValueFrom(
  //           this.httpService.get<CurrentTelemetryPayload[]>(
  //             currTelemetryPayloadsForMultipleAssetsURL.toString(),
  //           ),
  //         );
  //         throwErrIfSrvcRespFailure(currTelemetryPayloadsForMultipleAssetsResp);
  //         const currTelemetryPayloads =
  //           currTelemetryPayloadsForMultipleAssetsResp.data as CurrentTelemetryPayload[];
  //         //const currTelemetryPayloadObjs: CurrentTelemetryPayload[] = [];
  //         const currTelemetryPyldDTOs: CurrentTelemetryPayloadDto[] = [];
  //         if (currTelemetryPayloads.length > 0) {
  //           const currTelemetryMap: Map<string, CurrentTelemetryPayload> =
  //             new Map();
  //           this.logger.debug(
  //             `No of curr Telemetries fetched : ${currTelemetryPayloads.length}`,
  //           );
  //           for (const currTelemetryPyld of currTelemetryPayloads) {
  //             const currTelemetryPyldObj = new CurrentTelemetryPayload(
  //               currTelemetryPyld,
  //             );
  //             currTelemetryMap.set(
  //               currTelemetryPyldObj.getKey(),
  //               currTelemetryPyldObj,
  //             );
  //           }
  //           for (const assetTypeCurrPerfSrc of assetTypeCurrPerfSrcs) {
  //             let utilizedCapacity = 0;
  //             let updateTime;
  //             const assetCurrPerfSrcs =
  //               assetTypeCurrPerfSrc.assetCurrentPerformanceSources;
  //             if (assetCurrPerfSrcs.length > 0) {
  //               let aggregatedValue = 0;
  //               let counter = 0;
  //               let txnCaptureTime = new Date(0);
  //               let frequency = MetricsFrequency.INSTANT; //Default value is provided. Overide is below;
  //               const metricsAttributeId =
  //                 assetCurrPerfSrcs[0].metricsAttributeId;
  //               for (const assetCurrPerfSrc of assetCurrPerfSrcs) {
  //                 const assetCurrPerfSrcObj = new AssetCurrentPerformanceSource(
  //                   assetCurrPerfSrc,
  //                 );
  //                 const key = assetCurrPerfSrcObj.getKey();
  //                 const currTelemetryPyld = currTelemetryMap.get(key);
  //                 if (currTelemetryPyld) {
  //                   frequency = currTelemetryPyld.metric.frequency;
  //                   const incomingValue = currTelemetryPyld.metric.measure;
  //                   let sumOfAllValues = 0;
  //                   txnCaptureTime = maximumDate(
  //                     txnCaptureTime,
  //                     currTelemetryPyld.metric.txnCaptureTime,
  //                   );
  //                   switch (assetTypeCurrPerfSrc.aggregation) {
  //                     case 'sum':
  //                       counter++;
  //                       aggregatedValue =
  //                         aggregatedValue + parseFloat(incomingValue);
  //                       break;
  //                     case 'max':
  //                       counter++;
  //                       aggregatedValue < parseFloat(incomingValue)
  //                         ? (aggregatedValue = parseFloat(
  //                             currTelemetryPyld?.metric.measure,
  //                           ))
  //                         : null;
  //                       break;
  //                     case 'avg':
  //                       counter++;
  //                       sumOfAllValues =
  //                         sumOfAllValues + parseFloat(incomingValue);
  //                       aggregatedValue = sumOfAllValues / counter;
  //                       break;
  //                     default:
  //                       this.logger.error(
  //                         `${msgTemplate} : ${event} : Invalid aggregation : ${assetTypeCurrPerfSrc.aggregation}`,
  //                       );
  //                       break;
  //                   }
  //                 } else {
  //                   this.logger.error(
  //                     `${msgTemplate} ${event}: Measure not available for ${key}`,
  //                   );
  //                 }
  //               }
  //               this.logger.debug(
  //                 `Input to telemetryMeasure : ${assetTypeCurrPerfSrc.label}`,
  //               );
  //               if (counter > 0) {
  //                 const metric = new MetricDto({
  //                   //metricsAttributeId: assetCurrPerfSrcs[0].metricsAttributeId,
  //                   measure: aggregatedValue.toString(),
  //                   unit: assetTypeCurrPerfSrc.unitId,
  //                   txnCaptureTime: txnCaptureTime,
  //                 });
  //                 this.logger.debug(`Metric : ${metricsAttributeId}`);
  //                 const telemetryDisplayProperty: TelemetryDisplayProperty = {
  //                   metricsAttributeId: metricsAttributeId,
  //                   frequency: frequency,
  //                   displayName: metricsAttributeId,
  //                   //displayName: metric.metricsAttributeId,
  //                   displayPriority: assetTypeCurrPerfSrc.displayPriority,
  //                   displayOrder: assetTypeCurrPerfSrc.displayOrder,
  //                 };
  //                 const currTelemetryPyldDTO = new CurrentTelemetryPayloadDto(
  //                   //new MetricDto(metric),
  //                   metric,
  //                   telemetryDisplayProperty,
  //                 );
  //                 currTelemetryPyldDTOs.push(currTelemetryPyldDTO);
  //                 if (assetTypeCurrPerfSrc.isCapacity) {
  //                   utilizedCapacity = aggregatedValue;
  //                   updateTime = txnCaptureTime;
  //                   capacityDto = {
  //                     utilized: utilizedCapacity,
  //                     total: totalCapacity,
  //                     unit: capacityUnit,
  //                     updateTime: updateTime?.valueOf(),
  //                   };
  //                 }
  //               } else {
  //                 this.logger.debug(
  //                   `${msgTemplate} : ${event} : No asset curr perf src/curr telemetry records for asset type curr perf src : ${assetTypeCurrPerfSrc.id}`,
  //                 );
  //               }
  //             } else {
  //               capacityDto = {
  //                 utilized: 0,
  //                 total: totalCapacity,
  //                 unit: capacityUnit,
  //                 updateTime: new Date().valueOf(),
  //               };
  //             }
  //           }
  //         } else {
  //           capacityDto = {
  //             utilized: 0,
  //             total: totalCapacity,
  //             unit: capacityUnit,
  //             updateTime: new Date().valueOf(),
  //           };
  //         }
  //         const assetTypeCurrentPerformance: AssetTypeCurrentPerformance = {
  //           capacity: capacityDto,
  //           currentTelemetryPayloads: currTelemetryPyldDTOs,
  //         };
  //         return assetTypeCurrentPerformance;
  //       }
  //     } catch (error) {
  //       const srvcErr = `${event} : In try-catch : ${error}`;
  //       this.logger.error(`${msgTemplate} : ${srvcErr}`);
  //       throw new HttpException(srvcErr, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   } */
  //   /*Pending virtual Device ID changes */
  //   /* async getAssetTypeCapacity(csvOrgIDs: string, assetTypeID: string) {
  //     const event =
  //       'Inputs : csvOrgIDs : ' + csvOrgIDs + ' assetType : ' + assetTypeID;
  //     const msgTemplate = this.serviceName + ' getAssetTypeCapacity() : ' + event;

  //     try {
  //       this.logger.debug(`${msgTemplate} : Start`);
  //       const descedentOrgsWithAssetsResp =
  //         await this.getDescedentsOrgsWithAssets(csvOrgIDs);
  //       throwErrIfSrvcRespFailure(descedentOrgsWithAssetsResp);
  //       throwErrIfNoRespData(descedentOrgsWithAssetsResp, 'No orgs');
  //       const rcvdOrgs = descedentOrgsWithAssetsResp.data as Org[];
  //       //Get csvAssetIDs in org class
  //       const uniqueAssets = this.extractUniqueAssetsFromOrgs(rcvdOrgs);
  //       if (_.isNil(uniqueAssets)) {
  //         return {};
  //       } else {
  //         const csvAssetIDs = uniqueAssets.map((asset) => asset.id).join(',');

  //         const assetURL = new URL(ASSETS_BY_MULTIPLE_IDs_URL, this.baseURL);
  //         assetURL.searchParams.append('csvAssetIDs', csvAssetIDs);
  //         //assetURL.searchParams.append('relations', 'capacityUnit');

  //         this.logger.debug(`${msgTemplate} : Assets URL : ${assetURL.href}`);

  //         const assetURLResp = await firstValueFrom(
  //           this.httpService.get<Asset[]>(assetURL.href),
  //         );

  //         throwErrIfSrvcRespFailure(assetURLResp);

  //         const receivedAssets = assetURLResp.data;

  //         const currPerfTelemetryPyldMap = new Map<
  //           string,
  //           CurrentTelemetryPayload
  //         >();

  //         let capacity = 0;
  //         let capacityUnit;
  //         for (const asset of receivedAssets) {
  //           capacity += asset.capacityMeasure;
  //           if (_.isEmpty(asset.currentTelemetryPayloads)) {
  //             this.logger.warn(
  //               `${msgTemplate} : Current telemetry payloads are not available for ${asset.id}`,
  //             );
  //           } else {
  //             this.logger.warn(
  //               `${msgTemplate} : Current telemetry payloads are available for ${asset.id}`,
  //             );
  //             for (const currTelemetryPyld of asset.currentTelemetryPayloads!) {
  //               const currTelemetryPyldObj = new CurrentTelemetryPayload(
  //                 currTelemetryPyld,
  //               );
  //               currPerfTelemetryPyldMap.set(
  //                 currTelemetryPyldObj.getKey(),
  //                 currTelemetryPyldObj,
  //               );
  //             }
  //             this.logger.debug(
  //               `${msgTemplate} : Current telemetry payload map : ${currPerfTelemetryPyldMap.size}`,
  //             );
  //             for (const key of currPerfTelemetryPyldMap.keys()) {
  //               this.logger.debug(`Key is : ${key}`);
  //             }
  //           }
  //         }

  //         const assetCurrPerfSrcsURL = new URL(
  //           ASSET_CRNT_PERF_SRC_CAPACITY_URL,
  //           this.baseURL,
  //         );
  //         assetCurrPerfSrcsURL.searchParams.append('csvAssetIDs', csvAssetIDs);
  //         this.logger.debug(
  //           `${msgTemplate} : Asset Curr Perf Srcs URL : ${assetCurrPerfSrcsURL.href} : Start`,
  //         );

  //         const assetCurrPerfSrcsResp = await firstValueFrom(
  //           this.httpService.get<AssetCurrentPerformanceSource[]>(
  //             assetCurrPerfSrcsURL.href,
  //           ),
  //         );

  //         throwErrIfSrvcRespFailure(assetCurrPerfSrcsResp);
  //         throwErrIfNoRespData(
  //           assetCurrPerfSrcsResp,
  //           `Capacity is not configured for ${assetTypeID}`,
  //         );
  //         const assetCurrPerfSrcs = assetCurrPerfSrcsResp.data;

  //         let currentGeneration = 0;
  //         let updatedTime = new Date(0).valueOf();

  //         this.logger.debug(
  //           `${msgTemplate} : No of assetCurrPerfSrcs are : ${assetCurrPerfSrcs.length}`,
  //         );
  //         for (const assetCurrPerfSrc of assetCurrPerfSrcs) {
  //           this.logger.debug(
  //             `${msgTemplate} : Processing assetCurrPerfSrc of ${assetCurrPerfSrc.assetId}`,
  //           );
  //           const assetCurrPerfSrcObj = new AssetCurrentPerformanceSource(
  //             assetCurrPerfSrc,
  //           );
  //           this.logger.debug(
  //             `${msgTemplate} : Searching for key : ${assetCurrPerfSrcObj.getKey()}`,
  //           );
  //           const currTelemtryPyld = currPerfTelemetryPyldMap.get(
  //             assetCurrPerfSrcObj.getKey(),
  //           );
  //           this.logger.debug(
  //             `${msgTemplate} : Current generation of ${assetCurrPerfSrc.assetId},${assetCurrPerfSrc.virtualDeviceId},${assetCurrPerfSrc.metricsAttributeId} is : ${currTelemtryPyld?.metric.measure}`,
  //           );
  //           if (currTelemtryPyld) {
  //             currentGeneration += parseFloat(currTelemtryPyld?.metric.measure);
  //             capacityUnit = currTelemtryPyld.metric.unit;
  //             if (currTelemtryPyld.metric.txnCaptureTimeInEpoch) {
  //               updatedTime =
  //                 updatedTime > currTelemtryPyld.metric.txnCaptureTimeInEpoch
  //                   ? updatedTime
  //                   : currTelemtryPyld.metric.txnCaptureTimeInEpoch;
  //             }
  //           } else {
  //             this.logger.warn(
  //               `${msgTemplate} : Utilized capacity is not available for ${assetCurrPerfSrcObj.getKey()}`,
  //             );
  //           }
  //         }
  //         const capacityDto: CapacityDto = {
  //           utilized: currentGeneration,
  //           total: capacity,
  //           unit: capacityUnit,
  //           updateTime: updatedTime,
  //         };
  //         this.logger.debug(
  //           `${msgTemplate} : Capacity response : ${JSON.stringify(capacityDto)}`,
  //         );
  //         return capacityDto;
  //       }
  //     } catch (error) {
  //       const srvcErr = `${event} : In try-catch : ${error}`;
  //       this.logger.error(`${msgTemplate} : ${srvcErr}`);
  //       throw new HttpException(srvcErr, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : End`);
  //     }
  //   } */

  //   private async getAssetTypeCurrPerfSrcsBySelectedAssetIDs(
  //     searchCriteria: FindAssetTypeCurrentPerformanceSourceByMultipleIDsDto,
  //   ) {
  //     return await this.assetTypeCurrentPerformanceSourceService.findByMultipleIDs(
  //       searchCriteria,
  //     );
  //     /*  let assetTypeCurrPerfSrcWithSelectedAssetsURL = new URL(
  //       ASSET_TYPE_CRNT_PERF_SRC_BY_MULTIPLE_IDs_URL,
  //       this.baseURL,
  //     );
  //     assetTypeCurrPerfSrcWithSelectedAssetsURL = getSearchParamsforURL(
  //       assetTypeCurrPerfSrcWithSelectedAssetsURL,
  //       JSON.stringify(searchCriteria),
  //     );

  //     this.logger.debug(
  //       `Asset type curr perf src URL : ${assetTypeCurrPerfSrcWithSelectedAssetsURL.href}`,
  //     );
  //     const assetTypeCurrPerfSrcsWithSelectedAssetsResp = await firstValueFrom(
  //       this.httpService.get<AssetTypeCurrentPerformanceSource[]>(
  //         assetTypeCurrPerfSrcWithSelectedAssetsURL.toString(),
  //       ),
  //     );
  //     return assetTypeCurrPerfSrcsWithSelectedAssetsResp; */
  //   }

  //   private async getDescendentsOrgs(csvOrgIDs: string, withAssets = false) {
  //     const searchObj = {
  //       csvOrgIDs: csvOrgIDs,
  //     };

  //     return await this.orgService.findDescendents(searchObj, withAssets);
  //   }

  //   async getAlertsByMultipleIDs(
  //     findAlertsOtherParamsDto: FindAlertsByMultipleIDsDTO,
  //   ) {
  //     const msgTemplate = `${this.serviceName} : ${this.getAlertsByMultipleIDs.name}`;
  //     const event = `Input : Multiple Params : ${JSON.stringify(
  //       findAlertsOtherParamsDto,
  //     )}`;
  //     //let uniqueAssetIDs;
  //     try {
  //       if (findAlertsOtherParamsDto.csvOrgIDs) {
  //         const orgs = await this.getDescendentsOrgs(
  //           findAlertsOtherParamsDto.csvOrgIDs,
  //         );
  //         findAlertsOtherParamsDto.csvOrgIDs = orgs
  //           .map((org) => org.id)
  //           .join(',');
  //       }

  //       const alerts = await this.alertService.findForATimePeriod3(
  //         findAlertsOtherParamsDto,
  //       );
  //       return alerts;
  //       //return currentOpenAlertResp.data;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${event} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : ${event} : End`);
  //     }
  //   }

  //   async getCurrentOpenAlertsFromMultipleParams(
  //     findCurrentOpenAlertOtherParamsDto: FindAlertsByMultipleIDsDTO,
  //   ) {
  //     const msgTemplate = this.serviceName + ' getAlerts() : ';
  //     const event = `Input : Multiple Params : ${JSON.stringify(
  //       findCurrentOpenAlertOtherParamsDto,
  //     )}`;
  //     //let uniqueAssetIDs;
  //     try {
  //       const uniqueAssetIDs = await this.getUniqueAssets(
  //         findCurrentOpenAlertOtherParamsDto,
  //       );

  //       findCurrentOpenAlertOtherParamsDto.csvOrgIDs
  //         ? delete findCurrentOpenAlertOtherParamsDto.csvOrgIDs
  //         : null;
  //       findCurrentOpenAlertOtherParamsDto.csvAssetTypeIDs
  //         ? delete findCurrentOpenAlertOtherParamsDto.csvAssetTypeIDs
  //         : null;

  //       this.logger.debug(`${msgTemplate} : Asset IDs : ${uniqueAssetIDs}`);
  //       if (uniqueAssetIDs.length > 0) {
  //         findCurrentOpenAlertOtherParamsDto.csvAssetIDs =
  //           uniqueAssetIDs.join(',');
  //       }

  //       const currentOpenAlerts =
  //         await this.currentOpenAlertService.findByMultipleIDs(
  //           findCurrentOpenAlertOtherParamsDto,
  //         );

  //       /* this.logger.debug(`${msgTemplate} : ${event} : Start`);

  //       const currentOpenAlertURL = new URL(
  //         CURRENT_OPEN_ALERT_FIND_BY_MULTIPLE_IDS,
  //         this.baseURL,
  //       );

  //       currentOpenAlertURL.searchParams.append(
  //         'csvAssetIDs',
  //         uniqueAssetIDs.join(','),
  //       );
  //       findCurrentOpenAlertOtherParamsDto.csvVirtualDeviceIDs
  //         ? currentOpenAlertURL.searchParams.append(
  //             'csvVirtualDeviceIDs',
  //             findCurrentOpenAlertOtherParamsDto.csvVirtualDeviceIDs,
  //           )
  //         : null;

  //       this.logger.debug(
  //         `${msgTemplate} : ${event} : Current Open Alert URL : ${currentOpenAlertURL.href}`,
  //       );
  //       const currentOpenAlertResp = await firstValueFrom(
  //         this.httpService.get<CurrentOpenAlert[]>(currentOpenAlertURL.href),
  //       );
  //       throwErrIfSrvcRespFailure(currentOpenAlertResp);
  //       const currentOpenAlerts = currentOpenAlertResp.data as CurrentOpenAlert[]; */
  //       return currentOpenAlerts.map(
  //         (currentOpenAlert) => new CurrentOpenAlertDto(currentOpenAlert),
  //       );
  //       //return currentOpenAlertResp.data;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${event} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : ${event} : End`);
  //     }
  //   }
  //   private async getUniqueAssets(
  //     findCurrentOpenAlertOtherParamsDto: FindAlertsByMultipleIDsDTO,
  //   ): Promise<string[]> {
  //     let uniqueAssetIDs: string[] = [];
  //     if (!findCurrentOpenAlertOtherParamsDto.csvAssetIDs) {
  //       let assets = await this.getAllDescedentUniqueAssets({
  //         csvOrgIDs: findCurrentOpenAlertOtherParamsDto.csvOrgIDs,
  //         csvAssetTypeIDs: findCurrentOpenAlertOtherParamsDto.csvAssetTypeIDs,
  //       });
  //       const assetIDs = assets.map((asset) => asset.id);
  //       uniqueAssetIDs = _.uniq(assetIDs);
  //     } else {
  //       uniqueAssetIDs = _.uniq(
  //         findCurrentOpenAlertOtherParamsDto.csvAssetIDs.split(','),
  //       );
  //     }
  //     return uniqueAssetIDs;
  //   }

  //   /* async getCurrentOpenAlerts(csvOrgIDs: string) {
  //     const msgTemplate = this.serviceName + ' getAlerts() : ';
  //     const event = `Input : Org IDs : ${csvOrgIDs}`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : ${event} : Start`);
  //       const assets = await this.getAllDescedentAssetsFromOrgs(csvOrgIDs);
  //       const csvAssetIDs = assets.map((asset) => asset.id);
  //       const uniqueCSVAssetIDs = _.uniq(csvAssetIDs);

  //       const currentOpenAlertURL = new URL(
  //         CURRENT_OPEN_ALERT_FIND_BY_MULTIPLE_IDS,
  //         this.baseURL,
  //       );
  //       currentOpenAlertURL.searchParams.append(
  //         'csvAssetIDs',
  //         uniqueCSVAssetIDs.toString(),
  //       );
  //       this.logger.debug(
  //         `${msgTemplate} : ${event} : Current Open Alert URL : ${currentOpenAlertURL.href}`,
  //       );
  //       const currentOpenAlertResp = await firstValueFrom(
  //         this.httpService.get<CurrentOpenAlert[]>(currentOpenAlertURL.href),
  //       );
  //       throwErrIfSrvcRespFailure(currentOpenAlertResp);
  //       const currentOpenAlerts = currentOpenAlertResp.data as CurrentOpenAlert[];
  //       return currentOpenAlerts.map(
  //         (currentOpenAlert) => new CurrentOpenAlertDto(currentOpenAlert),
  //       );
  //       //return currentOpenAlertResp.data;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${event} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : ${event} : End`);
  //     }
  //   } */
  //  async getAssetCurrentPerformanceTelemetry(assetId: string) {
  //     const fnName = this.getAssetCurrentPerformanceTelemetry.name;
  //     /* let msgTemplate =
  //       this.serviceName +
  //       ' getAssetCurrentPerformanceTelemetry() assetId : ' +
  //       assetId; */
  //     this.logger.debug(`${fnName} : Input assetId : ${assetId} : Start`,
  //     );
  //     const cTPLDTOs = [];

  //     const aCPSs =
  //       await this.assetCurrentPerformanceSourceService.findByMultipleIDs({
  //         csvAssetIDs: assetId,
  //       });
  //     this.logger.debug(
  //       `${fnName} : No of Asset Current Performance Sources : ${aCPSs.length}`,
  //     );
  //     throwErrIfNoData<AssetCurrentPerformanceSource>(
  //       aCPSs,
  //       `No asset current performance sources for Asset ${assetId}`,
  //     );

  //     /* const assetCurrPerfSrcWithRltnsURL = new URL(
  //       ASSET_CRNT_PERF_SRC_BY_MULTIPLE_IDs_URL,
  //       this.baseURL,
  //     );
  //     assetCurrPerfSrcWithRltnsURL.searchParams.append('csvAssetIDs', assetId);
  //     this.logger.debug(
  //       `${msgTemplate} : ${decodeURI(assetCurrPerfSrcWithRltnsURL.href)}`,
  //     );
  //     const assetCurrPerfSrcsResp = await firstValueFrom(
  //       this.httpService.get<AssetCurrentPerformanceSource[]>(
  //         assetCurrPerfSrcWithRltnsURL.toString(),
  //       ),
  //     );
  //     throwErrIfSrvcRespFailure(assetCurrPerfSrcsResp);
  //     throwErrIfNoRespData(
  //       assetCurrPerfSrcsResp,
  //       `${msgTemplate} : No Asset Current Performance sources for ${assetId} `,
  //     );

  //     const assetCurrentPerfSrcs = assetCurrPerfSrcsResp.data; */
  //     /* const virtualDeviceIDs = [];
  //     const metricsAttributeIDs = [];*/
  //     const assetCurrPerfSrcByKey = new Map<
  //       String,
  //       AssetCurrentPerformanceSource
  //     >();
  //     const findCTPLDTOs: FindCurrentTelemetryDto[] = [];
  //     for (const assetCurrPerfSrc of aCPSs) {
  //       const aCPSObj = new AssetCurrentPerformanceSource(assetCurrPerfSrc);
  //       findCTPLDTOs.push({
  //         assetId: aCPSObj.assetId,
  //         virtualDeviceId: aCPSObj.virtualDeviceId ?? IsNull(),
  //         metric: {
  //           metricsAttributeId: aCPSObj.metricsAttributeId,
  //         },
  //       });
  //       /* virtualDeviceIDs.push(assetCurrPerfSrc.virtualDeviceId);
  //       metricsAttributeIDs.push(assetCurrPerfSrc.metricsAttributeId);
  //       const assetCurrPerSrcObj = new AssetCurrentPerformanceSource(
  //         assetCurrPerfSrc,
  //       );*/
  //       assetCurrPerfSrcByKey.set(aCPSObj.getKey(), aCPSObj);
  //     }

  //     const cTPLs =
  //       await this.currentTelemetryPayloadService.findByMultipleConditions(
  //         findCTPLDTOs,
  //       );
  //     /* const currTelemetryPayloadsSearchCriteria: FindCurrentTelemetryPayloadsByMultipleIDs =
  //       {
  //         csvAssetIDs: assetId,
  //         csvVirtualDeviceIDs: virtualDeviceIDs.join(','),
  //         csvMetricsAttributeIDs: metricsAttributeIDs.join(','),
  //       };

  //     const currTelemetryPayloads =
  //       await this.getCurrentTelemetryPayloadsByMultipleIDs(
  //         currTelemetryPayloadsSearchCriteria,
  //       ); */
  //     this.logger.debug(
  //       `${fnName} : No of current telemetry payloads : ${cTPLs.length}`,
  //     );
  //     //let currentTelemetryByKey = new Map<String, CurrentTelemetryPayload>();
  //     for (const cTPL of cTPLs) {
  //       const currTelemetryPayloadObj = new CurrentTelemetryPayload(cTPL);
  //       const assetCurrPefSrc = assetCurrPerfSrcByKey.get(
  //         currTelemetryPayloadObj.getKey(),
  //       );
  //       if (assetCurrPefSrc) {
  //         const telemetryDisplayProperty: TelemetryDisplayProperty = {
  //           metricsAttributeId: currTelemetryPayloadObj.metric.metricsAttributeId,
  //           frequency: currTelemetryPayloadObj.metric.frequency,
  //           displayName: assetCurrPefSrc.assetTypeCurrentPerformanceSource.label, //currTelemetryPayloadObj.metric.metricsAttributeId,
  //           displayPriority:
  //             assetCurrPefSrc.assetTypeCurrentPerformanceSource.displayPriority,
  //           displayOrder:
  //             assetCurrPefSrc.assetTypeCurrentPerformanceSource.displayOrder,
  //           unit: currTelemetryPayloadObj.metric.unit,
  //         };

  //         this.logger.debug(
  //           `${fnName} : Telemetry display property : ${JSON.stringify(
  //             telemetryDisplayProperty,
  //           )}`,
  //         );
  //         //const telemetryDevice = new TelemetryDevice(currentTelemetryPayload);
  //         const telemetryDevice = TelemetryDevice.createFromTelemetry(
  //           currTelemetryPayloadObj,
  //         );
  //         this.logger.debug(
  //           `${fnName} : Telemetry Device : ${JSON.stringify(
  //             telemetryDevice,
  //           )}`,
  //         );
  //         const currentTelemetryPayloadDto = new CurrentTelemetryPayloadDTO(
  //           getMetricDTO(currTelemetryPayloadObj.metric),
  //           //new MetricDto(currTelemetryPayloadObj.metric),
  //           //currentTelemetryPayload.metric,
  //           telemetryDisplayProperty,
  //           telemetryDevice,
  //         );
  //         cTPLDTOs.push(currentTelemetryPayloadDto);
  //       }
  //     }
  //     return cTPLDTOs;
  //     /*  this.logger.debug(
  //       `${msgTemplate} : No of current telemetries : ${currentTelemetryByKey.size}`,
  //     );
  //     for (const key of currentTelemetryByKey.keys()) {
  //       this.logger.debug(`${msgTemplate} : current telemetry key : ${key}`);
  //     }
  //     for (const assetCurrPerfSrc of assetCurrentPerfSrcs) {
  //       const rcvdAssetCurrPerfSrc = new AssetCurrentPerformanceSource(
  //         assetCurrPerfSrc,
  //       );
  //       this.logger.debug(
  //         `Asset curr perf key : ${rcvdAssetCurrPerfSrc.getKey()}`,
  //       );
  //       const currentTelemetryPayload = currentTelemetryByKey.get(
  //         rcvdAssetCurrPerfSrc.getKey(),
  //       )!;
  //       if (currentTelemetryPayload) {
  //         //const metric = new Metric(currentTelemetryPayload.metric);
  //         this.logger.debug(
  //           `${msgTemplate} : Metric : ${JSON.stringify(
  //             currentTelemetryPayload.metric,
  //           )}`,
  //         );
  //         const telemetryDisplayProperty: TelemetryDisplayProperty = {
  //           metricsAttributeId: currentTelemetryPayload.metric.metricsAttributeId,
  //           frequency: currentTelemetryPayload.metric.frequency,
  //           displayName: currentTelemetryPayload.metric.metricsAttributeId,
  //           displayPriority:
  //             rcvdAssetCurrPerfSrc.assetTypeCurrentPerformanceSource
  //               .displayPriority,
  //           displayOrder:
  //             rcvdAssetCurrPerfSrc.assetTypeCurrentPerformanceSource.displayOrder,
  //         };

  //         this.logger.debug(
  //           `${msgTemplate} : Telemetry display property : ${JSON.stringify(
  //             telemetryDisplayProperty,
  //           )}`,
  //         );
  //         //const telemetryDevice = new TelemetryDevice(currentTelemetryPayload);
  //         const telemetryDevice = TelemetryDevice.createFromTelemetry(
  //           currentTelemetryPayload,
  //         );
  //         this.logger.debug(
  //           `${msgTemplate} : Telemetry Device : ${JSON.stringify(
  //             telemetryDevice,
  //           )}`,
  //         );
  //         const currentTelemetryPayloadDto = new CurrentTelemetryPayloadDTO(
  //           new MetricDto(currentTelemetryPayload.metric),
  //           //currentTelemetryPayload.metric,
  //           telemetryDisplayProperty,
  //           telemetryDevice,
  //         );
  //         this.logger.debug(
  //           `${msgTemplate} : Current telemetry payload dto : ${JSON.stringify(
  //             currentTelemetryPayloadDto,
  //           )}`,
  //         );
  //         currentTelemetryPayloadDTOs.push(currentTelemetryPayloadDto);
  //       }
  //     }
  //     this.logger.debug(
  //       `${msgTemplate} : output : ${JSON.stringify(
  //         [...currentTelemetryPayloadDTOs],
  //         null,
  //         2,
  //       )}`,
  //     );
  //     return currentTelemetryPayloadDTOs; */
  //   }
  //   /* async getAssetCurrentPerformanceTelemetry2(assetId: string) {
  //     const fnName = this.getAssetCurrentPerformanceTelemetry2.name;
  //     this.logger.debug(`${fnName} : Input assetId : ${assetId} : Start`,
  //     );
  //     const cTPLDTOs = [];

  //     const asset = await this.assetService.getAssetPerformance(assetId);

  //     if (asset) {
  //       const aCPSs = asset.assetCurrentPerformanceSources;
  //       const cTPLs = asset.currentTelemetryPayloads;

  //       if (aCPSs && aCPSs.length > 0 ) {
  //         if (cTPLs && cTPLs.length > 0) {
  //         const aCPSsByKey = _.groupBy(aCPSs, (aCPS) => aCPS.getKey());
  //         //const cTPLsByKey = _.groupBy(cTPLs, (cTPL) => cTPL.getKey());

  //         this.logger.debug(
  //         `${fnName} : No of current telemetry payloads : ${cTPLs?.length}`);
  //         this.logger.debug(
  //           `${fnName} : CTPLs : ${JSON.stringify([...cTPLs])}`,
  //         );
  //         this.logger.debug(
  //           `${fnName} : No of asset current performance sources : ${aCPSs?.length}`,
  //         );
  //         this.logger.debug(
  //           `${fnName} : ACPS : ${JSON.stringify([...aCPSs])}`,
  //         );
  //         for (const cTPL of cTPLs) {
  //           const currTelemetryPayloadObj = new CurrentTelemetryPayload(cTPL);
  //           const assetCurrPefSrc = aCPSsByKey[currTelemetryPayloadObj.getKey()];
  //           if (assetCurrPefSrc && assetCurrPefSrc.length > 0) {
  //             const aCPS = assetCurrPefSrc[0];
  //             const telemetryDisplayProperty: TelemetryDisplayProperty = {
  //               metricsAttributeId: currTelemetryPayloadObj.metric.metricsAttributeId,
  //               frequency: currTelemetryPayloadObj.metric.frequency,
  //               displayName: aCPS.assetTypeCurrentPerformanceSource.label, //currTelemetryPayloadObj.metric.metricsAttributeId,
  //               displayPriority:
  //                 aCPS.assetTypeCurrentPerformanceSource.displayPriority,
  //               displayOrder:
  //                 aCPS.assetTypeCurrentPerformanceSource.displayOrder,
  //               unit: currTelemetryPayloadObj.metric.unit,
  //             };
  //             this.logger.debug(`${fnName} : Telemetry display property : ${JSON.stringify(
  //             telemetryDisplayProperty,)}`,);
  //             const telemetryDevice = TelemetryDevice.createFromTelemetry(
  //               currTelemetryPayloadObj,
  //             );
  //             this.logger.debug(`${fnName} : Telemetry Device : ${JSON.stringify(
  //             telemetryDevice,)}`,);
  //             const currentTelemetryPayloadDto = new CurrentTelemetryPayloadDTO(
  //               getMetricDTO(currTelemetryPayloadObj.metric),
  //               //new MetricDto(currTelemetryPayloadObj.metric),
  //               //currentTelemetryPayload.metric,
  //               telemetryDisplayProperty,
  //               telemetryDevice,
  //             );
  //             cTPLDTOs.push(currentTelemetryPayloadDto);
  //           }    
  //         }  
  //       }
  //       else {
  //         const errMsg = `No measures are available for ${assetId}`;
  //         this.logger.warn(`${fnName} : ${errMsg}`);
  //       }      
  //     } else {
  //       const errMsg = `Asset performance critieria is not defined for ${assetId}`;
  //       this.logger.error(`${fnName} : ${errMsg}`);
  //       throw new Error(`${fnName} : ${errMsg}`);
  //     }
  //     return cTPLDTOs;

  //   }
  //   } */

  //   /* private currTelemetryGroupBy(currTelemetry: CurrentTelemetryPayloadDto) {
  //     return currTelemetry.telemetryDevice;
  //   } */

  //   private async getCurrentTelemetryPayloadsByMultipleIDs(
  //     findCurrentTelemetryPayloadsByMultipleIDs: FindCurrentTelemetryPayloadsByMultipleIDs,
  //   ) {
  //     const event = `Inputs : ${JSON.stringify(
  //       findCurrentTelemetryPayloadsByMultipleIDs,
  //     )}`;
  //     const fnIdentifier =
  //       'getCurrentTelemetryPayloadsByMultipleIDs()' + ' ' + event;
  //     try {
  //       this.logger.debug(`${fnIdentifier} : Start`);
  //       return await this.currentTelemetryPayloadService.findByMultipleIDs(
  //         findCurrentTelemetryPayloadsByMultipleIDs,
  //       );
  //       /* const currTelemetryPayloadURL = new URL(
  //         CURR_TELEMETRY_PAYLOAD_BY_MULTIPLE_IDs_URL,
  //         this.baseURL,
  //       );

  //       getSearchParamsforURL(
  //         currTelemetryPayloadURL,
  //         JSON.stringify(findCurrentTelemetryPayloadsByMultipleIDs),
  //       );
  //       this.logger.debug(
  //         `${fnIdentifier} : Current Telemetry Payload URL : ${currTelemetryPayloadURL.href}`,
  //       );
  //       const currTelemetryPayloadsResp = await firstValueFrom(
  //         this.httpService.get<CurrentTelemetryPayload[]>(
  //           currTelemetryPayloadURL.href,
  //         ),
  //       );
  //       throwErrIfSrvcRespFailure(currTelemetryPayloadsResp);
  //       return currTelemetryPayloadsResp.data; */
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       throw new Error(errMsg);
  //     } finally {
  //       this.logger.debug(`${fnIdentifier} : End`);
  //     }
  //   }

  //   /*  private async getCurrentTelemetryPayloads(
  //     assetId: string,
  //     msgTemplate: string,
  //     virtualDeviceId?: string,
  //   ) {
  //     const event = `Inputs : Asset ID : ${assetId}, Virtual Device ID : ${virtualDeviceId}`;
  //     const fnIdentifier =
  //       msgTemplate + ' getCurrentTelemetryPayloads()' + ' ' + event;
  //     try {
  //       this.logger.debug(`${fnIdentifier} : Start`);
  //       const currTelemetryPayloadURL = new URL(
  //         CURR_TELEMETRY_PAYLOAD_URL,
  //         this.baseURL,
  //       );
  //       currTelemetryPayloadURL.searchParams.append('assetId', assetId);
  //       virtualDeviceId
  //         ? currTelemetryPayloadURL.searchParams.append(
  //             'virtualDeviceId',
  //             virtualDeviceId,
  //           )
  //         : null;
  //       this.logger.debug(
  //         `${fnIdentifier} : Current Telemetry Payload URL : ${currTelemetryPayloadURL.href}`,
  //       );
  //       const currTelemetryPayloadsResp = await firstValueFrom(
  //         this.httpService.get<CurrentTelemetryPayload[]>(
  //           currTelemetryPayloadURL.href,
  //         ),
  //       );
  //       throwErrIfSrvcRespFailure(currTelemetryPayloadsResp);
  //       return currTelemetryPayloadsResp.data;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       throw new Error(errMsg);
  //     } finally {
  //       this.logger.debug(`${fnIdentifier} : End`);
  //     }
  //   } */

  //   /* private async getCurrentTelemetryPayloads(
  //     assetId: string,
  //     msgTemplate: string,
  //     virtualDeviceId?: string,
  //   ) {
  //     const event = `Inputs : Asset ID : ${assetId}, Virtual Device ID : ${virtualDeviceId}`;
  //     const fnIdentifier =
  //       msgTemplate + ' getCurrentTelemetryPayloads()' + ' ' + event;
  //     try {
  //       this.logger.debug(`${fnIdentifier} : Start`);
  //       const currTelemetryPayloadURL = new URL(
  //         CURR_TELEMETRY_PAYLOAD_URL,
  //         this.baseURL,
  //       );
  //       currTelemetryPayloadURL.searchParams.append('assetId', assetId);
  //       virtualDeviceId
  //         ? currTelemetryPayloadURL.searchParams.append(
  //             'virtualDeviceId',
  //             virtualDeviceId,
  //           )
  //         : null;
  //       this.logger.debug(
  //         `${fnIdentifier} : Current Telemetry Payload URL : ${currTelemetryPayloadURL.href}`,
  //       );
  //       const currTelemetryPayloadsResp = await firstValueFrom(
  //         this.httpService.get<CurrentTelemetryPayload[]>(
  //           currTelemetryPayloadURL.href,
  //         ),
  //       );
  //       throwErrIfSrvcRespFailure(currTelemetryPayloadsResp);
  //       return currTelemetryPayloadsResp.data;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       throw new Error(errMsg);
  //     } finally {
  //       this.logger.debug(`${fnIdentifier} : End`);
  //     }
  //   } */

  //   /* This is moved to the user service*/
  //   /*  async authenticateUser(findUserDto: FindUserDto) {
  //     const msgTemplate = this.serviceName + `.authenticateUser()`;
  //     const event = `Input : ${JSON.stringify(findUserDto)}`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : ${event} : Start`);
  //       let userAuthenticateUrl = new URL(
  //         USER_AUTHENTICATE_URL,
  //         this.baseURL,
  //         //process.env['BASE_URL'],
  //       );
  //       userAuthenticateUrl = getSearchParamsforURL(
  //         userAuthenticateUrl,
  //         JSON.stringify(findUserDto),
  //       );
  //       const userAuthenticateResp = await firstValueFrom(
  //         this.httpService.get<User>(userAuthenticateUrl.href),
  //       );

  //       throwErrIfSrvcRespFailure(userAuthenticateResp);
  //       const user = userAuthenticateResp.data as User;
  //       const userWithRelatedOrgs = new UserWithRelatedOrgs(user);
  //       if (!_.isNil(user.userOrgs)) {
  //         for (const associatedOrg of user.userOrgs) {
  //           const ascendentsOrgsURL = new URL(
  //             ASCEDENTS_ORGS_WITHOUT_ASSETS_URL,
  //             this.baseURL,
  //           );
  //           ascendentsOrgsURL.searchParams.append(
  //             'csvOrgIDs',
  //             associatedOrg.orgId,
  //           );
  //           this.logger.debug(
  //             `${msgTemplate} : ${event} : Ascendants Org URL : ${ascendentsOrgsURL.href}`,
  //           );
  //           const ascendentsOrgsResp = await firstValueFrom(
  //             this.httpService.get<Org>(ascendentsOrgsURL.href),
  //           );
  //           throwErrIfSrvcRespFailure(ascendentsOrgsResp);
  //           userWithRelatedOrgs.relatedOrgs.push(
  //             getRelatedOrgs(ascendentsOrgsResp.data ),
  //           );
  //           this.logger.debug(
  //             `${msgTemplate} : ${event} : ${userWithRelatedOrgs.id} authentication successful`,
  //           );
  //         }
  //       } else {
  //         user.userOrgs = [];
  //       }
  //       this.logger.debug('returning');
  //       return userWithRelatedOrgs;
  //     } catch (error) {
  //       const errMsg = `${event} : ${getTryCatchErrorStr(error)}`;
  //       this.logger.error(`${msgTemplate} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }

  //     function getRelatedOrgs(ascendentsOrgs: Org ) {
  //       const orgTypeMap = new Map<string, RelatedOrg>();
  //       //const relatedAssociatedOrg = new RelatedOrg(associatedOrg, 'AS');
  //       const { parent, ...attachedOrg } = ascendentsOrgs;
  //       const attachedOrgObj = new RelatedOrg(attachedOrg, 'AS');
  //       orgTypeMap.set('AS', attachedOrgObj);
  //       let processedOrg = ascendentsOrgs;
  //       do {
  //         const { parent, ...ascendentOrgWithoutParent } = processedOrg;
  //         const ascendentOrgWithoutParentObj = new RelatedOrg(
  //           ascendentOrgWithoutParent,
  //         );
  //         orgTypeMap.set(
  //           ascendentOrgWithoutParentObj.type,
  //           ascendentOrgWithoutParentObj,
  //         );
  //         processedOrg = processedOrg.parent;
  //       } while (processedOrg);
  //       return Array.from(orgTypeMap.values());
  //       //userWithRelatedOrgs.relatedOrgs.push(Array.from(orgTypeMap.values()));
  //     }
  //   } */

  //   /* async getDevicesPerformanceTelemetry(
  //     searchCriteria: FindDevicesPerformanceTelemetryDto,
  //   ) {
  //     const msgTemplate = this.serviceName + `.getDevicesPerformanceTelemetry()`;
  //     try {
  //       if (
  //         searchCriteria.csvVirtualDeviceIDs == undefined &&
  //         searchCriteria.attribute == undefined
  //       ) {
  //         const assetCurrPerfSrcsURL = new URL(ASSET_CRNT_PERF_SRC_URL);
  //         const findAssetCurrentPerformanceSourceDto =
  //           new FindAssetCurrentPerformanceSourceDto(searchCriteria);

  //         this.logger.debug(
  //           `${msgTemplate} : search Criteria : ${JSON.stringify(
  //             findAssetCurrentPerformanceSourceDto,
  //           )}`,
  //         );
  //         getSearchParamsforURL(
  //           assetCurrPerfSrcsURL,
  //           JSON.stringify(findAssetCurrentPerformanceSourceDto),
  //         );
  //         assetCurrPerfSrcsURL.searchParams.append(
  //           'csvRelations',
  //           'assetTypeCurrentPerformanceSource',
  //         );

  //         this.logger.debug(`${msgTemplate} : URL : ${assetCurrPerfSrcsURL.href}`);

  //         const assetCurrPerfSrcsResp = await firstValueFrom(
  //           this.httpService.get<AssetCurrentPerformanceSource[]>(
  //             this.assetCurrPerSrcsWthNestedRltnsURL.href,
  //           ),
  //         );
  //         throwErrIfSrvcRespFailure(assetCurrPerfSrcsResp);
  //         throwErrIfNoRespData(
  //           assetCurrPerfSrcsResp,
  //           `Main chart is not specified for ${searchCriteria.csvAssetIDs}`,
  //         );
  //         const assetCurrPerfSrc = new AssetCurrentPerformanceSource(
  //           assetCurrPerfSrcsResp.data[0],
  //         );
  //       }

  //       if (assetCurrPerfSrcsResp.data.length > 0) {
  //         const assetCurrPerfSrc = new AssetCurrentPerformanceSource(
  //           assetCurrPerfSrcsResp.data[0],
  //         );
  //         const telemetryDevice = new TelemetryDevice(assetCurrPerfSrc);

  //         const findTelemetryPayload = new FindTelemetryPayloadForAPeriod(
  //           assetCurrPerfSrc,
  //         );
  //         findTelemetryPayload.updateTimeRange(
  //           searchCriteria.startTime,
  //           searchCriteria.endTime,
  //         );

  //         //let telemetryPayloadURL = new URL('telemetry-payload', this.baseURL);

  //         const telemetryPayloadURL = getSearchParamsforURL(
  //           new URL(TELEMETRY_PAYLOAD_FOR_A_TIME_PERIOD_URL, this.baseURL),
  //           JSON.stringify(findTelemetryPayload),
  //         );

  //         this.logger.debug(`${msgTemplate} : URL : ${telemetryPayloadURL.toString()}`);

  //         const telemetryPayloadResp = await firstValueFrom(
  //           this.httpService
  //             .get<TelemetryPayload[]>(telemetryPayloadURL.toString())
  //             .pipe(
  //               catchError((error: AxiosError) => {
  //                 const srvcErr = `${msgTemplate} : Asset Curr Perf Srcs : ${error.code} : ${error.message}`;
  //                 this.logger.debug(srvcErr);
  //                 throw new Error(srvcErr);
  //               }),
  //             ),
  //         );

  //         this.logger.debug(
  //           `${msgTemplate} : No of rcvdTelemetryPayloads : ${telemetryPayloadResp.data.length}`,
  //         );
  //         const Metrics = [];
  //         for (const rcvdTelemetryPayload of telemetryPayloadResp.data) {
  //           const telemetryPayload = new TelemetryPayload(rcvdTelemetryPayload);
  //           Metrics.push(new MetricDto(telemetryPayload.metric));
  //         }
  //         let telemetryDisplayProperty;
  //         Metrics.length > 0
  //           ? (telemetryDisplayProperty = new TelemetryDisplayProperty(
  //               assetCurrPerfSrc.assetTypeCurrentPerformanceSource,
  //               Metrics[0].attribute,
  //             ))
  //           : (telemetryDisplayProperty = new TelemetryDisplayProperty(
  //               assetCurrPerfSrc.assetTypeCurrentPerformanceSource,
  //             ));
  //         return new TelemetryPayloadDto(
  //           telemetryDevice,
  //           telemetryDisplayProperty,
  //           Metrics,
  //         );
  //       } else {
  //         throw new Error(
  //           `${msgTemplate} : Asset ${searchCriteria.csvAssetIDs} has not defined performance criteria`,
  //         );
  //       }
  //     } catch (error) {
  //       const srvcErr = `${msgTemplate} " In try-catch : ${error}`;
  //       this.logger.error(srvcErr);
  //       throw new HttpException(srvcErr, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   } */

  //   async getAssetPerformanceMainAttributes(assetID: string) {
  //     const event = `Input Search Criteria : ${assetID}`;
  //     const msgTemplate =
  //       this.serviceName +
  //       `.getAssetPerformanceMainAttributes` +
  //       ' ' +
  //       `${event}`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : Start`);
  //       const searchCriteria: FindAssetCurrentPerformanceSourceDto = {
  //         assetId: assetID,
  //         displayPriority: DisplayPriority.FIRST,
  //       };
  //       return await this.assetCurrentPerformanceSourceService.findAll(
  //         searchCriteria,
  //       );
  //       /* const assetCurrPerfURL = new URL(ASSET_CRNT_PERF_SRC_URL, this.baseURL);
  //       assetCurrPerfURL.searchParams.append('assetId', assetID);
  //       assetCurrPerfURL.searchParams.append(
  //         'displayPriority',
  //         DisplayPriority.FIRST.toString(),
  //       );

  //       const assetCurrPerfResp = await firstValueFrom(
  //         this.httpService.get<AssetCurrentPerformanceSource[]>(
  //           assetCurrPerfURL.href,
  //         ),
  //       );

  //       this.logger.debug(
  //         `Data returned by Asset Curr perf srvc : ${assetCurrPerfResp.data.length}`,
  //       );
  //       throwErrIfSrvcRespFailure(assetCurrPerfResp);

  //       const responseRecords = [];

  //       for (const assetCurrPerfSrc of assetCurrPerfResp.data) {
  //         const { auditDateTime, ...data } = assetCurrPerfSrc;
  //         responseRecords.push(data);
  //       }

  //       return responseRecords; */
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : End`);
  //     }
  //   }

  //   async getDevicesPerformanceTelemetry(
  //     searchCriteria: FindDevicesPerformanceTelemetryDto,
  //   ) {
  //     const event = `Input : Search Criteria : ${JSON.stringify(searchCriteria)}`;
  //     const msgTemplate = `${this.serviceName}.getPerformanceTelemetry() : ${event}`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : Start`);

  //       const todayStartEpoch = new Date().setHours(0, 0, 0, 0).valueOf();

  //       let telemetryPayloads = [];
  //       telemetryPayloads =
  //         await this.telemetryPayloadService.findForMultipleDevicesForATimePeriod(
  //           searchCriteria,
  //         );
  //       const telemetryPayloadDTOs: Array<TelemetryPayloadDto> = [];
  //       if (telemetryPayloads.length > 0) {
  //         const groupTelemetryPayloadsByVD = _.groupBy(
  //           telemetryPayloads,
  //           this.telemetryPayloadGroupByVirtualDeviceID,
  //         );

  //         for (const [virtualDeviceID, telemetryPayloads] of Object.entries(
  //           groupTelemetryPayloadsByVD,
  //         )) {
  //           const telemetryDevice = TelemetryDevice.createFromTelemetry(
  //             telemetryPayloads[0],
  //           );
  //           const telemetryDisplayProperty: TelemetryDisplayProperty = {
  //             displayName: telemetryPayloads[0].metric.metricsAttributeId,
  //             metricsAttributeId: telemetryPayloads[0].metric.metricsAttributeId,
  //             frequency: telemetryPayloads[0].metric.frequency,
  //             unit: telemetryPayloads[0].metric.unit,
  //             displayOrder: 10000,
  //           };
  //           const metricDTOs: Array<Partial<MetricDto>> = [];
  //           const metrics = telemetryPayloads.map((telemetryPayload) =>
  //             //metricDTOs.push(new MetricDto(telemetryPayload.metric)),
  //             metricDTOs.push(getMetricDTO(telemetryPayload.metric)),
  //           );
  //           telemetryPayloadDTOs.push(
  //             new TelemetryPayloadDto(
  //               telemetryDevice,
  //               metricDTOs,
  //               telemetryDisplayProperty,
  //             ),
  //           );
  //         }
  //       } else {
  //         this.logger.debug(`No telemetry payload records`);
  //       }
  //       //return findTelemetryPayload;
  //       return telemetryPayloadDTOs;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : End`);
  //     }
  //   }
  //   telemetryPayloadGroupByVirtualDeviceID(telemetryPayload: TelemetryPayload) {
  //     return telemetryPayload.virtualDeviceId;
  //   }

  //   async getAssetPerformanceTelemetry(
  //     searchCriteria: FindAssetPerformanceTelemetry,
  //   ) {
  //     const msgTemplate = this.serviceName + `.getAssetPerformanceTelemetry()`;
  //     //try {
  //     this.logger.debug(`${msgTemplate} : Start`);
  //     const todayStartEpoch = new Date().setHours(0, 0, 0, 0).valueOf();

  //     const findTelemetryPayload =
  //       FindTelemetryPayloadForAPeriod.createFromFindAssetPerformanceTelemetry(
  //         searchCriteria,
  //       );
  //     let telemetryPayloads = [];
  //     telemetryPayloads = await this.telemetryPayloadService.findForATimePeriod(
  //       findTelemetryPayload,
  //     );
  //     /* if (
  //       findTelemetryPayload.startTime >= todayStartEpoch &&
  //       findTelemetryPayload.endTime >= todayStartEpoch
  //     ) {
  //       this.logger.debug(`Fetching telemetry payload for current day`);
  //       telemetryPayloads =
  //         await this.todayTelemetryPayloadService.findForATimePeriod(
  //           findTelemetryPayload,
  //         );
  //     } else {
  //       this.logger.debug(`Fetching telemetry payload before current day`);
  //       telemetryPayloads = await this.telemetryPayloadService.findForATimePeriod(
  //         findTelemetryPayload,
  //       );
  //     } */

  //     /* const telemetryPayloadURL = getSearchParamsforURL(
  //         new URL(TELEMETRY_PAYLOAD_FOR_A_TIME_PERIOD_URL, this.baseURL),
  //         JSON.stringify(searchCriteria),
  //       );

  //       this.logger.debug(`${msgTemplate} : URL : ${telemetryPayloadURL.href}`);

  //       const telemetryPayloadResp = await firstValueFrom(
  //         this.httpService.get<TelemetryPayload[]>(telemetryPayloadURL.href),
  //       );

  //       throwErrIfSrvcRespFailure(telemetryPayloadResp);

  //       const telemetryPayloads = telemetryPayloadResp.data; */

  //     this.logger.debug(
  //       `${msgTemplate} : No of rcvdTelemetryPayloads : ${telemetryPayloads.length}`,
  //     );

  //     let metrics: Partial<MetricDto>[] = [];
  //     let telemetryDevice: TelemetryDevice;
  //     let telemetryDisplayProperty: TelemetryDisplayProperty;
  //     if (telemetryPayloads.length > 0) {
  //       telemetryDevice = TelemetryDevice.createFromTelemetry(
  //         telemetryPayloads[0],
  //       );
  //       let frequency = telemetryPayloads[0].metric.frequency;

  //       for (const rcvdTelemetryPayload of telemetryPayloads) {
  //         const telemetryPayload = new TelemetryPayload(rcvdTelemetryPayload);
  //         //metrics.push(new MetricDto(telemetryPayload.metric));
  //         metrics.push(getMetricDTO(telemetryPayload.metric));
  //       }
  //       const metricsAttributeId =
  //         metrics.length > 0
  //           ? telemetryPayloads[0].metric.metricsAttributeId
  //           : searchCriteria.metricsAttributeId;

  //       telemetryDisplayProperty = {
  //         metricsAttributeId: metricsAttributeId!,
  //         frequency: frequency,
  //         displayName: metricsAttributeId!,
  //         unit: telemetryPayloads[0].metric.unit,
  //         /* displayOrder:
  //               assetCurrPerfSrc.assetTypeCurrentPerformanceSource.displayOrder, */
  //       };
  //     } else {
  //       telemetryDevice =
  //         TelemetryDevice.createFromFindAssetPerformanceTelemetry(searchCriteria);
  //       telemetryDisplayProperty = {
  //         metricsAttributeId: searchCriteria.metricsAttributeId!,
  //         frequency: searchCriteria.frequency ?? MetricsFrequency.INSTANT,
  //         displayName: searchCriteria.metricsAttributeId!,
  //         //unit: searchCriteria.unit,
  //         /* displayOrder:
  //               assetCurrPerfSrc.assetTypeCurrentPerformanceSource.displayOrder, */
  //       };
  //       metrics = [];

  //       //throw new Error('No telemetry');
  //     }
  //     return new TelemetryPayloadDto(
  //       telemetryDevice,
  //       metrics,
  //       telemetryDisplayProperty,
  //     );
  //   }

  //   /* async getAssetPerformanceTelemetry(
  //     searchCriteria: FindAssetPerformanceTelemetry,
  //   ) {
  //     const msgTemplate = this.serviceName + `.getAssetPerformanceTelemetry()`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : Start`);
  //       const findAssetCurrentPerformanceSourceDto =
  //         new FindAssetCurrentPerformanceSourceDto(searchCriteria);
  //       //const findAssetCurrentPerformanceSourceDto = searchCriteria;

  //       this.logger.debug(
  //         `${msgTemplate} : search Criteria : ${JSON.stringify(
  //           findAssetCurrentPerformanceSourceDto,
  //         )}`,
  //       );

  //       this.assetCurrPerSrcsWthNestedRltnsURL = getSearchParamsforURL(
  //         this.assetCurrPerSrcsWthNestedRltnsURL,
  //         JSON.stringify(findAssetCurrentPerformanceSourceDto),
  //       );

  //       this.logger.debug(
  //         `${msgTemplate} : URL : ${this.assetCurrPerSrcsWthNestedRltnsURL.toString()}`,
  //       );

  //       const assetCurrPerfSrcsResp = await firstValueFrom(
  //         this.httpService
  //           .get<AssetCurrentPerformanceSource[]>(
  //             this.assetCurrPerSrcsWthNestedRltnsURL.toString(),
  //           )
  //           .pipe(
  //             catchError((error: AxiosError) => {
  //               const srvcErr = `${msgTemplate} : Asset Curr Perf Srcs : ${error.code} : ${error.message}`;
  //               this.logger.debug(srvcErr);
  //               throw new Error(srvcErr);
  //             }),
  //           ),
  //       );
  //       this.logger.debug(
  //         `${msgTemplate} : Asset current performance response : ${JSON.stringify(
  //           [...assetCurrPerfSrcsResp.data],
  //           null,
  //           2,
  //         )}`,
  //       );

  //       if (assetCurrPerfSrcsResp.data.length > 0) {
  //         const assetCurrPerfSrc = new AssetCurrentPerformanceSource(
  //           assetCurrPerfSrcsResp.data[0],
  //         );
  //         //const telemetryDevice = new TelemetryDevice(assetCurrPerfSrc);
  //         const telemetryDevice =
  //           TelemetryDevice.createFromAssetCurrentPerformanceSource(
  //             assetCurrPerfSrc,
  //           );

  //         const findTelemetryPayload =
  //           FindTelemetryPayloadForAPeriod.createFromAssetCurrentPerformanceSource(
  //             assetCurrPerfSrc,
  //           );
  //         findTelemetryPayload.updateTimeRange(
  //           searchCriteria.startTime,
  //           searchCriteria.endTime,
  //         );

  //         const telemetryPayloadURL = getSearchParamsforURL(
  //           new URL(TELEMETRY_PAYLOAD_FOR_A_TIME_PERIOD_URL, this.baseURL),
  //           JSON.stringify(findTelemetryPayload),
  //         );

  //         this.logger.debug(
  //           `${msgTemplate} : URL : ${telemetryPayloadURL.toString()}`,
  //         );

  //         const telemetryPayloadResp = await firstValueFrom(
  //           this.httpService
  //             .get<TelemetryPayload[]>(telemetryPayloadURL.toString())
  //             .pipe(
  //               catchError((error: AxiosError) => {
  //                 const srvcErr = `${msgTemplate} : Asset Curr Perf Srcs : ${error.code} : ${error.message}`;
  //                 this.logger.debug(srvcErr);
  //                 throw new Error(srvcErr);
  //               }),
  //             ),
  //         );

  //         this.logger.debug(
  //           `${msgTemplate} : No of rcvdTelemetryPayloads : ${telemetryPayloadResp.data.length}`,
  //         );
  //         const telemetryPayloads = telemetryPayloadResp.data;
  //         const metrics = [];
  //         let frequency =
  //           telemetryPayloadResp.data.length > 0
  //             ? telemetryPayloads[0].metric.frequency
  //             : MetricsFrequency.INSTANT;
  //         for (const rcvdTelemetryPayload of telemetryPayloads) {
  //           const telemetryPayload = new TelemetryPayload(rcvdTelemetryPayload);
  //           metrics.push(new MetricDto(telemetryPayload.metric));
  //         }
  //         const metricsAttributeId =
  //           metrics.length > 0
  //             ? telemetryPayloads[0].metric.metricsAttributeId
  //             : findAssetCurrentPerformanceSourceDto.metricsAttributeId;

  //         const telemetryDisplayProperty: TelemetryDisplayProperty = {
  //           metricsAttributeId: metricsAttributeId!,
  //           frequency: frequency,
  //           displayName: metricsAttributeId!,
  //           displayOrder:
  //             assetCurrPerfSrc.assetTypeCurrentPerformanceSource.displayOrder,
  //         };

  //         return new TelemetryPayloadDto(
  //           telemetryDevice,
  //           metrics,
  //           telemetryDisplayProperty,
  //         );
  //       } else {
  //         throw new Error(
  //           `${msgTemplate} : Asset ${searchCriteria.assetId} has not defined performance criteria`,
  //         );
  //       }
  //     } catch (error) {
  //       const srvcErr = `${msgTemplate} " In try-catch : ${error}`;
  //       this.logger.error(srvcErr);
  //       throw new HttpException(srvcErr, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   } */

  //   /* async getAssetPerformanceTelemetry(
  //     searchCriteria: FindAssetPerformanceTelemetry,
  //   ) {
  //     let assetCurrPerSrcsWthNestedRltnsURL = new URL(
  //       ASSET_CRNT_PERF_SRC_URL_WITH_NESTED_RLTNS,
  //       this.baseURL,
  //     );
  //     const msgTemplate = this.serviceName + `.getAssetPerformanceTelemetry()`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : Start`);
  //       const findAssetCurrentPerformanceSourceDto =
  //         new FindAssetCurrentPerformanceSourceDto(searchCriteria);
  //       //const findAssetCurrentPerformanceSourceDto = searchCriteria;

  //       this.logger.debug(
  //         `${msgTemplate} : search Criteria : ${JSON.stringify(
  //           findAssetCurrentPerformanceSourceDto,
  //           null,
  //           2,
  //         )}`,
  //       );

  //       assetCurrPerSrcsWthNestedRltnsURL = getSearchParamsforURL(
  //         assetCurrPerSrcsWthNestedRltnsURL,
  //         JSON.stringify(findAssetCurrentPerformanceSourceDto),
  //       );

  //       this.logger.debug(
  //         `${msgTemplate} : URL : ${assetCurrPerSrcsWthNestedRltnsURL.href}`,
  //       );

  //       const assetCurrPerfSrcsResp = await firstValueFrom(
  //         this.httpService
  //           .get<AssetCurrentPerformanceSource[]>(
  //             assetCurrPerSrcsWthNestedRltnsURL.href,
  //           )
  //           .pipe(
  //             catchError((error) => {
  //               const srvcErr = `${msgTemplate} : Asset Curr Perf Srcs : ${error.code} : ${error.message}`;
  //               this.logger.debug(srvcErr);
  //               throw new Error(srvcErr);
  //             }),
  //           ),
  //       );
  //       this.logger.debug(
  //         `${msgTemplate} : Asset current performance response : ${JSON.stringify(
  //           [...assetCurrPerfSrcsResp.data],
  //           null,
  //           2,
  //         )}`,
  //       );

  //       if (assetCurrPerfSrcsResp.data.length > 0) {
  //         const assetCurrPerfSrc = new AssetCurrentPerformanceSource(
  //           assetCurrPerfSrcsResp.data[0],
  //         );
  //         //const telemetryDevice = new TelemetryDevice(assetCurrPerfSrc);
  //         const telemetryDevice =
  //           TelemetryDevice.createFromAssetCurrentPerformanceSource(
  //             assetCurrPerfSrc,
  //           );
  //         const findTelemetryPayload =
  //           FindTelemetryPayloadForAPeriod.createFromAssetCurrentPerformanceSource(
  //             assetCurrPerfSrc,
  //           );
  //         findTelemetryPayload.updateTimeRange(
  //           searchCriteria.startTime,
  //           searchCriteria.endTime,
  //         );
  //         let telemetryPayloadResp: AxiosResponse;
  //         if (searchCriteria.metricsFrequency == MetricFrequency.INSTANT) {
  //           this.logger.debug(` Metric Frequency find as INSTANT`);
  //           const telemetryPayloadURL = getSearchParamsforURL(
  //             new URL(TELEMETRY_PAYLOAD_FOR_A_TIME_PERIOD_URL, this.baseURL),
  //             JSON.stringify(findTelemetryPayload),
  //           );
  //           this.logger.debug(
  //             ` telemetry-payload service url : ${telemetryPayloadURL}`,
  //           );
  //           telemetryPayloadResp = await firstValueFrom(
  //             this.httpService
  //               .get<TelemetryPayload[]>(telemetryPayloadURL.toString())
  //               .pipe(
  //                 catchError((error) => {
  //                   const srvcErr = `${msgTemplate} : Asset Curr Perf Srcs : ${error.code} : ${error.message}`;
  //                   this.logger.debug(srvcErr);
  //                   throw new Error(srvcErr);
  //                 }),
  //               ),
  //           );
  //           this.logger.debug(
  //             `${msgTemplate} : No of rcvdTelemetryPayloads : ${telemetryPayloadResp.data.length}`,
  //           );
  //         } else {
  //           this.logger.debug(`Metric Frequency find Other than INSTANT`);
  //           const periodTelemetryPayloadURL = getSearchParamsforURL(
  //             new URL(PERIOD_TELEMETRY_FOR_A_TIME_PERIOD_URL, this.baseURL),
  //             JSON.stringify(findTelemetryPayload),
  //           );
  //           this.logger.debug(
  //             ` period telemetry-payload service url : ${periodTelemetryPayloadURL}`,
  //           );
  //           telemetryPayloadResp = await firstValueFrom(
  //             this.httpService
  //               .get<PeriodTelemetryPayload[]>(
  //                 periodTelemetryPayloadURL.toString(),
  //               )
  //               .pipe(
  //                 catchError((error) => {
  //                   const srvcErr = `${msgTemplate} : Period telemetry payload : ${error.code} : ${error.message}`;
  //                   this.logger.debug(srvcErr);
  //                   throw new Error(srvcErr);
  //                 }),
  //               ),
  //           );
  //           this.logger.debug(
  //             `${msgTemplate} : No of rcvdPeriodTelemetryPayloads : ${telemetryPayloadResp.data.length}`,
  //           );
  //         }

  //         const resultingTelemetryResp: any = [];
  //         for (const record of telemetryPayloadResp.data) {
  //           const Obj = {
  //             assetId: record.assetId,
  //             virtualDeviceId: record.virtualDeviceId,
  //             period: record.period,
  //           };
  //           resultingTelemetryResp.push(Obj);
  //         }
  //         this.logger.debug(
  //           `printing telemetry response : ${JSON.stringify(
  //             resultingTelemetryResp,
  //             null,
  //             2,
  //           )}`,
  //         );
  //         const metrics = [];
  //         let metricsFreqency =
  //           telemetryPayloadResp.data.length > 0
  //             ? telemetryPayloadResp.data[0].metric.frequency
  //             : MetricFrequency.INSTANT;
  //         for (const rcvdTelemetryPayload of telemetryPayloadResp.data) {
  //           const telemetryPayload = new TelemetryPayload(rcvdTelemetryPayload);
  //           metrics.push(new MetricDto(telemetryPayload.metric));
  //         }
  //         const displayName =
  //           metrics.length > 0
  //             ? metrics[0].attribute
  //             : findAssetCurrentPerformanceSourceDto.metricsAttributeId;

  //         const telemetryDisplayProperty: TelemetryDisplayProperty = {
  //           metricsFrequency: metricsFreqency,
  //           displayName: displayName,
  //           displayOrder:
  //             assetCurrPerfSrc.assetTypeCurrentPerformanceSource.displayOrder,
  //         };

  //         return new TelemetryPayloadDto(
  //           telemetryDevice,
  //           metrics,
  //           telemetryDisplayProperty,
  //         );
  //       } else {
  //         throw new Error(
  //           `${msgTemplate} : Asset ${searchCriteria.assetId} has not defined performance criteria`,
  //         );
  //       }
  //     } catch (error) {
  //       const srvcErr = `${msgTemplate} " In try-catch : ${error}`;
  //       this.logger.error(srvcErr);
  //       throw new HttpException(srvcErr, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   } */

  //   /* No changes required due to virtual device changes */
  //   async getAssetTypeWiseAssetStateCount(userSearch: FindUserDto) {
  //     const msgTemplate = `${
  //       this.serviceName
  //     } getOrgAssetAssetStateCount() : user id : ${JSON.stringify(userSearch)}`;

  //     try {
  //       const users = await this.getUser(userSearch, msgTemplate);
  //       if (users && users[0].userOrgs) {
  //         const assetTypeWiseNoOfAssets: Map<string, number> = new Map();
  //         const userOrgNoOfAssets = new UserOrgNoOfAssets(users[0]);
  //         const userOrgs = users[0].userOrgs.map((userOrg) => userOrg.orgId);
  //         this.logger.debug(
  //           `${msgTemplate} : User orgs to string : ${userOrgs?.toString()}`,
  //         );
  //         const withAssets = true;
  //         const descedentsOrgsAssets = await this.getDescendentsOrgs(
  //           userOrgs.toString(),
  //           withAssets,
  //         );

  //         descedentsOrgsAssets.forEach((descedentsOrgsAsset) => {
  //           descedentsOrgsAsset.assets.forEach((asset) => {
  //             //userOrgNoOfAssets.addAsset(asset),

  //             let noOfAssets = assetTypeWiseNoOfAssets.get(asset.assetTypeId);
  //             noOfAssets ? noOfAssets++ : (noOfAssets = 1);
  //             assetTypeWiseNoOfAssets.set(asset.assetTypeId, noOfAssets);
  //           });
  //         });

  //         assetTypeWiseNoOfAssets.forEach((noOfAssets, assetType) => {
  //           userOrgNoOfAssets.assetTypesNoOfAssets.push(
  //             new AssetTypeNoOfAssets({
  //               assetType: assetType,
  //               noOfAssets: noOfAssets,
  //             }),
  //           );
  //         });

  //         this.logger.debug(
  //           `${msgTemplate} : final response : ${JSON.stringify(
  //             userOrgNoOfAssets,
  //           )}`,
  //         );

  //         return userOrgNoOfAssets;
  //       } else {
  //         const errMsg = `${msgTemplate} : users not found or the orgs of the user not found`;
  //         this.logger.error(errMsg);
  //         throw new Error(errMsg);
  //       }
  //     } catch (error) {
  //       const srvcErr = `${msgTemplate} " In try-catch : ${error}`;
  //       this.logger.error(srvcErr);
  //       throw new HttpException(srvcErr, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   }

  //   private extractUniqueAssetsFromOrgs(orgs: Org[]) {
  //     let assets = new Array<Asset>();
  //     orgs.map((org) => {
  //       assets = assets.concat(org.assets);
  //     });
  //     return _.uniqBy(assets, getAssetID);
  //   }

  //   /* No changes required due to virtual device changes */
  //   private extractAssetStatusWiseAssetCount(orgs: Org[]) {
  //     let assets = new Array<Asset>();
  //     for (const org of orgs) {
  //       assets = assets.concat(org.assets);
  //       /* for (const asset of org.assets) {
  //         assets.push(asset);
  //       } */
  //     }
  //     return assets;
  //   }

  //   /* Fixed for virtual device changes */
  //   async getAssetTypeWiseAttribs(findOrgsOrAssets: FindOrgsOrAssets) {
  //     const fnName = this.getAssetTypeWiseAttribs.name;
  //     const input = `Input : getAssetTypeWiseAttribs : ${JSON.stringify(
  //       findOrgsOrAssets,
  //     )}`;
  //     try {
  //       this.logger.debug(`${fnName} : Start`);
  //       this.logger.debug(fnName + KEY_SEPARATOR + input);
  //       //let deviceCount: number | undefined;
  //       if (
  //         findOrgsOrAssets.csvOrgIDs != null &&
  //         findOrgsOrAssets.csvOrgIDs.length > 0
  //       ) {
  //         const orgs = await this.getDescendentsOrgs(findOrgsOrAssets.csvOrgIDs);
  //         findOrgsOrAssets.csvOrgIDs = orgs.map((org) => org.id).join(',');
  //         /* var findDevicesFromMultipleIDs: FindDevicesFromMultipleIDs = {};
  //         Object.assign(findDevicesFromMultipleIDs, findOrgsOrAssets);
  //         deviceCount = await this.deviceService.findCount(
  //           findDevicesFromMultipleIDs,
  //         );
  //         this.logger.debug(`${fnName} : device count : ${deviceCount}`); */
  //       }
  //       //const assets = await this.getAllDescedentUniqueAssets(findOrgsOrAssets);
  //       const findAssets = getUniqueFindOrgsOrAssets(findOrgsOrAssets);
  //       const assets = await this.getAssets(findAssets, true);
  //       /* if (assets.length == 1) {
  //         deviceCount = undefined;
  //       } */
  //       const assetTypeWise = _.groupBy(assets, getAssetTypeID);
  //       this.logger.debug(`Asset type wise : ${JSON.stringify(assetTypeWise)}`);

  //       const assetTypeWiseAttribsDto = _.mapValues(
  //         assetTypeWise,
  //         function (assets: Asset[]) {
  //           let result: AssetTypeAttribsDto = {};
  //           result.csvAssetIDs = assets.length == 1 ? assets[0].id : undefined;
  //           result.assetStateWiseCount = _.countBy(assets, getAssetEntityState);
  //           let warnings = 0;
  //           let faults = 0;
  //           let deviceCountAttachedToAssets = 0;
  //           for (const asset of assets) {
  //             warnings += asset.entityState.warningCount ?? 0;
  //             faults += asset.entityState.faultCount ?? 0;
  //             deviceCountAttachedToAssets += asset.deviceCount ?? 0;
  //           }
  //           result.warningCount = warnings;
  //           result.faultCount = faults;
  //           result.deviceCount = /* deviceCount == undefined
  //               ?  */ deviceCountAttachedToAssets;
  //           /* : deviceCount */
  //           return result;
  //         },
  //       );
  //       //if (assetIDs.length == 1) assetTypeWiseAttribsDto["assetID"] = assetIDs[0];
  //       this.logger.debug(
  //         `${fnName} : Asset type wise attribs Dto : ${JSON.stringify(
  //           assetTypeWiseAttribsDto,
  //         )}`,
  //       );
  //       return assetTypeWiseAttribsDto;
  //       //}
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${fnName} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${fnName} : ${input} : End`);
  //     }
  //   }

  //   async getAllDescedentUniqueOnlyAssets(findAssets: FindOrgsOrAssets) {
  //     const onlyAssets = true;
  //     const resp = await this.getAllDescedentUniqueAssets(findAssets, onlyAssets);
  //     return resp;
  //   }

  //   async getAllDescedentUniqueAssets(
  //     findAssets: FindOrgsOrAssets,
  //     onlyAssets = false,
  //   ) {
  //     const fnName = 'getAllDescedentUniqueAssets()';
  //     const input = `Input : ${JSON.stringify(findAssets)}`;
  //     this.logger.debug(`${fnName} : Start`);
  //     this.logger.debug(`${fnName} : ${input}`);
  //     try {
  //       if (findAssets.csvOrgIDs) {
  //         const orgs = await this.getDescendentsOrgs(findAssets.csvOrgIDs);
  //         const uniqueOrgIDs = _.uniq(orgs.map((org) => org.id));
  //         findAssets.csvOrgIDs = uniqueOrgIDs.join(',');
  //       }
  //       findAssets = getUniqueFindOrgsOrAssets(findAssets);
  //       return await this.getAssets(findAssets, onlyAssets);
  //       //throwErrIfSrvcRespFailure(assetsResp);
  //       //return assetsResp;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${fnName} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${fnName} : End`);
  //     }
  //   }

  //   /* async getAllDescedentUniqueAssets(findAssets: FindOrgsOrAssets) {
  //     const fnName = 'getAllDescedentUniqueAssets()';
  //     const input = `Input : ${JSON.stringify(findAssets)}`;
  //     let assetsToBeSent: Array<Asset> = [];
  //     this.logger.debug(`${fnName} : Start`);
  //     this.logger.debug(`${fnName} : ${input}`);
  //     try {
  //       if (findAssets.csvAssetIDs) {
  //         const uniqueAssets = _.uniq(findAssets.csvAssetIDs.split(','));
  //         const assetsURLResp = await this.getAssetsWithDevicesByAssets(
  //           uniqueAssets,
  //         );

  //         throwErrIfSrvcRespFailure(assetsURLResp);
  //         assetsToBeSent = assetsURLResp.data;
  //         //return assetsURLResp.data;
  //       } else if (findAssets.csvOrgIDs) {
  //         //const withAssets = true;
  //         //const orgs = await this.getDescedentsOrgs(findAssets.csvOrgIDs, ASSETS);
  //         const orgs = await this.getDescedentsOrgs(findAssets.csvOrgIDs);
  //         const uniqueOrgIDs = _.uniq(orgs.map((org) => org.id));
  //         //const csvUniqueOrgIDs = uniqueOrgIDs.join(',');

  //         const assetsResp = await this.getAssetsWithDevicesByOrgs(uniqueOrgIDs);
  //         throwErrIfSrvcRespFailure(assetsResp);

  //         const uniqueAssets = _.uniqBy(assetsResp.data, 'id');

  //         //const uniqueAssets = this.extractUniqueAssetsFromOrgs(orgs);
  //         this.logger.debug(`No of unique Assets : ${uniqueAssets.length}`);
  //         let filteredUniqueAssets;
  //         if (findAssets.csvAssetTypeIDs) {
  //           const assetTypeIDArray = findAssets.csvAssetTypeIDs.split(',');
  //           const assetTypeIDSet = new Set<String>(assetTypeIDArray);
  //           this.logger.debug(
  //             `No of records in asset type ID set : ${assetTypeIDSet.size}`,
  //           );
  //           filteredUniqueAssets = uniqueAssets.filter((uniqueAsset) =>
  //             assetTypeIDSet.has(uniqueAsset.assetTypeId),
  //           );
  //           this.logger.debug(
  //             `No of filtered Assets : ${filteredUniqueAssets.length}`,
  //           );
  //         }
  //         assetsToBeSent = filteredUniqueAssets
  //           ? filteredUniqueAssets
  //           : uniqueAssets;
  //         //return filteredUniqueAssets ? filteredUniqueAssets : uniqueAssets;
  //       }
  //       return assetsToBeSent;
  //       //return this.extractUniqueAssetsFromOrgs(orgs);
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${fnName} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${fnName} : End`);
  //     }
  //   } */

  //   /* No changes are required due to virtual device changes */
  //   /* private async getDescedentsOrgs(userOrgs: string, csvRelations?: string) {
  //     const msgTemplate = `${this.serviceName} : getDescedentOrgs() : Inputs : ${userOrgs}`;
  //     try {
  //       let descedantOrgsURL = new URL(
  //         DESCEDENTS_ORGS_WITH_SPECIFIED_RELATIONS_URL,
  //         this.baseURL,
  //       );

  //       //const findOrgsByOrgIds = new FindOrgsOrAssets({ csvOrgIDs: userOrgs });
  //       //const findOrgsByOrgIds: FindOrgsOrAssets = { csvOrgIDs: userOrgs };
  //       const searchParameters = csvRelations
  //         ? { csvOrgIDs: userOrgs, csvRelations: csvRelations }
  //         : { csvOrgIDs: userOrgs };

  //       descedantOrgsURL = getSearchParamsforURL(
  //         descedantOrgsURL,
  //         JSON.stringify(searchParameters),
  //       );

  //       this.logger.debug(`${msgTemplate} : URL : ${descedantOrgsURL.href}`);

  //       const descedantOrgsResp = await firstValueFrom(
  //         this.httpService.get<Org[]>(descedantOrgsURL.href),
  //       );
  //       throwErrIfSrvcRespFailure(descedantOrgsResp);
  //       return descedantOrgsResp.data;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(
  //         `${msgTemplate} : Descendent orgs for orgs : ${userOrgs} : ${errMsg}`,
  //       );
  //       throw new Error(errMsg);
  //     }
  //   } */

  //   /*  private async getAssetsWithDevicesByAssets(
  //     assets: string[],
  //     msgTemplate?: string,
  //   ) {
  //     const fnIdentifier = msgTemplate
  //       ? msgTemplate
  //       : 'getAssetsWithDevicesByAssets()';

  //     let assetURL = new URL(
  //       ASSETS_BY_MULTIPLE_IDs_WITH_DEVICES_URL,
  //       this.baseURL,
  //     );

  //     assetURL.searchParams.append('csvAssetIDs', assets.toString());

  //     this.logger.debug(`${fnIdentifier} : URL : ${assetURL.toString()}`);

  //     return await firstValueFrom(
  //       this.httpService.get<Asset[]>(assetURL.toString()).pipe(
  //         catchError((error: AxiosError) => {
  //           const srvcErr = `${msgTemplate} : Asset : ${error.code} : ${error.message}`;
  //           this.logger.debug(srvcErr);
  //           throw new Error(srvcErr);
  //         }),
  //       ),
  //     );
  //   } */

  //   private async getAssets(
  //     searchCriteria: FindOrgsOrAssets,
  //     onlyAssets: boolean = false,
  //   ) {
  //     const fnIdentifier = 'getAssets()';
  //     this.logger.debug(`${fnIdentifier} : onlyAssets : ${onlyAssets} Start`);

  //     return await this.assetService.getAssets(searchCriteria, onlyAssets);
  //     /* const assetURL = onlyAssets
  //       ? new URL(ONLY_ASSETS_URL, this.baseURL)
  //       : new URL(ASSETS_WITH_ASSET_STATE_AND_ALERT_COUNT_URL, this.baseURL);

  //     getSearchParamsforURL(assetURL, JSON.stringify(searchCriteria));

  //     this.logger.debug(`${fnIdentifier} : URL : ${assetURL.href}`);

  //     return await firstValueFrom(this.httpService.get<Asset[]>(assetURL.href)); */
  //   }

  //   /* private async getAssetsWithDevicesByOrgs(
  //     userOrgs: string[],
  //     msgTemplate?: string,
  //   ) {
  //     const fnIdentifier = msgTemplate
  //       ? msgTemplate
  //       : 'getAssetsWithDevicesByOrgs()';

  //     let assetURL = new URL(
  //       ASSETS_BY_MULTIPLE_IDs_WITH_DEVICES_URL,
  //       this.baseURL,
  //     );

  //     assetURL.searchParams.append('csvOrgIDs', userOrgs.toString());

  //     this.logger.debug(`${fnIdentifier} : URL : ${assetURL.toString()}`);

  //     return await firstValueFrom(
  //       this.httpService.get<Asset[]>(assetURL.toString()).pipe(
  //         catchError((error: AxiosError) => {
  //           const srvcErr = `${msgTemplate} : Asset : ${error.code} : ${error.message}`;
  //           this.logger.debug(srvcErr);
  //           throw new Error(srvcErr);
  //         }),
  //       ),
  //     );
  //   } */

  //   /* No changes are required due to virtual device changes */
  //   private async getUser(userSearch: FindUserDto, msgTemplate: string) {
  //     const fnIdentifier = `getUser() : Input : ${JSON.stringify(userSearch)}`;
  //     try {
  //       //const findUserDto = new FindUserDto(userSearch);
  //       const findUserDto = userSearch;
  //       this.logger.debug(
  //         `${msgTemplate} : search Criteria : ${JSON.stringify(findUserDto)}`,
  //       );
  //       const relationsRequired = true;
  //       return await this.userService.findAll(userSearch, relationsRequired);
  //       /* let userURL = new URL(USER_RELATIONS_URL, this.baseURL);

  //       userURL = getSearchParamsforURL(userURL, JSON.stringify(findUserDto));

  //       this.logger.debug(`${msgTemplate} : URL : ${userURL.toString()}`);

  //       const userURLResp = await firstValueFrom(
  //         this.httpService.get<User[]>(userURL.toString()).pipe(
  //           catchError((error: AxiosError) => {
  //             const srvcErr = `${msgTemplate} : User : ${error.code} : ${error.message}`;
  //             this.logger.debug(srvcErr);
  //             throw new Error(srvcErr);
  //           }),
  //         ),
  //       );
  //       this.logger.debug(
  //         `${msgTemplate} : ${fnIdentifier} : ${getServiceResponseStatus(
  //           userURLResp,
  //         )}`,
  //       );
  //       if (userURLResp.status == HttpStatus.OK && userURLResp.data) {
  //         return userURLResp.data;
  //       } else {
  //         const errMsg = `User ${JSON.stringify(
  //           userSearch,
  //         )}  could not be retrieved`;
  //         this.logger.error(`${msgTemplate} : ${fnIdentifier} : ${errMsg}`);
  //         throw new Error(errMsg);
  //       } */
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       throw new Error(errMsg);
  //     }
  //   }


  //   async saveTelemetryAlerts(inputAlertDTOs: InputAlertDto[]) {
  //     const fnName = this.saveTelemetryAlerts.name;
  //     const input = `Input : ${JSON.stringify([...inputAlertDTOs])}`;
  //     const savedTelemetryAlerts = [];
  //     try {
  //       this.logger.debug(`${this.serviceName} : ${fnName} : Start`);
  //       this.logger.debug(`${this.serviceName} : ${fnName} : Input : ${input}`);

  //       const onlyDeviceModelIDs: string[] = [];
  //       const onlyRMUDeviceModelIDs: string[] = [];
  //       const deviceModelIDs: string[] = [];
  //       const rMUDeviceModelIDs: string[] = [];
  //       const onlyDeviceAlertIDs: string[] = [];
  //       const onlyRMUAlertIDs: string[] = [];
  //       const deviceAndRMUAlertIDs: string[] = [];
  //       for (const inputAlertDto of inputAlertDTOs) {
  //         switch (inputAlertDto.deviceModelAlertFindMethod) {
  //           case DeviceModelAlertFindMethod.ONLY_DEVICE:
  //             this.logger.debug(
  //               `${fnName} : Find master alerts only using device`,
  //             );
  //             //onlyDeviceFindMethodCreateAlerts.push(createAlert);
  //             onlyDeviceModelIDs.push(inputAlertDto.deviceModelId!);
  //             onlyDeviceAlertIDs.push(inputAlertDto.alertId!);
  //             break;
  //           case DeviceModelAlertFindMethod.ONLY_RMU:
  //             this.logger.debug(`${fnName} : Find master alerts only using rmu`);
  //             //onlyRMUFindMethodCreateAlerts.push(createAlert);
  //             onlyRMUDeviceModelIDs.push(inputAlertDto.rmuDeviceModelId!);
  //             onlyRMUAlertIDs.push(inputAlertDto.alertId!);
  //             break;
  //           case DeviceModelAlertFindMethod.DEVICE_AND_RMU:
  //             this.logger.debug(
  //               `${fnName} : Find master alerts using device and rmu`,
  //             );
  //             //deviceAndRMUFindMethodCreateAlerts.push(createAlert);
  //             deviceModelIDs.push(inputAlertDto.deviceModelId!);
  //             rMUDeviceModelIDs.push(inputAlertDto.rmuDeviceModelId!);
  //             deviceAndRMUAlertIDs.push(inputAlertDto.alertId!);
  //             break;
  //         }
  //       }
  //       const deviceModelAlerts = new DeviceModelAlerts([]);
  //       if (!_.isEmpty(onlyDeviceAlertIDs)) {
  //         const searchObject: FindDeviceModelAlertByMultipleIDs = {
  //           csvAlertIDs: onlyDeviceAlertIDs.join(','),
  //           csvDeviceModelIDs: onlyDeviceModelIDs.join(','),
  //         };
  //         this.logger.debug(
  //           'Find master alerts only using device : search object : ' +
  //             JSON.stringify(searchObject),
  //         );
  //         const deviceModelAlertResp =
  //           await this.deviceModelAlertService.findByMultipleIDs(searchObject);
  //         /* const deviceModelAlertResp = await firstValueFrom(
  //           this.httpService.get(onlyDeviceModelAlertURL.href),
  //         ); */
  //         //throwErrIfSrvcRespFailure(deviceModelAlertResp);
  //         this.logger.debug(
  //           `${fnName} : No of master alerts only using device : ${JSON.stringify(
  //             [...deviceModelAlertResp],
  //           )}`,
  //         );
  //         deviceModelAlerts.addDeviceModelAlerts(
  //           deviceModelAlertResp as DeviceModelAlert[],
  //         );
  //         this.logger.debug(
  //           `${fnName} : No of master alerts only using device : ${deviceModelAlerts.noOfAlerts()}`,
  //         );
  //       }
  //       if (!_.isEmpty(onlyRMUAlertIDs)) {
  //         const searchObject: FindDeviceModelAlertByMultipleIDs = {
  //           csvAlertIDs: onlyDeviceAlertIDs.join(','),
  //           csvRMUDeviceModelIDs: onlyRMUDeviceModelIDs.join(','),
  //         };
  //         this.logger.debug(
  //           'Find master alerts only using rmu : search object : ' +
  //             JSON.stringify(searchObject),
  //         );
  //         const deviceModelAlertResp =
  //           await this.deviceModelAlertService.findByMultipleIDs(searchObject);
  //         this.logger.debug(
  //           `${fnName} : No of master alerts only using rmu : ${JSON.stringify([
  //             ...deviceModelAlertResp,
  //           ])}`,
  //         );
  //         //throwErrIfSrvcRespFailure(deviceModelAlertResp);
  //         deviceModelAlerts.addDeviceModelAlerts(
  //           deviceModelAlertResp as DeviceModelAlert[],
  //         );
  //         this.logger.debug(
  //           `${fnName} : No of master alerts only using rmu : ${deviceModelAlerts.noOfAlerts()}`,
  //         );
  //       }
  //       if (!_.isEmpty(deviceAndRMUAlertIDs)) {
  //         const searchObject: FindDeviceModelAlertByMultipleIDs = {
  //           csvAlertIDs: deviceAndRMUAlertIDs.join(','),
  //           csvDeviceModelIDs: deviceModelIDs.join(','),
  //           csvRMUDeviceModelIDs: rMUDeviceModelIDs.join(','),
  //         };
  //         this.logger.debug(
  //           'Find master alerts using device and rmu : search object : ' +
  //             JSON.stringify(searchObject),
  //         );
  //         /* const deviceAndRMUDeviceModelAlertURL = this.getDeviceModelAlertURL();
  //         this.logger.debug(
  //           `${fnName} : URL using device and rmu before search Obj : ${deviceAndRMUDeviceModelAlertURL.href}`,
  //         );
  //         getSearchParamsforURL(
  //           deviceAndRMUDeviceModelAlertURL,
  //           JSON.stringify(searchObject),
  //         );
  //         this.logger.debug(
  //           `${fnName} : URL using device and rmu : ${deviceAndRMUDeviceModelAlertURL.href}`,
  //         ); */
  //         const deviceModelAlertResp =
  //           await this.deviceModelAlertService.findByMultipleIDs(searchObject);
  //         this.logger.debug(
  //           `${fnName} : No of master alerts using device and rmu : ${JSON.stringify(
  //             [...deviceModelAlertResp],
  //           )}`,
  //         );
  //         //throwErrIfSrvcRespFailure(deviceModelAlertResp);
  //         deviceModelAlerts.addDeviceModelAlerts(
  //           deviceModelAlertResp as DeviceModelAlert[],
  //         );
  //         this.logger.debug(
  //           `${fnName} : No of master alerts using device and rmu : ${deviceModelAlerts.noOfAlerts()}`,
  //         );
  //       }
  //       const dvceMdlAlrtMap = deviceModelAlerts.byObjKey();
  //       this.logger.debug(
  //         `${fnName} : No of master alerts in the map: ${dvceMdlAlrtMap.size}`,
  //       );
  //       const createAlertObjs: CreateAlertDto[] = [];
  //       for (const inputAlertDTO of inputAlertDTOs) {
  //         const inputAlertObj = new InputAlertDto(inputAlertDTO);
  //         const inputAlertKey = inputAlertObj.getKeyForMap(
  //           inputAlertDTO.deviceModelAlertFindMethod!,
  //         );
  //         this.logger.debug(`${fnName} : createAlertKey : ${inputAlertKey}`);
  //         const dvceMdlRec = dvceMdlAlrtMap.get(inputAlertKey);
  //         this.logger.debug('dvceMdlRec : ', dvceMdlRec);
  //         const createAlertObj = CreateAlertDto.createFromInputAlertDTO(
  //           inputAlertObj,
  //           dvceMdlRec,
  //         );
  //         createAlertObjs.push(createAlertObj);
  //       }
  //       /*const alertsByVD = _.groupBy(createAlertObjs, getVDIdFromCreateAlertObj);
  //       for (const [vDID, createAlerts] of Object.entries(alertsByVD)) {
  //         if (createAlerts.length > 1) {
  //           const telemetryAlerts = await this.alertService.createBulk(
  //             createAlertObjs,
  //           );
  //           const savedCurrTelemetryAlerts =
  //             await this.currentOpenAlertService.createBulk(createAlertObjs);
  //           savedTelemetryAlerts.push(...telemetryAlerts);
  //         } else if (createAlerts.length == 1) {
  //           const telemetryAlert =
  //             await this.closeOtherTelemetryAlertsForANewAlert(createAlerts[0]);
  //           savedTelemetryAlerts.push(telemetryAlert);
  //         } else {
  //           this.logger.debug(
  //             `${fnName} : No alerts to be saved for virtual device : ${vDID}`,
  //           );
  //         }
  //       } */
  //       const createdTelemetryAlerts = await this.alertService.createBulk2(
  //         createAlertObjs,
  //       );
  //       const createCurrentOpenAlerts =
  //         await this.currentOpenAlertService.createBulk2(createAlertObjs);
  //       return createdTelemetryAlerts;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${this.serviceName} : ${fnName} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   } /* catch (error) {
  //     const errMsg = getTryCatchErrorStr(error);
  //     this.logger.error(`${this.serviceName} : ${fnName} : ${errMsg}`);
  //   } */

  //   async saveTelemetryAlerts2(inputAlertDTOs: InputAlertDto[]) {
  //     const fnName = this.saveTelemetryAlerts2.name;
  //     const input = `Input : ${JSON.stringify([...inputAlertDTOs])}`;
  //     const savedTelemetryAlerts: Alert[] = [];
  //     this.logger.debug(`${this.serviceName} : ${fnName} : Start`);
  //     this.logger.debug(`${this.serviceName} : ${fnName} : Input : ${input}`);

  //     const onlyDeviceModelIDs: string[] = [];
  //     const onlyRMUDeviceModelIDs: string[] = [];
  //     const deviceModelIDs: string[] = [];
  //     const rMUDeviceModelIDs: string[] = [];
  //     const onlyDeviceAlertIDs: string[] = [];
  //     const onlyRMUAlertIDs: string[] = [];
  //     const deviceAndRMUAlertIDs: string[] = [];
  //     for (const inputAlertDto of inputAlertDTOs) {
  //       switch (inputAlertDto.deviceModelAlertFindMethod) {
  //         case DeviceModelAlertFindMethod.ONLY_DEVICE:
  //           this.logger.debug(`${fnName} : Find master alerts only using device`);
  //           //onlyDeviceFindMethodCreateAlerts.push(createAlert);
  //           onlyDeviceModelIDs.push(inputAlertDto.deviceModelId!);
  //           onlyDeviceAlertIDs.push(inputAlertDto.alertId!);
  //           break;
  //         case DeviceModelAlertFindMethod.ONLY_RMU:
  //           this.logger.debug(`${fnName} : Find master alerts only using rmu`);
  //           //onlyRMUFindMethodCreateAlerts.push(createAlert);
  //           onlyRMUDeviceModelIDs.push(inputAlertDto.rmuDeviceModelId!);
  //           onlyRMUAlertIDs.push(inputAlertDto.alertId!);
  //           break;
  //         case DeviceModelAlertFindMethod.DEVICE_AND_RMU:
  //           this.logger.debug(
  //             `${fnName} : Find master alerts using device and rmu`,
  //           );
  //           //deviceAndRMUFindMethodCreateAlerts.push(createAlert);
  //           deviceModelIDs.push(inputAlertDto.deviceModelId!);
  //           rMUDeviceModelIDs.push(inputAlertDto.rmuDeviceModelId!);
  //           deviceAndRMUAlertIDs.push(inputAlertDto.alertId!);
  //           break;
  //         default:
  //           this.logger.debug(
  //             `${fnName} : Default : Find master alerts only using device`,
  //           );
  //           //onlyDeviceFindMethodCreateAlerts.push(createAlert);
  //           onlyDeviceModelIDs.push(inputAlertDto.deviceModelId!);
  //           onlyDeviceAlertIDs.push(inputAlertDto.alertId!);
  //           break;
  //       }
  //     }
  //     const deviceModelAlerts = new DeviceModelAlerts([]);
  //     if (!_.isEmpty(onlyDeviceAlertIDs)) {
  //       const searchObject: FindDeviceModelAlertByMultipleIDs = {
  //         csvAlertIDs: onlyDeviceAlertIDs.join(','),
  //         csvDeviceModelIDs: onlyDeviceModelIDs.join(','),
  //       };
  //       this.logger.debug(
  //         'Find master alerts only using device : search object : ' +
  //           JSON.stringify(searchObject),
  //       );
  //       const deviceModelAlertResp =
  //         await this.deviceModelAlertService.findByMultipleIDs(searchObject);
  //       /* const deviceModelAlertResp = await firstValueFrom(
  //             this.httpService.get(onlyDeviceModelAlertURL.href),
  //           ); */
  //       //throwErrIfSrvcRespFailure(deviceModelAlertResp);
  //       this.logger.debug(
  //         `${fnName} : No of master alerts only using device : ${JSON.stringify([
  //           ...deviceModelAlertResp,
  //         ])}`,
  //       );
  //       deviceModelAlerts.addDeviceModelAlerts(
  //         deviceModelAlertResp as DeviceModelAlert[],
  //       );
  //       this.logger.debug(
  //         `${fnName} : No of master alerts only using device : ${deviceModelAlerts.noOfAlerts()}`,
  //       );
  //     }
  //     if (!_.isEmpty(onlyRMUAlertIDs)) {
  //       const searchObject: FindDeviceModelAlertByMultipleIDs = {
  //         csvAlertIDs: onlyDeviceAlertIDs.join(','),
  //         csvRMUDeviceModelIDs: onlyRMUDeviceModelIDs.join(','),
  //       };
  //       this.logger.debug(
  //         'Find master alerts only using rmu : search object : ' +
  //           JSON.stringify(searchObject),
  //       );
  //       const deviceModelAlertResp =
  //         await this.deviceModelAlertService.findByMultipleIDs(searchObject);
  //       this.logger.debug(
  //         `${fnName} : No of master alerts only using rmu : ${JSON.stringify([
  //           ...deviceModelAlertResp,
  //         ])}`,
  //       );
  //       //throwErrIfSrvcRespFailure(deviceModelAlertResp);
  //       deviceModelAlerts.addDeviceModelAlerts(
  //         deviceModelAlertResp as DeviceModelAlert[],
  //       );
  //       this.logger.debug(
  //         `${fnName} : No of master alerts only using rmu : ${deviceModelAlerts.noOfAlerts()}`,
  //       );
  //     }
  //     if (!_.isEmpty(deviceAndRMUAlertIDs)) {
  //       const searchObject: FindDeviceModelAlertByMultipleIDs = {
  //         csvAlertIDs: deviceAndRMUAlertIDs.join(','),
  //         csvDeviceModelIDs: deviceModelIDs.join(','),
  //         csvRMUDeviceModelIDs: rMUDeviceModelIDs.join(','),
  //       };
  //       this.logger.debug(
  //         'Find master alerts using device and rmu : search object : ' +
  //           JSON.stringify(searchObject),
  //       );
  //       /* const deviceAndRMUDeviceModelAlertURL = this.getDeviceModelAlertURL();
  //           this.logger.debug(
  //             `${fnName} : URL using device and rmu before search Obj : ${deviceAndRMUDeviceModelAlertURL.href}`,
  //           );
  //           getSearchParamsforURL(
  //             deviceAndRMUDeviceModelAlertURL,
  //             JSON.stringify(searchObject),
  //           );
  //           this.logger.debug(
  //             `${fnName} : URL using device and rmu : ${deviceAndRMUDeviceModelAlertURL.href}`,
  //           ); */
  //       const deviceModelAlertResp =
  //         await this.deviceModelAlertService.findByMultipleIDs(searchObject);
  //       this.logger.debug(
  //         `${fnName} : No of master alerts using device and rmu : ${JSON.stringify(
  //           [...deviceModelAlertResp],
  //         )}`,
  //       );
  //       //throwErrIfSrvcRespFailure(deviceModelAlertResp);
  //       deviceModelAlerts.addDeviceModelAlerts(
  //         deviceModelAlertResp as DeviceModelAlert[],
  //       );
  //       this.logger.debug(
  //         `${fnName} : No of master alerts using device and rmu : ${deviceModelAlerts.noOfAlerts()}`,
  //       );
  //     }
  //     const dvceMdlAlrtMap = deviceModelAlerts.byObjKey();
  //     this.logger.debug(
  //       `${fnName} : No of master alerts in the map: ${dvceMdlAlrtMap.size}`,
  //     );
  //     const createAlertObjs: CreateAlertDto[] = [];
  //     for (const inputAlertDTO of inputAlertDTOs) {
  //       const inputAlertObj = new InputAlertDto(inputAlertDTO);
  //       const inputAlertKey = inputAlertObj.getKeyForMap(
  //         inputAlertDTO.deviceModelAlertFindMethod!,
  //       );
  //       this.logger.debug(`${fnName} : createAlertKey : ${inputAlertKey}`);
  //       const dvceMdlRec = dvceMdlAlrtMap.get(inputAlertKey);
  //       this.logger.debug('dvceMdlRec : ', dvceMdlRec);
  //       const createAlertObj = CreateAlertDto.createFromInputAlertDTO(
  //         inputAlertObj,
  //         dvceMdlRec,
  //       );
  //       createAlertObjs.push(createAlertObj);
  //     }
  //     /*const alertsByVD = _.groupBy(createAlertObjs, getVDIdFromCreateAlertObj);
  //         for (const [vDID, createAlerts] of Object.entries(alertsByVD)) {
  //           if (createAlerts.length > 1) {
  //             const telemetryAlerts = await this.alertService.createBulk(
  //               createAlertObjs,
  //             );
  //             const savedCurrTelemetryAlerts =
  //               await this.currentOpenAlertService.createBulk(createAlertObjs);
  //             savedTelemetryAlerts.push(...telemetryAlerts);
  //           } else if (createAlerts.length == 1) {
  //             const telemetryAlert =
  //               await this.closeOtherTelemetryAlertsForANewAlert(createAlerts[0]);
  //             savedTelemetryAlerts.push(telemetryAlert);
  //           } else {
  //             this.logger.debug(
  //               `${fnName} : No alerts to be saved for virtual device : ${vDID}`,
  //             );
  //           }
  //         } */
  //     const createdTelemetryAlerts = await this.alertService.createBulk3(
  //       createAlertObjs,
  //     );
  //     const createCurrentOpenAlerts =
  //       await this.currentOpenAlertService.createBulk3(createAlertObjs);
  //     savedTelemetryAlerts.push(...createdTelemetryAlerts);
  //     return savedTelemetryAlerts;
  //   }




  //   async closeOtherTelemetryAlertsForANewAlert(createAlertDTO: CreateAlertDto) {
  //     const fnName = this.closeOtherTelemetryAlertsForANewAlert.name;
  //     const { assetId, virtualDeviceId, alertId, sourceAttribute } =
  //       createAlertDTO;

  //     const findAlertDto: FindAlertDto = {
  //       assetId: assetId,
  //       virtualDeviceId: virtualDeviceId,
  //       //metricsAttributeId: metricsAttributeId,
  //       alertId: Not(alertId!),
  //       closeDateTime: IsNull(),
  //     };
  //     if (sourceAttribute) {
  //       findAlertDto.sourceAttribute = sourceAttribute;
  //     }
  //     const updateAlertDto: UpdateAlertDto = {
  //       closeDateTime: createAlertDTO.openDateTime,
  //     };
  //     await this.alertService.closeAlerts(findAlertDto, updateAlertDto);

  //     const findCurrOpenAlertDto: FindCurrentOpenAlertDto = findAlertDto; /* {
  //       assetId: assetId,
  //       virtualDeviceId: virtualDeviceId,
  //       alertId: Not(alertId!),
  //       closeDateTime: IsNull(),
  //     } */
  //     await this.currentOpenAlertService.delete(findCurrOpenAlertDto);

  //     const savedTelemetryAlert = await this.alertService.create(createAlertDTO);

  //     this.logger.debug(`${fnName} : Creating current open telemetry alert`);
  //     const savedCurrTelemetryAlert = await this.currentOpenAlertService.create(
  //       createAlertDTO,
  //     );
  //     return savedTelemetryAlert;
  //   }

  //   async closeAlertsForNoAlerts(
  //     virtualDeviceID: string,
  //     closeDateTimeInEpoch: string,
  //   ) {
  //     const fnName = this.closeOtherTelemetryAlertsForANewAlert.name;

  //     const findAlertDto: FindAlertDto = {
  //       //assetId: virtualDeviceID.assetId,
  //       virtualDeviceId: virtualDeviceID,
  //       closeDateTime: IsNull(),
  //     };
  //     const updateAlertDto: UpdateAlertDto = {
  //       closeDateTime: new Date(parseInt(closeDateTimeInEpoch)),
  //     };
  //     const updateAlerts = await this.alertService.closeAlerts(
  //       findAlertDto,
  //       updateAlertDto,
  //     );

  //     this.logger.debug(
  //       `${fnName} : updateAlerts closed : ${JSON.stringify(updateAlerts)}`,
  //     );

  //     const findCurrOpenAlertDto: FindCurrentOpenAlertDto = findAlertDto;
  //     const deletedAlerts = await this.currentOpenAlertService.delete(
  //       findCurrOpenAlertDto,
  //     );

  //     this.logger.debug(
  //       `${fnName} : deletedAlerts : ${JSON.stringify(deletedAlerts)}`,
  //     );

  //     return virtualDeviceID;
  //   }

  //   async getMetricsAttributeFormulasFromDeviceType(
  //     token: string,
  //     deviceTypeId: string,
  //   ) {
  //     const deviceTypeMetricsAttributesURL = new URL(
  //       DEVICE_TYPE_METRICS_ATTRIBUTE_MANY_URL,
  //       this.baseURL,
  //     );
  //     deviceTypeMetricsAttributesURL.searchParams.set(
  //       'deviceTypeId',
  //       deviceTypeId,
  //     );
  //     this.logger.debug(
  //       `${this.serviceName} : getMetricsAttributeFormulasFromDeviceType : ${deviceTypeMetricsAttributesURL}`,
  //     );
  //     this.httpService.axiosRef.defaults.headers.common['Authorization'] =
  //       getTokenString(token);
  //     const deviceTypeMetricsAttributesResp = await firstValueFrom(
  //       this.httpService.get<DeviceTypeMetricsAttribute[]>(
  //         deviceTypeMetricsAttributesURL.href,
  //       ),
  //     );

  //     throwErrIfSrvcRespFailure(deviceTypeMetricsAttributesResp);
  //     const deviceTypeMetricsAttributes = deviceTypeMetricsAttributesResp.data;
  //     throwErrIfNoData<DeviceTypeMetricsAttribute>(
  //       deviceTypeMetricsAttributes,
  //       `No device type metrics attributes for ${deviceTypeId}`,
  //     );

  //     const metricsAttributeIDs: string[] = [];

  //     for (const deviceTypeMetricsAttribute of deviceTypeMetricsAttributes) {
  //       metricsAttributeIDs.push(deviceTypeMetricsAttribute.metricsAttributeId);
  //     }

  //     const metricsAttributeFormulasURL = new URL(
  //       METRICS_ATTRIBUTE_FORMULA_BY_MULTIPLE_IDs_URL,
  //       this.baseURL,
  //     );
  //     metricsAttributeFormulasURL.searchParams.set(
  //       'csvMetricsAttributeIDs',
  //       metricsAttributeIDs.join(','),
  //     );
  //     this.logger.debug(
  //       `${this.serviceName} : getMetricsAttributeFormulasURL : ${metricsAttributeFormulasURL}`,
  //     );
  //     /* this.httpService.axiosRef.defaults.headers.common['Authorization'] =
  //       getTokenString(token); */
  //     const metricsAttributeFormulasResp = await firstValueFrom(
  //       this.httpService.get<MetricsAttributeFormula[]>(
  //         metricsAttributeFormulasURL.href,
  //       ),
  //     );
  //     throwErrIfSrvcRespFailure(metricsAttributeFormulasResp);
  //     return metricsAttributeFormulasResp.data;
  //   }
  //   /* async saveTelemetryAlert(inputAlertDto: InputAlertDto) {
  //     const fnName = this.saveTelemetryAlert.name;

  //     let onlyDeviceModelID: string;
  //     let onlyRMUDeviceModelID: string;
  //     let deviceModelID: string;
  //     let rMUDeviceModelID: string;
  //     let onlyDeviceAlertID: string;
  //     let onlyRMUAlertID: string;
  //     let deviceAndRMUAlertID: string;

  //     let deviceModelAlert: DeviceModelAlert | null | undefined;
  //     let searchCriteria: FindDeviceModelAlertDto = {};

  //     switch (inputAlertDto.deviceModelAlertFindMethod) {
  //       case DeviceModelAlertFindMethod.ONLY_DEVICE:
  //         this.logger.debug(`${fnName} : Find master alerts only using device`);

  //         onlyDeviceModelID = inputAlertDto.deviceModelId!;
  //         onlyDeviceAlertID = inputAlertDto.alertId!;

  //         searchCriteria = {
  //           alertId: onlyDeviceAlertID,
  //           deviceModelId: onlyDeviceModelID,
  //         };
  //         break;

  //       case DeviceModelAlertFindMethod.ONLY_RMU:
  //         this.logger.debug(`${fnName} : Find master alerts only using rmu`);

  //         onlyRMUDeviceModelID = inputAlertDto.rmuDeviceModelId!;
  //         onlyRMUAlertID = inputAlertDto.alertId!;

  //         searchCriteria = {
  //           alertId: onlyRMUAlertID,
  //           rmuDeviceModelId: onlyRMUDeviceModelID,
  //         };
  //         break;

  //       case DeviceModelAlertFindMethod.DEVICE_AND_RMU:
  //         this.logger.debug(
  //           `${fnName} : Find master alerts using device and rmu`,
  //         );
  //         deviceModelID = inputAlertDto.deviceModelId!;
  //         rMUDeviceModelID = inputAlertDto.rmuDeviceModelId!;
  //         deviceAndRMUAlertID = inputAlertDto.alertId!;

  //         searchCriteria = {
  //           alertId: deviceAndRMUAlertID,
  //           deviceModelId: deviceModelID,
  //           rmuDeviceModelId: rMUDeviceModelID,
  //         };
  //         break;
  //     }

  //     const { assetId, virtualDeviceId, alertId } = inputAlertDto;

  //     const findAlertDto: FindAlertDto = {
  //       assetId: assetId,
  //       virtualDeviceId: virtualDeviceId,
  //       alertId: Not(alertId!),
  //       closeDateTime: IsNull(),
  //     };
  //     const updateAlertDto: UpdateAlertDto = {
  //       closeDateTime: new Date(),
  //     };
  //     await this.alertService.closeAlerts(findAlertDto, updateAlertDto);

  //     const findCurrOpenAlertDto: FindCurrentOpenAlertDto = {
  //       assetId: assetId,
  //       virtualDeviceId: virtualDeviceId,
  //       alertId: Not(alertId!),
  //       closeDateTime: IsNull(),
  //     };
  //     await this.currentOpenAlertService.delete(findCurrOpenAlertDto);

  //     deviceModelAlert = await this.deviceModelAlertService.findOne(
  //       searchCriteria,
  //     );
  //     let createAlertObj;

  //     if (!deviceModelAlert) {
  //       this.logger.debug(
  //         `${fnName} : No matching master alert found for ${JSON.stringify(
  //           searchCriteria,
  //         )}`,
  //       );
  //     }

  //     const inputAlertObj = new InputAlertDto(inputAlertDto);
  //     createAlertObj = CreateAlertDto.createFromInputAlertDTO(
  //       inputAlertObj,
  //       deviceModelAlert,
  //     );

  //     this.logger.debug(`${fnName} : Creating telemetry alert`);
  //     const savedTelemetryAlert = await this.alertService.create(createAlertObj);

  //     this.logger.debug(`${fnName} : Creating current open telemetry alert`);
  //     const savedCurrTelemetryAlert = await this.currentOpenAlertService.create(
  //       createAlertObj,
  //     );

  //     return savedTelemetryAlert;
  //   } */

  //   private async getDeviceModelAlerts(deviceModelIDs: string[], event: string) {
  //     const relationsRequired = true;
  //     return await this.deviceModelService.findFromCSVIDs(
  //       deviceModelIDs.join(','),
  //       '',
  //       relationsRequired,
  //     );
  //     /* const deviceModelURL = new URL(
  //       DEVICE_MODEL_BY_CSVIDS_RELATIONS_URL,
  //       this.baseURL,
  //     );
  //     deviceModelURL.searchParams.append('csvIDs', deviceModelIDs.toString());
  //     this.logger.debug(
  //       `${this.serviceName} : ${event} : Device Model URL : ${deviceModelURL.href}`,
  //     );

  //     const deviceModelResp = await firstValueFrom(
  //       this.httpService.get<DeviceModel[]>(deviceModelURL.href),
  //     );

  //     throwErrIfSrvcRespFailure(deviceModelResp);

  //     const deviceModels = deviceModelResp.data as DeviceModel[];
  //     return deviceModels; */
  //   }

  //   /* Pending virtual Device ID changes */
  //   private async getDevices(createAlertDTOs: CreateAlertDto[]) {
  //     const assetIDSet = new Set<string>();
  //     const virtualDeviceIDSet = new Set<string>();
  //     const fnIdentifier = this.getDevices.name;

  //     //const deviceIDs = createAlertDTOs.map((cADTO) => cADTO.deviceId);
  //     createAlertDTOs.map((createAlertDTO) => {
  //       createAlertDTO.assetId ? assetIDSet.add(createAlertDTO.assetId) : null;
  //       createAlertDTO.virtualDeviceId
  //         ? virtualDeviceIDSet.add(createAlertDTO.virtualDeviceId)
  //         : null;
  //     });

  //     const csvAssetIDs = Array.from(assetIDSet).toString();
  //     const csvVirtualDeviceIDs = Array.from(virtualDeviceIDSet).toString();

  //     //const findDeviceFromMultipleIDs = {
  //     //  csvAssetIDs: csvAssetIDs,
  //     //  csvVirtualDeviceIDs: csvVirtualDeviceIDs,
  //     //};

  //     return await this.findDevicesFromMultipleIDs2({
  //       csvAssetIDs: csvAssetIDs,
  //       csvVirtualDeviceIDs: csvVirtualDeviceIDs,
  //     });

  //     /*  return await this.deviceService.findAllByMultipleIDs(
  //       findDeviceFromMultipleIDs,
  //     ); */
  //     /* const deviceURL = new URL(DEVICE_FROM_MULTIPLE_IDS_URL, this.baseURL);
  //     getSearchParamsforURL(deviceURL, JSON.stringify(findDeviceFromMultipleIDs));

  //     this.logger.debug(`${fnIdentifier} : Device URL : ${deviceURL.href}`);

  //     const deviceURLResp = await firstValueFrom(
  //       this.httpService.get<Device[]>(deviceURL.href),
  //     );
  //     throwErrIfSrvcRespFailure(deviceURLResp);

  //     return deviceURLResp.data as Device[]; */
  //   }

  //   async closeTelemetryAlerts(findAlertDto: FindAlertDto) {
  //     const event = `Close Telemetry Alerts : Input : ${JSON.stringify(
  //       findAlertDto,
  //     )}`;
  //     try {
  //       this.logger.debug(`${this.serviceName} : ${event} : Start`);
  //       const updatedAlert = await this.alertService.closeAlert(
  //         findAlertDto,
  //         findAlertDto.closeDateTime as Date,
  //       );

  //       const deletedCurrentAlert = await this.currentOpenAlertService.delete(
  //         findAlertDto,
  //       );
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${this.serviceName} : ${event} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${this.serviceName} : ${event} : End`);
  //     }
  //   }

  //   async closeTelemetryAlertsForVD(findAlertDto: FindAlertDto) {
  //     const fnName = this.closeTelemetryAlertsForVD.name;
  //     const input = `${fnName} : Input : ${JSON.stringify(findAlertDto)}`;
  //     //try {
  //     this.logger.debug(`${fnName} : ${input}`);
  //     const updatedAlerts = await this.alertService.closeAlerts(
  //       findAlertDto,
  //       findAlertDto.closeDateTime as Date,
  //     );
  //     this.logger.debug(
  //       `${fnName} : Closed No of Alerts : ${updatedAlerts.affected}})}`,
  //     );
  //     const deletedCurrentAlert = await this.currentOpenAlertService.delete(
  //       findAlertDto,
  //     );
  //     this.logger.debug(
  //       `${fnName} : No of Deleted Current Alerts : ${deletedCurrentAlert.affected},
  //       )}`,
  //     );
  //     /* } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${this.serviceName} : ${event} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${this.serviceName} : ${event} : End`);
  //     } */
  //   }


  //   /*Compare this with findDevicesFromMultipleIDs2 */
  //   /* async findDevicesFromMultipleIDs(
  //     findDevicesFromMultipleIDsMgr: FindDevicesFromMultipleIDs,
  //     csvRelations?: string,
  //   ) {
  //     const msgTemplate = `${this.serviceName}.findDevicesByMultipleIDs`;
  //     const event = `Input : ${JSON.stringify(
  //       findDevicesFromMultipleIDsMgr,
  //     )}, relations : ${csvRelations}`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : ${event} : Start`);

  //       const devicesFromMultipleIDsURL = new URL(
  //         DEVICE_FROM_MULTIPLE_IDS_URL,
  //         this.baseURL,
  //       );

  //       const inputCSVOrgIDs = findDevicesFromMultipleIDsMgr.csvOrgIDs;
  //       const csvAssetTypeIDs = findDevicesFromMultipleIDsMgr.csvAssetTypeIDs;
  //       const csvAssetIDs = findDevicesFromMultipleIDsMgr.csvAssetIDs;
  //       const csvVirtualDeviceIDs =
  //         findDevicesFromMultipleIDsMgr.csvVirtualDeviceIDs;

  //       if (inputCSVOrgIDs) {
  //         const orgs = await this.getDescedentsOrgs(inputCSVOrgIDs);
  //         if (!_.isNil(orgs)) {
  //           const csvOrgIDs = orgs.map((org) => org.id).join(',');
  //           devicesFromMultipleIDsURL.searchParams.append('csvOrgIDs', csvOrgIDs);
  //         }
  //       }

  //       csvAssetTypeIDs
  //         ? devicesFromMultipleIDsURL.searchParams.append(
  //             'csvAssetTypeIDs',
  //             csvAssetTypeIDs,
  //           )
  //         : null;
  //       csvAssetIDs
  //         ? devicesFromMultipleIDsURL.searchParams.append(
  //             'csvAssetIDs',
  //             csvAssetIDs,
  //           )
  //         : null;
  //       csvVirtualDeviceIDs
  //         ? devicesFromMultipleIDsURL.searchParams.append(
  //             'csvVirtualDeviceIDs',
  //             csvVirtualDeviceIDs,
  //           )
  //         : null;

  //       csvRelations
  //         ? devicesFromMultipleIDsURL.searchParams.append(
  //             'csvRelations',
  //             csvRelations,
  //           )
  //         : null;
  //       this.logger.debug(
  //         `${msgTemplate}: Devices URL : ${devicesFromMultipleIDsURL.href}`,
  //       );
  //       const devicesFromMultipleIDsResp = await firstValueFrom(
  //         this.httpService.get<Device[]>(devicesFromMultipleIDsURL.href),
  //       );
  //       throwErrIfSrvcRespFailure(devicesFromMultipleIDsResp);

  //       return devicesFromMultipleIDsResp.data;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${event} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   } */

  //   /*  async findDevicesFromMultipleIDs(findDevices: FindDevicesFromMultipleIDs) {
  //     const fnName = `findDevicesByMultipleIDs()`;
  //     const input = `Input : ${JSON.stringify(findDevices)}`;
  //     //try {
  //     this.logger.debug(`${fnName} : Start`);
  //     this.logger.debug(`${fnName} : ${input}`);

  //     if (findDevices.csvOwnerOrgIDs) {
  //       const orgs = await this.getDescendentsOrgs(findDevices.csvOwnerOrgIDs);
  //       if (!_.isNil(orgs)) {
  //         const csvOrgIDs = orgs.map((org) => org.id).join(',');
  //         findDevices.csvOwnerOrgIDs = csvOrgIDs;
  //         this.logger.debug(
  //           `${fnName} : csvOwnerOrgIDs are : ${findDevices.csvOwnerOrgIDs}`,
  //         );
  //       }
  //     }

  //     const devices = await this.deviceService.findAllByMultipleIDs(
  //       findDevices,
  //       Relations.MIN,
  //     );

  //     this.logger.debug(`No of devices : ${devices?.length}`);
  //     const deviceDTOs: DeviceDto[] = [];
  //     _.isEmpty(devices)
  //       ? null
  //       : devices!.map((device) => deviceDTOs.push(new DeviceDto(device)));
  //     this.logger.debug(`Returning ${deviceDTOs.length} DeviceDTOs`);
  //     this.logger.debug(`${fnName} : ${JSON.stringify([...deviceDTOs])}`);
  //     deviceDTOs.sort((a, b) => a.serialNo.localeCompare(b.serialNo));
  //     return deviceDTOs;
  //   } */

  //   async findUnAttachedDevicesByMultipleIDs(
  //     findDevices: FindDevicesFromMultipleIDs,
  //   ) {
  //     const fnName = `findUnAttachedDevicesByMultipleIDs()`;
  //     const input = `Input : ${JSON.stringify(findDevices)}`;
  //     //try {
  //     /* this.logger.debug(`${fnName} : Start`);
  //     this.logger.debug(`${fnName} : ${input}`); */

  //     if (findDevices.csvOrgIDs) {
  //       const orgs = await this.getDescendentsOrgs(findDevices.csvOrgIDs);
  //       if (!_.isNil(orgs)) {
  //         const csvOrgIDs = orgs.map((org) => org.id).join(',');
  //         findDevices.csvOrgIDs = csvOrgIDs;
  //         this.logger.debug(
  //           `${fnName} : csvOrgIDs are : ${findDevices.csvOrgIDs}`,
  //         );
  //       }
  //     }

  //     const devices = await this.deviceService.findUnAttachedDevicesByMultipleIDs(
  //       findDevices,
  //       Relations.MIN,
  //     );

  //     this.logger.debug(`No of devices : ${devices?.length}`);
  //     const deviceDTOs: DeviceDto[] = [];
  //     _.isEmpty(devices)
  //       ? null
  //       : devices!.map((device) => deviceDTOs.push(new DeviceDto(device)));
  //     /* this.logger.debug(`Returning ${deviceDTOs.length} DeviceDTOs`);
  //     this.logger.debug(`${fnName} : ${JSON.stringify([...deviceDTOs])}`); */
  //     return deviceDTOs;
  //   }

  //   async findUsersByMultipleIDs(
  //     searchCriteria: FindUsersByMultipleIDs,
  //     csvRelations?: string,
  //   ) {
  //     const msgTemplate = 'Find By MultipleIDs ' + this.serviceName + 's';
  //     const event = `Input : ${JSON.stringify(searchCriteria)}`;

  //     try {
  //       this.logger.debug(`${msgTemplate} : ${event} : Start`);
  //       const relations =
  //         csvRelations && csvRelations.length > 0 ? csvRelations.split(',') : [];

  //       if (searchCriteria.csvOrgIDs) {
  //         const descendentOrgs = await this.getDescendentsOrgs(
  //           searchCriteria.csvOrgIDs,
  //         );
  //         //const descedentOrgsURL = new URL(
  //         //  DESCEDENTS_ORGS_WITH_SPECIFIED_RELATIONS_URL,
  //         //  this.baseURL,
  //         //);
  //         //descedentOrgsURL.searchParams.append(
  //         //  'csvOrgIDs',
  //         //  searchCriteria.csvOrgIDs,
  //         //);
  //         //this.logger.debug(
  //         //  `${msgTemplate} : ${event} : Descendents Orgs URL : ${descedentOrgsURL.href}`,
  //         //);
  //         //const descedentOrgsResp = await firstValueFrom(
  //         //  this.httpService.get<Org[]>(descedentOrgsURL.toString()),
  //         //);
  //         //throwErrIfSrvcRespFailure(descedentOrgsResp);
  //         const applicableOrgIDs: Array<string> = descendentOrgs.map(
  //           (org) => org.id,
  //         );
  //         //const csvApplicableOrgIDs = applicableOrgIDs.toString();

  //         const users = await this.userService.findUsersByMultipleIDs({
  //           csvOrgIDs: applicableOrgIDs.join(','),
  //         });
  //         return users;
  //         //const usersURL = new URL(USERS_BY_MULTIPLE_IDS, this.baseURL);
  //         //usersURL.searchParams.append('csvOrgIDs', csvApplicableOrgIDs);
  //         //csvRelations
  //         //  ? usersURL.searchParams.append('csvRelations', csvRelations)
  //         //  : null;

  //         //this.logger.debug(
  //         //  `${msgTemplate} : ${event} : Users URL : ${usersURL.href}`,
  //         //);
  //         //const usersResp = await firstValueFrom(
  //         //  this.httpService.get<Array<User>>(usersURL.href),
  //         //);
  //         //throwErrIfSrvcRespFailure(usersResp);
  //         //return usersResp.data;
  //       }
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${event} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : ${event} : End`);
  //     }
  //   }

  //   /* async getMetricsAttributes(
  //     csvAssetIDs: string,
  //     csvVirtualDeviceIDs?: string,
  //   ) {
  //     const event = `Input : Asset IDs : ${csvAssetIDs}, Virtual Device IDs : ${csvVirtualDeviceIDs}`;
  //     const msgTemplate = `Find Metrics Attributes : ${this.serviceName} : ${event}`;
  //     try {
  //       const currTelemetryPyldURL = new URL(
  //         CURR_TELEMETRY_PAYLOAD_BY_MULTIPLE_IDs_URL,
  //         this.baseURL,
  //       );

  //       currTelemetryPyldURL.searchParams.append('csvAssetIDs', csvAssetIDs);
  //       csvVirtualDeviceIDs
  //         ? currTelemetryPyldURL.searchParams.append(
  //             'csvVirtualDeviceIDs',
  //             csvVirtualDeviceIDs,
  //           )
  //         : null;

  //       this.logger.debug(
  //         `${msgTemplate} : Curr Telemetry Payload URL : ${currTelemetryPyldURL}`,
  //       );

  //       const currTelemetryPyldResp = await firstValueFrom(
  //         this.httpService.get<CurrentTelemetryPayload[]>(
  //           currTelemetryPyldURL.href,
  //         ),
  //       );

  //       throwErrIfSrvcRespFailure(currTelemetryPyldResp);

  //       return currTelemetryPyldResp.data;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : End`);
  //     }
  //   } */

  //   async getDeviceCurrentTelemetry(
  //     assetID: string,
  //     virtualDeviceID: string,
  //     deviceTypeID: string,
  //   ) {
  //     const event = `Input : Asset ID : ${assetID}, Virtual Device ID : ${virtualDeviceID}, Device type ID : ${deviceTypeID}`;
  //     const msgTemplate = `${this.serviceName} : ${event}`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : Start`);

  //       let currentTelemetryPayloadDTOs = [];
  //       let telemetryDisplayPropertyByAttribute = new Map();
  //       let existingDisplayOrders = [];

  //       const currTelemetryPayloadSearchCriteria: FindCurrentTelemetryPayloadsByMultipleIDs =
  //         {
  //           csvAssetIDs: assetID,
  //           csvVirtualDeviceIDs: virtualDeviceID,
  //         };

  //       const currentTelemetryPayloads =
  //         await this.getCurrentTelemetryPayloadsByMultipleIDs(
  //           currTelemetryPayloadSearchCriteria,
  //         );

  //       const forDisplay = true;
  //       const deviceTypeMetricsAttributeDictionaries =
  //         await this.getDeviceTypeMetricsAttributeByMultipleIDs(
  //           {
  //             csvDeviceTypeIDs: deviceTypeID,
  //           },
  //           forDisplay,
  //         );

  //       /* const [deviceTypeMetricsAttributeDictionaries, currentTelemetryPayloads] =
  //         await Promise.all([
  //           getDeviceTypeMetricsAttributeDictionaries,
  //           getCurrentTelemetryPayloads,
  //         ]); */
  //       this.logger.debug('Iterating deviceTypeMetricsAttributes');
  //       for (const deviceTypeMetricsAttribute of deviceTypeMetricsAttributeDictionaries) {
  //         const metricsAttributeId =
  //           deviceTypeMetricsAttribute.metricsAttributeId;
  //         /* this.logger.debug(`attribute : ${metricsAttributeId}`);
  //         this.logger.debug(
  //           `Device type metrics attribute : ${JSON.stringify(
  //             deviceTypeMetricsAttribute,
  //           )}`,
  //         ); */
  //         const telemetryDisplayProperty: TelemetryDisplayProperty = {
  //           metricsAttributeId: metricsAttributeId,
  //           frequency: deviceTypeMetricsAttribute.metricsAttribute.frequency,
  //           displayName: metricsAttributeId,
  //           displayOrder: deviceTypeMetricsAttribute.displayOrder,
  //         };
  //         telemetryDisplayPropertyByAttribute.set(
  //           metricsAttributeId,
  //           telemetryDisplayProperty,
  //         );
  //       }

  //       /* this.logger.debug(
  //         `displaying the attribute map formed  :`,
  //         telemetryDisplayPropertyByAttribute,
  //       ); */

  //       for (const currentTelemetryPayload of currentTelemetryPayloads) {
  //         let metricsAttributeId =
  //           currentTelemetryPayload.metric.metricsAttributeId;
  //         if (telemetryDisplayPropertyByAttribute.has(metricsAttributeId)) {
  //           const currentTelemetryPayloadDto = new CurrentTelemetryPayloadDTO(
  //             getMetricDTO(currentTelemetryPayload.metric),
  //             //new MetricDto(currentTelemetryPayload.metric),
  //             telemetryDisplayPropertyByAttribute.get(metricsAttributeId),
  //             TelemetryDevice.createFromTelemetry(currentTelemetryPayload),
  //           );
  //           currentTelemetryPayloadDTOs.push(currentTelemetryPayloadDto);
  //         }
  //         /* const telemetryDisplayProperty: TelemetryDisplayProperty =
  //           telemetryDisplayPropertyByAttribute.has(metricsAttributeId)
  //             ? telemetryDisplayPropertyByAttribute.get(metricsAttributeId)
  //             : {
  //                 metricsAttributeId: metricsAttributeId,
  //                 frequency: currentTelemetryPayload.metric.frequency,
  //                 displayName: metricsAttributeId,
  //                 displayOrder: Number.MAX_SAFE_INTEGER,
  //               };
  //         const currentTelemetryPayloadDto = new CurrentTelemetryPayloadDTO(
  //           getMetricDTO(currentTelemetryPayload.metric),
  //           //new MetricDto(currentTelemetryPayload.metric),
  //           telemetryDisplayProperty,
  //           TelemetryDevice.createFromTelemetry(currentTelemetryPayload),
  //         );
  //         currentTelemetryPayloadDTOs.push(currentTelemetryPayloadDto); */
  //       }
  //       return currentTelemetryPayloadDTOs;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   }

  //   async getOrderedMetricsAttributes(
  //     findCurrentTelemetryPayloadsByMultipleIDs: FindCurrentTelemetryPayloadsByMultipleIDs,
  //   ) {
  //     const event = `Input : ${JSON.stringify(
  //       findCurrentTelemetryPayloadsByMultipleIDs,
  //     )}`;
  //     const msgTemplate = `${this.serviceName} : ${event}`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : Start`);
  //       const currentTelemetryPayloads =
  //         await this.getCurrentTelemetryPayloadsByMultipleIDs(
  //           findCurrentTelemetryPayloadsByMultipleIDs,
  //         );
  //       /* const currentTelemetryPayloads = await this.getMetricsAttributes(
  //         csvAssetIDs,
  //         csvVirtualDeviceIDs,
  //       ); */
  //       if (currentTelemetryPayloads.length == 0) {
  //         return {};
  //       } else {
  //         const deviceIDSet = new Set<string>();
  //         const attributeSet = new Set<string>();

  //         for (const currentTelemetryPayload of currentTelemetryPayloads) {
  //           currentTelemetryPayload.deviceId
  //             ? deviceIDSet.add(currentTelemetryPayload.deviceId)
  //             : null;
  //           attributeSet.add(currentTelemetryPayload.metric.metricsAttributeId);
  //         }

  //         const csvUniqDeviceIDs = Array.from(deviceIDSet).join(',');
  //         const csvUniqAttributes = Array.from(attributeSet).join(',');

  //         const deviceWithDeviceModels =
  //           await this.deviceService.findDvceAndDvceModel(csvUniqDeviceIDs);

  //         /* const deviceWithDeviceModelsURL = new URL(
  //           DEVICE_WITH_DEVICE_MODEL_URL,
  //           this.baseURL,
  //         );
  //         deviceWithDeviceModelsURL.searchParams.append(
  //           'deviceIds',
  //           csvUniqDeviceIDs,
  //         );

  //         this.logger.debug(
  //           `${msgTemplate} : Device With Device Model URL : ${deviceWithDeviceModelsURL.href}`,
  //         );

  //         const deviceWithDeviceModelURLResp = await firstValueFrom(
  //           this.httpService.get<Device[]>(deviceWithDeviceModelsURL.href),
  //         );

  //         throwErrIfSrvcRespFailure(deviceWithDeviceModelURLResp);
  //         throwErrIfNoRespData(
  //           deviceWithDeviceModelURLResp,
  //           `${msgTemplate} : ${csvUniqDeviceIDs} Device IDs not found`,
  //         );
  //  */
  //         throwErrIfNoData(
  //           deviceWithDeviceModels,
  //           `${msgTemplate} : Devices not available for ${csvUniqDeviceIDs}`,
  //         );
  //         const csvUniqDeviceTypes = deviceWithDeviceModels
  //           .map((device) => device.deviceModel.deviceTypeId)
  //           .join(',');

  //         const searchCriteria: FindDeviceTypeMetricsAttributeByMultipleIDsDto = {
  //           csvDeviceTypeIDs: csvUniqDeviceTypes,
  //           csvMetricsAttributeIDs: csvUniqAttributes,
  //         };
  //         const forDisplay = true;
  //         const deviceTypeWithMetricsAttributes =
  //           await this.getDeviceTypeMetricsAttributeByMultipleIDs(
  //             searchCriteria,
  //             forDisplay,
  //           );

  //         /*const groupedByDeviceType = _.groupBy(
  //           deviceTypeWithMetricsAttributes,
  //           'deviceTypeId',
  //         );
  //         const response = _.mapValues(groupedByDeviceType, function (records) {
  //           return records.map((record) => {
  //             const { auditDateTime, ...metricsAttribute } =
  //               record.metricsAttribute;
  //             return metricsAttribute;
  //           });
  //         }); */

  //         return deviceTypeWithMetricsAttributes;
  //       }

  //       /* const orderedMetricsAttributes: OrderedMetricsAttribute[] = [];

  //       for (const deviceTypeMetricsAttribute of deviceTypeWithMetricsAttributes) {
  //         orderedMetricsAttributes.push(
  //           new OrderedMetricsAttribute(deviceTypeMetricsAttribute),
  //         );
  //       }
  //       return orderedMetricsAttributes; */

  //       //return deviceTypeWithMetricsAttributes;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : End`);
  //     }
  //   }

  //   async getOnlyMetricsAttributes(
  //     findCurrentTelemetryPayloadsByMultipleIDs: FindCurrentTelemetryPayloadsByMultipleIDs,
  //   ) {
  //     const event = `Input : ${JSON.stringify(
  //       findCurrentTelemetryPayloadsByMultipleIDs,
  //     )}`;
  //     const msgTemplate = `${this.serviceName} : ${event}`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : Start`);
  //       const currentTelemetryPayloads =
  //         await this.getCurrentTelemetryPayloadsByMultipleIDs(
  //           findCurrentTelemetryPayloadsByMultipleIDs,
  //         );

  //       return currentTelemetryPayloads.map(
  //         (currentTelemetryPayload) =>
  //           currentTelemetryPayload.metric.metricsAttributeId,
  //       );
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : End`);
  //     }
  //   }

  //   /* async getOnlyMetricsFromDeviceIDs(csvDeviceIDs: string) {
  //     const event = `Input : CSV Device IDs : ${csvDeviceIDs}`;
  //     const msgTemplate = `${this.serviceName}.getOnlyMetricsFromDeviceIDs() : ${event}`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : Start`);

  //       const deviceURL = new URL(DEVICE_FROM_MULTIPLE_IDS_URL, this.baseURL);
  //       deviceURL.searchParams.append('csvDeviceIDs', csvDeviceIDs);
  //       this.logger.debug(`${msgTemplate} : Device URL : ${deviceURL.href}`);
  //       const deviceResp = await firstValueFrom(
  //         this.httpService.get<Device[]>(deviceURL.href),
  //       );
  //       throwErrIfSrvcRespFailure(deviceResp);

  //       const devices = deviceResp.data;
  //       const assetIDs = [];
  //       const virtualDeviceIDs = [];
  //       for (const device of devices) {
  //         assetIDs.push(device.assetId);
  //         virtualDeviceIDs.push(device.virtualId);
  //       }



  //       return await this.getOnlyMetricsAttributes(
  //         assetIDs.join(','),
  //         virtualDeviceIDs.join(','),
  //       );
  //     } catch (error) {
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : End`);
  //     }

  //   } */

  //   /* async getAssetWithUniqueDeviceModels(csvAssetIDs: string) {
  //     const event = 'Input : ' + csvAssetIDs;
  //     const msgTemplate =
  //       this.serviceName + '.getAssetWithUniqueDeviceModels()' + event;

  //     try {
  //       this.logger.debug(`${msgTemplate} : Start`);

  //       const assetURL = new URL(ASSET_BY_ASSET_IDs_URL, this.baseURL);

  //       let searchObject = {
  //         csvAssetIDs: csvAssetIDs,
  //         csvRelations: DEVICES,
  //       };

  //       getSearchParamsforURL(assetURL, JSON.stringify(searchObject));

  //       this.logger.debug(`${msgTemplate} : Asset URL : ${assetURL.href}`);

  //       const assetResp = await firstValueFrom(
  //         this.httpService.get<Asset[]>(assetURL.href),
  //       );

  //       throwErrIfSrvcRespFailure(assetResp);

  //       //this.logger.debug('asset info:' + JSON.stringify(assetDetail, null, 2));

  //       const allDevices = new Array<VirtualDevice>();
  //       for (const asset of assetResp.data) {
  //         asset.virtualDevices ? allDevices.push(...asset.virtualDevices) : null;
  //       }

  //       if (_.isNil(allDevices)) {
  //         return [];
  //       } else {
  //         const devicesWithUniqDeviceModels = _.uniqBy(
  //           allDevices,
  //           'deviceModelId',
  //         );
  //         const csvUniqueDeviceModelIDs = devicesWithUniqDeviceModels
  //           .map((device) => device.deviceModelId)
  //           .join(',');
  //         const deviceModelURL = new URL(DEVICE_MODEL_BY_CSVIDS_URL);
  //         deviceModelURL.searchParams.append('csvIDs', csvUniqueDeviceModelIDs);

  //         const deviceModelResp = await firstValueFrom(
  //           this.httpService.get<DeviceModel[]>(deviceModelURL.href),
  //         );

  //         throwErrIfSrvcRespFailure(deviceModelResp);

  //         return deviceModelResp.data;
  //       }
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   } */

  //   /*Not used */
  //   /* async getDeviceTypeWiseAttribs(findOrgsOrAssets: FindOrgsOrAssets) {
  //     const event = `Input : ${JSON.stringify(findOrgsOrAssets)}`;
  //     const msgTemplate = `${this.serviceName}.deviceTypeWiseAttribs() : ${event}`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : Start`);

  //       if (findOrgsOrAssets.csvOrgIDs && _.isNil(findOrgsOrAssets.csvAssetIDs)) {
  //         const descendentOrgs = await this.getDescendentsOrgs(
  //           findOrgsOrAssets.csvOrgIDs,
  //         );
  //         const csvDescendentOrgIDs = descendentOrgs
  //           .map((org) => org.id)
  //           .join(',');
  //         findOrgsOrAssets.csvOrgIDs = csvDescendentOrgIDs;
  //       }
  //       const deviceURL = new URL(DEVICE_FROM_MULTIPLE_IDS_URL, this.baseURL);
  //       getSearchParamsforURL(deviceURL, JSON.stringify(findOrgsOrAssets));
  //       deviceURL.searchParams.append(
  //         'csvRelations',
  //         `${DEVICE_MODEL},${CURRENT_OPEN_ALERTS}`,
  //       );

  //       this.logger.debug(`Devices URL : ${deviceURL.href}`);

  //       const devicesResp = await firstValueFrom(
  //         this.httpService.get<Device[]>(deviceURL.href),
  //       );

  //       const devices = new Devices(devicesResp.data);

  //       return devices.getDevicesAttribs();

  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : End`);
  //     }
  //   } */

  //   /* private async getDeviceTypeMetricsAttribute(
  //     msgTemplate: string,
  //     deviceTypeID: string,
  //   ) {
  //     const event = `Inputs : Device type ID : ${deviceTypeID}`;
  //     const fnIdentifier =
  //       msgTemplate.concat('getDeviceTypeMetricsAttributeDicitonary') +
  //       ' ' +
  //       event;
  //     try {
  //       this.logger.debug(`${fnIdentifier} : Start`);
  //       const deviceTypeMetricsAttributeURL = new URL(
  //         DEVICE_TYPE_METRICS_ATTRIBUTE_URL,
  //         this.baseURL,
  //       );
  //       deviceTypeMetricsAttributeURL.searchParams.append(
  //         'deviceTypeId',
  //         deviceTypeID,
  //       );
  //       this.logger.debug(
  //         `${fnIdentifier} : Device Type Metrics attribute URL = ${deviceTypeMetricsAttributeURL.href}`,
  //       );

  //       let deviceTypeMetricsAttributeResponse = await firstValueFrom(
  //         this.httpService.get<DeviceTypeMetricsAttribute[]>(
  //           deviceTypeMetricsAttributeURL.href,
  //         ),
  //       );

  //       throwErrIfSrvcRespFailure(deviceTypeMetricsAttributeResponse);
  //       return deviceTypeMetricsAttributeResponse.data;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       throw new Error(errMsg);
  //     } finally {
  //       this.logger.debug(`${fnIdentifier} : End`);
  //     }
  //   } */

  //   private async getDeviceTypeMetricsAttributeByMultipleIDs(
  //     searchCriteria: FindDeviceTypeMetricsAttributeByMultipleIDsDto,
  //     forDisplay: boolean = false,
  //     //msgTemplate: string,
  //   ) {
  //     const event = `Inputs : ${JSON.stringify(searchCriteria)}`;
  //     const fnIdentifier =
  //       'getDeviceTypeMetricsAttributeByMultipleIDs()' + ' ' + event;
  //     try {
  //       this.logger.debug(`${fnIdentifier} : Start`);
  //       const relationsRequired = true;
  //       return await this.deviceTypeMetricsAttributeService.findByMultipleIDs(
  //         searchCriteria,
  //         relationsRequired,
  //         forDisplay,
  //       );
  //       /* const deviceTypeMetricsAttributeURL = new URL(
  //         DEVICE_TYPE_METRICS_ATTRIBUTE_BY_MULTIPLE_IDs_WITH_RELATIONS_URL,
  //         this.baseURL,
  //       );
  //       getSearchParamsforURL(
  //         deviceTypeMetricsAttributeURL,
  //         JSON.stringify(searchCriteria),
  //       );
  //       this.logger.debug(
  //         `${fnIdentifier} : Device Type Metrics attribute URL = ${deviceTypeMetricsAttributeURL.href}`,
  //       );

  //       let deviceTypeMetricsAttributeResponse = await firstValueFrom(
  //         this.httpService.get<DeviceTypeMetricsAttribute[]>(
  //           deviceTypeMetricsAttributeURL.href,
  //         ),
  //       );

  //       throwErrIfSrvcRespFailure(deviceTypeMetricsAttributeResponse);
  //       return deviceTypeMetricsAttributeResponse.data; */
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       throw new Error(errMsg);
  //     } finally {
  //       this.logger.debug(`${fnIdentifier} : End`);
  //     }
  //   }

  //   async getUnit(csvDeviceModelIDs: string, csvRelations: string) {
  //     const fnIdentifier = `getUnit ()`;
  //     let deviceTypeMetricsAttributes: DeviceTypeMetricsAttribute[] = [];
  //     const deviceModelMapWithUnits = new Map<string, DeviceModelAttributeDto>();
  //     function getDeviceTypeID(
  //       deviceTypeMetricsAttribute: DeviceTypeMetricsAttribute,
  //     ) {
  //       return deviceTypeMetricsAttribute.deviceTypeId;
  //     }
  //     try {
  //       this.logger.debug(
  //         `${fnIdentifier} : Start : Input : ${csvDeviceModelIDs} and ${csvRelations}`,
  //       );

  //       const deviceModels = await this.deviceModelService.findUnits(
  //         csvDeviceModelIDs,
  //       );
  //       /* const deviceModelURL = new URL(DEVICEMODEL_WITH_UNITS, this.baseURL);

  //       deviceModelURL.searchParams.append('csvIDs', csvDeviceModelIDs);
  //       this.logger.debug(`device-model-url :${deviceModelURL.href}`);

  //       const deviceModelResp = await firstValueFrom(
  //         this.httpService.get<DeviceModel[]>(deviceModelURL.href),
  //       );

  //       throwErrIfSrvcRespFailure(deviceModelResp);

  //       const deviceModels = deviceModelResp.data; */
  //       this.logger.debug(
  //         `No. of records found for device-model for the DeviceModelIDs : ${csvDeviceModelIDs} : ${deviceModels.length} `,
  //       );

  //       const deviceTypeIDs = deviceModels.map(
  //         (deviceModel) => deviceModel.deviceTypeId,
  //       );
  //       const csvDeviceTypeIDs = deviceTypeIDs.join(',');

  //       deviceTypeMetricsAttributes =
  //         await this.getDeviceTypeMetricsAttributeByMultipleIDs({
  //           csvDeviceTypeIDs: csvDeviceTypeIDs,
  //         });

  //       /* const deviceTypeMetricsAttributeURL = new URL(
  //         DEVICETYPE_METRICSATTRIBUTE_URL,
  //         this.baseURL,
  //       );
  //       deviceTypeMetricsAttributeURL.searchParams.append(
  //         'csvDeviceTypeIDs',
  //         csvDeviceTypeIDs,
  //       );
  //       this.logger.debug(
  //         `DeviceType - MetricsAttribute by csvDeviceTypeIDs URL : ${deviceTypeMetricsAttributeURL.href}`,
  //       );

  //       const deviceTypeMetricsAttributeResp = await firstValueFrom(
  //         this.httpService.get<DeviceTypeMetricsAttribute[]>(
  //           deviceTypeMetricsAttributeURL.href,
  //         ),
  //       );
  //       throwErrIfSrvcRespFailure(deviceTypeMetricsAttributeResp); 
  //       deviceTypeMetricsAttributes = deviceTypeMetricsAttributeResp.data;*/
  //       this.logger.debug(
  //         `No. of records found for device-type- metrics-attribute : for the DeviceTypeID : ${csvDeviceTypeIDs} : ${deviceTypeMetricsAttributes.length}`,
  //       );

  //       const groupedDeviceTypeMetricsAttributes = _.groupBy(
  //         deviceTypeMetricsAttributes,
  //         getDeviceTypeID,
  //       );
  //       //return groupedDeviceTypeMetricsAttributes;

  //       /* deviceTypeMetricsAttributes.forEach((deviceTypeMetricsAttribute)=>
  //                   {
  //                     const deviceTypeId = deviceTypeMetricsAttribute.deviceTypeId;
  //                       if (!kDvceTypeVDvceTypeMtrcsAttribUnits.has(deviceTypeId)) 
  //                         {
  //                           kDvceTypeVDvceTypeMtrcsAttribUnits.set(deviceTypeId, [deviceTypeMetricsAttribute]);
  //                         } 
  //                         else 
  //                         {
  //                           const existingRecords  = kDvceTypeVDvceTypeMtrcsAttribUnits.get(deviceTypeId) || [];
  //                           existingRecords.push(deviceTypeMetricsAttribute);
  //                           kDvceTypeVDvceTypeMtrcsAttribUnits.set(deviceTypeId,existingRecords);
  //                         }
  //                   }); 
  //                 this.logger.debug(`No of device types in deviceTypeAttributeMap : ${kDvceTypeVDvceTypeMtrcsAttribUnits.size}\n
  //                 contents of deviceTypeAttributeMap : ____deviceTypeId:[DeviceTypeMetricAttribute]_____`);
  //                 kDvceTypeVDvceTypeMtrcsAttribUnits.forEach((attributeUnits, deviceTypeID) => 
  //                           {  this.logger.debug(`{${deviceTypeID} => ${JSON.stringify(attributeUnits.length)}}`);  });*/

  //       for (const deviceModel of deviceModels) {
  //         //const defaultUnits = kDvceTypeVDvceTypeMtrcsAttribUnits.get(deviceModel.deviceTypeId);
  //         this.logger.debug(
  //           `Device model : ${deviceModel.id}, Device type : ${deviceModel.deviceTypeId}`,
  //         );
  //         const defaultUnits = _.get(
  //           groupedDeviceTypeMetricsAttributes,
  //           deviceModel.deviceTypeId,
  //         );
  //         /* const defaultUnits =
  //           groupedDeviceTypeMetricsAttributes[deviceModel.deviceTypeId]; */
  //         this.logger.debug(`No of default units : ${defaultUnits.length}`);
  //         if (defaultUnits && defaultUnits.length > 0) {
  //           for (const defaultUnit of defaultUnits) {
  //             const deviceModelIdAttributeKey =
  //               deviceModel.id + KEY_SEPARATOR + defaultUnit.metricsAttributeId;
  //             /*  this.logger.debug(
  //               `Default unit key : ${deviceModelIdAttributeKey}`,
  //             ); */
  //             const deviceModelDefaultUnit: DeviceModelAttributeDto = {
  //               deviceModelId: deviceModel.id,
  //               metricsAttribute: defaultUnit.metricsAttribute,
  //               unitId: defaultUnit.unitId,
  //             };
  //             deviceModelMapWithUnits.set(
  //               deviceModelIdAttributeKey,
  //               deviceModelDefaultUnit,
  //             );
  //             /* this.logger.debug(
  //               `Key : ${deviceModelIdAttributeKey}, value : ${JSON.stringify(
  //                 deviceModelDefaultUnit,
  //               )}`,
  //             ); */
  //           }
  //           this.logger.debug(
  //             `No of default attributes : ${deviceModelMapWithUnits.size}`,
  //           );
  //           const deviceModelAttributes = deviceModel.deviceModelAttributes;
  //           if (deviceModelAttributes && deviceModelAttributes.length > 0) {
  //             for (const deviceModelAttribute of deviceModelAttributes) {
  //               if (deviceModelAttribute.unitId) {
  //                 const deviceModelIdAttributeKey =
  //                   deviceModel.id +
  //                   KEY_SEPARATOR +
  //                   deviceModelAttribute.metricsAttributeId;
  //                 const deviceModelOverrideUnit: DeviceModelAttributeDto = {
  //                   deviceModelId: deviceModel.id,
  //                   metricsAttribute: deviceModelAttribute.metricsAttribute,
  //                   unitId: deviceModelAttribute.unitId,
  //                 };
  //                 deviceModelMapWithUnits.set(
  //                   deviceModelIdAttributeKey,
  //                   deviceModelOverrideUnit,
  //                 );
  //               } else {
  //                 this.logger.debug(
  //                   `Unit not available for ${deviceModelAttribute}`,
  //                 );
  //               }
  //             }
  //           }
  //         }
  //       }
  //       this.logger.debug(
  //         `No of Device Model Units : ${deviceModelMapWithUnits.size}`,
  //       );
  //       return Array.from(deviceModelMapWithUnits.values());
  //     } catch (error) {
  //       const errMsg = `${fnIdentifier} : Error : ${error}`;
  //       this.logger.error(errMsg);
  //       throw new Error(errMsg);
  //     } finally {
  //       this.logger.info(` ${fnIdentifier} : End  `);
  //     }
  //   }

  //   async updateDeviceState(deviceStateBOs: DeviceStateDto[]) {
  //     const fnIdentifier = `updateDeviceState()`;
  //     const finalUpdatedResult = [];
  //     try {
  //       this.logger.info(
  //         `${fnIdentifier} : Start : deviceStates: ${deviceStateBOs.length}`,
  //       );
  //       for (const deviceStateBO of deviceStateBOs) {
  //         this.logger.debug(
  //           `Updating device state of ${deviceStateBO.deviceId}, ${deviceStateBO.assetId}, ${deviceStateBO.stateCode}`,
  //         );
  //         const devices = await this.deviceService.findbyDeviceIdandStateCode(
  //           deviceStateBO.deviceId,
  //           deviceStateBO.stateCode,
  //         );
  //         if (devices.length > 0) {
  //           try {
  //             if (
  //               devices[0].deviceModel.deviceModelStates != null &&
  //               devices[0].deviceModel.deviceModelStates.length > 0
  //             ) {
  //               this.logger.debug(
  //                 `${fnIdentifier} : Device model states ${devices[0].deviceModel.deviceModelStates.length} found for device model ${devices[0].deviceModelId}`,
  //               );
  //               devices[0].deviceModelStateId =
  //                 devices[0].deviceModel.deviceModelStates[0].id;
  //               devices[0].deviceModelStateTime = deviceStateBO.deviceStateTime;
  //               this.logger.debug(
  //                 `Device model id : ${devices[0].deviceModelId}`,
  //               );
  //               try {
  //                 const updatedDevice = await this.deviceService.update(
  //                   devices[0].id,
  //                   devices[0],
  //                 );
  //                 finalUpdatedResult.push(updatedDevice);
  //               } catch (error) {
  //                 const errMsg = `${fnIdentifier} : Error 1 : ${error} : Device id : ${
  //                   devices[0].id
  //                 } : Device state : ${JSON.stringify(deviceStateBO)}`;
  //                 this.logger.error(errMsg);
  //               }
  //               this.logger.info(
  //                 ` No of final updating devices: ${finalUpdatedResult.length} `,
  //               );
  //             } else {
  //               this.logger.warn(
  //                 `Device model states for device model ${devices[0].deviceModelId} are not defined. Skipping device update for ${devices[0].id}`,
  //               );
  //             }
  //           } catch (error) {
  //             const errMsg = `${fnIdentifier} : Device id : ${devices[0].id}, Device model : ${devices[0].deviceModelId} Error 2 : ${error}`;
  //             this.logger.error(errMsg);
  //           }
  //         } else {
  //           this.logger.warn(
  //             `No device states found for device id ${deviceStateBO.deviceId} and state code ${deviceStateBO.stateCode}`,
  //           );
  //         }
  //       }
  //       return finalUpdatedResult;
  //     } catch (error) {
  //       const errMsg = `${fnIdentifier} device state BO : ${JSON.stringify([
  //         ...deviceStateBOs,
  //       ])}: Error 3 : ${error}`;
  //       this.logger.error(`${errMsg}`);
  //       throw new Error(errMsg);
  //     } finally {
  //       this.logger.info(`${fnIdentifier} : End.`);
  //     }
  //   }

  //   async getAssetPerformanceTelemetryForAllMetricsAttributes1(
  //     searchCriteria: FindAssetPerformanceTelemetry,
  //   ): Promise<TelemetryPayloadDto[]> {
  //     const fnName =
  //       this.getAssetPerformanceTelemetryForAllMetricsAttributes1.name;
  //     const input = `Input: SearchCriteria 1 : ${JSON.stringify(searchCriteria)}`;
  //     this.logger.debug(fnName + KEY_SEPARATOR + input);

  //     // Find AssetCurrentPErformanceSources
  //     const aCPSs = await this.assetCurrentPerformanceSourceService.findByAssetId(
  //       searchCriteria.assetId,
  //     );

  //     throwErrIfNoData(
  //       aCPSs,
  //       `AssetCurrPerfSource not found for asset id ${searchCriteria.assetId}`,
  //     );

  //     this.logger.debug(
  //       fnName +
  //         `No of asset current performance sources for ${searchCriteria.assetId} : ${aCPSs.length}`,
  //     );

  //     const startTimeInt = convertpossibleStringTypeToInt(
  //       searchCriteria.startTime,
  //     );

  //     const endTimeInt = convertpossibleStringTypeToInt(searchCriteria.endTime);

  //     const findTelemetryPayloadDtos:
  //       | FindTelemetryPayloadDto[]
  //       | FindTodayTelemetryPayloadDto[] = [];
  //     const labelByACPSKey = new Map<string, string>();

  //     for (const aCPS of aCPSs) {
  //       const aCPSObj = new AssetCurrentPerformanceSource(aCPS);

  //       labelByACPSKey.set(
  //         aCPSObj.getKey(),
  //         aCPS.assetTypeCurrentPerformanceSource.label,
  //       );

  //       findTelemetryPayloadDtos.push({
  //         assetId: aCPSObj.assetId,
  //         virtualDeviceId: aCPSObj.virtualDeviceId,
  //         metricsAttributeId: aCPSObj.metricsAttributeId,
  //       });
  //     }

  //     const todayDate = new Date();
  //     todayDate.setHours(0, 0, 0, 0);
  //     const givenDate = new Date(startTimeInt);
  //     givenDate.setHours(0, 0, 0, 0);
  //     let telemetryPayloads = [];
  //     if (todayDate.getTime() === givenDate.getTime()) {
  //       this.logger.debug(`${fnName} : Fetching from TodayTelemetryPayloads`);
  //       telemetryPayloads =
  //         await this.todayTelemetryPayloadService.findManyMetricsAttribsForATimePeriod(
  //           findTelemetryPayloadDtos,
  //           startTimeInt,
  //           endTimeInt,
  //         );
  //     } else {
  //       this.logger.debug(`${fnName} : Fetching from TelemetryPayloads`);
  //       telemetryPayloads =
  //         await this.telemetryPayloadService.findManyMetricsAttribsForATimePeriod(
  //           findTelemetryPayloadDtos,
  //           startTimeInt,
  //           endTimeInt,
  //         );
  //     }
  //     this.logger.debug(
  //       `${fnName} : Fetched number of telemetryPayloads are : ${telemetryPayloads.length}`,
  //     );

  //     const telemetryPayloadDtos: TelemetryPayloadDto[] = [];
  //     const groupedPayloads = _.groupBy(telemetryPayloads, (payload) => {
  //       const payloadObj = new TelemetryPayload(payload);
  //       return payloadObj.getAttributeKey();
  //     });
  //     for (const [key, payloads] of Object.entries(groupedPayloads)) {
  //       if (payloads.length > 0) {
  //         let lastAcceptedTime = 0;
  //         const metrics: Partial<MetricDto>[] = [];
  //         for (const payload of payloads) {
  //           const payloadTimeInEpoch = new Date(
  //             payload.metric.txnCaptureTime,
  //           ).valueOf();
  //           if (payloadTimeInEpoch - lastAcceptedTime > milliSecondsInOneHour) {
  //             metrics.push(getMetricDTO(payload.metric));
  //             lastAcceptedTime = payloadTimeInEpoch;
  //           }
  //         }
  //         const telemetryDevice = TelemetryDevice.createFromTelemetry(
  //           payloads[0],
  //         );
  //         telemetryPayloadDtos.push(
  //           new TelemetryPayloadDto(telemetryDevice, metrics, {
  //             metricsAttributeId: payloads[0].metric.metricsAttributeId,
  //             frequency: payloads[0].metric.frequency,
  //             displayName:
  //               labelByACPSKey.get(key) ?? payloads[0].metric.metricsAttributeId,
  //             unit: payloads[0].metric.unit,
  //           }),
  //         );
  //       }
  //     }
  //     return telemetryPayloadDtos;
  //   }

  //   /* async findMainAttribsByAssetIDs(csvAssetIDs: string) {
  //     const event = `Input : CSV Asset IDs : ${csvAssetIDs}`;
  //     const msgTemplate = `${this.serviceName}.findMainAttribsByAssetIDs() : ${event}`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : Start`);

  //       const mainAssetAttribsURL = new URL(
  //         MAIN_ATTRIBS_FOR_ASSETS,
  //         this.baseURL,
  //       );
  //       mainAssetAttribsURL.searchParams.append('csvAssetIDs', csvAssetIDs);
  //       this.logger.debug(
  //         `${msgTemplate} : Main attributes from Assets URL : ${mainAssetAttribsURL.href}`,
  //       );
  //       const mainAssetAttribsResp = await firstValueFrom(
  //         this.httpService.get<AssetCurrentPerformanceSource[]>(
  //           mainAssetAttribsURL.href,
  //         ),
  //       );

  //       throwErrIfSrvcRespFailure(mainAssetAttribsResp);

  //       const mainAttribs = mainAssetAttribsResp.data.map((assetCurrPerf) => {
  //         assetCurrPerf.assetId,
  //           assetCurrPerf.isDeviceGroup,
  //           assetCurrPerf.virtualDeviceId,
  //           assetCurrPerf.attribute;
  //       });

  //       return mainAttribs;
  //     } catch (error) {
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : End`);
  //     }
  //   } */

  //   /* async getMetricsAttributes2(assetID: string, deviceTypeID?: string) {
  //     const event = `Input : Asset ID : ${assetID}, DeviceType ID : ${deviceTypeID}`;
  //     const msgTemplate = `Find Metrics Attributes : ${this.serviceName} : ${event}`;
  //     try {
  //       this.logger.debug(`${msgTemplate} : Start`);

  //       const assetURL = new URL(ASSET_WITH_DEVICES_URL, this.baseURL);
  //       assetURL.searchParams.append('assetID', assetID);
  //       this.logger.debug(`${msgTemplate} : Asset URL : ${assetURL}`);
  //       const assetResp = await firstValueFrom(
  //         this.httpService.get<Asset>(assetURL.href),
  //       );
  //       throwErrIfSrvcRespFailure(assetResp);
  //       throwErrIfNoRespData(assetResp, `Asset ID ${assetID} is not available`);

  //       const devices = assetResp.data.devices;
  //       const uniqDeviceModels = _.uniqBy(devices, 'deviceModelId');
  //       const csvUniqDeviceModelIDs = uniqDeviceModels
  //         .map((device) => device.deviceModelId)
  //         .join(',');

  //       this.logger.debug(`CSV Unique Device Model IDs : ${csvUniqDeviceModelIDs}`);

  //       const deviceModelURL = new URL(DEVICE_MODEL_BY_CSVIDS_URL, this.baseURL);
  //       deviceModelURL.searchParams.append('csvIDs', csvUniqDeviceModelIDs);
  //       deviceTypeID
  //         ? deviceModelURL.searchParams.append('csvDeviceTypeIDs', deviceTypeID)
  //         : null;
  //       this.logger.debug(`${msgTemplate} : Device Model URL : ${deviceModelURL}`);
  //       const deviceModelResp = await firstValueFrom(
  //         this.httpService.get<DeviceModel[]>(deviceModelURL.href),
  //       );
  //       throwErrIfSrvcRespFailure(deviceModelResp);
  //       throwErrIfNoRespData(
  //         deviceModelResp,
  //         `Device Model IDs ${csvUniqDeviceModelIDs} are not available`,
  //       );

  //       const reqdDeviceModelIDs = new Set<String>(
  //         deviceModelResp.data.map((deviceModel) => deviceModel.id),
  //       );

  //       const filteredDevices = devices.filter((device) =>
  //         reqdDeviceModelIDs.has(device.deviceModelId),
  //       );

  //       const csvVirtualDeviceIDs = filteredDevices
  //         .map((device) => device.virtualId)
  //         .join(',');

  //       this.logger.debug(
  //         `${msgTemplate} : CSV Virtual Device IDs : ${csvUniqDeviceModelIDs}`,
  //       );

  //       const currTelemetryPyldURL = new URL(
  //         CURR_TELEMETRY_PAYLOAD_FOR_MULTIPLE_ASSETS_URL,
  //         this.baseURL,
  //       );

  //       currTelemetryPyldURL.searchParams.append('csvAssetIDs', assetID);
  //       currTelemetryPyldURL.searchParams.append(
  //         'csvVirtualDeviceIDs',
  //         csvVirtualDeviceIDs,
  //       );

  //       this.logger.debug(
  //         `${msgTemplate} : Curr Telemetry Payload URL : ${currTelemetryPyldURL}`,
  //       );

  //       const currTelemetryPyldResp = await firstValueFrom(
  //         this.httpService.get<CurrentTelemetryPayload[]>(
  //           currTelemetryPyldURL.href,
  //         ),
  //       );

  //       throwErrIfSrvcRespFailure(currTelemetryPyldResp);

  //       return currTelemetryPyldResp.data;
  //     } catch (error) {
  //       const errMsg = getTryCatchErrorStr(error);
  //       this.logger.error(`${msgTemplate} : ${errMsg}`);
  //       throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //     } finally {
  //       this.logger.debug(`${msgTemplate} : End`);
  //     }
  //   } */
  //   // Observable based. UI should also be observable based.
  //   /* getAssetCurrentPerformanceTelemetry2(assetId: string) {
  //     let msgTemplate = this.serviceName + ' getAssetCurrentPerformanceTelemetry() assetId : ' + assetId;
  //     this.logger.debug(msgTemplate);

  //     return new Observable((obs) => {
  //       try {
  //         this.assetCurrPerSrcsURL.searchParams.append("assetId", assetId);
  //         this.logger.debug(`${msgTemplate} : ${this.assetCurrPerSrcsURL.toString()}`);
  //         this.httpService.get<AssetCurrentPerformanceSource[]>(this.assetCurrPerSrcsURL.toString())
  //           .pipe(
  //             catchError((error: AxiosError) => {
  //               this.logger.debug(`${msgTemplate} : Asset Curr Perf Srcs : ${error.code} : ${error.message}`)
  //               throw error.message;
  //             }),
  //             first())
  //             .subscribe({
  //               next: (assetCurrPerfSrcs) => {
  //                 this.logger.debug(`${msgTemplate} : Asset Curr Perf Srcs : ${assetCurrPerfSrcs.data.length}`);
  //                 const currTelemetryPayloadURL = new URL('current-telemetry-payload', this.baseURL);
  //                 currTelemetryPayloadURL.searchParams.append('assetId', assetId);
  //                 this.httpService.get<CurrentTelemetryPayload[]>(currTelemetryPayloadURL.toString())
  //                   .pipe(
  //                     catchError((error: AxiosError) => {
  //                       this.logger.debug(`${msgTemplate} : Curr TelemetryPayloads : ${error.code} : ${error.message}`)
  //                       throw error.message;
  //                   }),
  //                   first())
  //                   .subscribe({
  //                     next: (currTelemetries) => {
  //                       this.logger.debug(`${msgTemplate} : Current Telemetries : ${currTelemetries.data.length}`);
  //                       let currentTelemetriesMap = new Map<String, CurrentTelemetryPayload>();
  //                       for ( const currentTelemetry of currTelemetries.data) {
  //                         const rcvdCurrTelemetryPayload = new CurrentTelemetryPayload(currentTelemetry);
  //                         currentTelemetriesMap.set(rcvdCurrTelemetryPayload.getKey(), rcvdCurrTelemetryPayload);
  //                       }
  //                       for ( const assetCurrPerfSrc of assetCurrPerfSrcs.data) {
  //                         const rcvdAssetCurrPerfSrc = new AssetCurrentPerformanceSource(assetCurrPerfSrc);
  //                         if (currentTelemetriesMap.has(rcvdAssetCurrPerfSrc.getKey())) {
  //                           assetCurrPerfSrc.currentTelemetryPayload = currentTelemetriesMap.get(rcvdAssetCurrPerfSrc.getKey())!;// as CurrentTelemetryPayload;
  //                         }
  //                       }
  //                       this.logger.debug(`${msgTemplate} : publishing results`);
  //                       obs.next(assetCurrPerfSrcs.data);
  //                     }
  //                   });
  //               }
  //             });
  //       } catch (error) {
  //         const srvcErr = `${msgTemplate} : In try-catch : ${error}`;
  //         this.logger.error(srvcErr);
  //         obs.error(srvcErr);
  //         //throw new HttpException(srvcErr, HttpStatus.INTERNAL_SERVER_ERROR);
  //       }
  //     })
  //   } */
  //   getAttribute(currTelemetryPayload: CurrentTelemetryPayload) {
  //     return currTelemetryPayload.metric.metricsAttributeId;
  //   }
}




