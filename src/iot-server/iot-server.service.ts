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
import { convertInputToDate, endOfDate, getMetricDTO, getTelemetryPayloadKey, getTokenString, getTPLV3DTO, getTryCatchErrorStr, startOfDate, throwErrIfNoData } from 'src/utils/others';
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
import { AssetCurrentPerformanceSourceService } from 'src/asset-current-performance-source/asset-current-performance-source.service';
import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';
// import { FindCurrentTelemetryDto } from 'src/current-telemetry-payload/dto/find-current-telemetry-payload.dto';
import { FindMetricDto } from 'src/metrics/dto/find-metric.dto';
import { DeviceTypeMetricsAttribute } from 'src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { DeviceTypeMetricsAttributeService } from 'src/device-type-metrics-attribute/device-type-metrics-attribute.service';
import { TelemetryPayloadsRepo } from 'src/telemetry-payload/entities/telemetry-payload_repo.entity';
import { CurrentTelemetryPayloadsRepo } from 'src/current-telemetry-payload/entities/current-telemetry-payloads.entity';
import { TelemetryPayloadDto } from './dto/telemetry-payload-dto.dto';
import { FindAssetPerformanceTelemetry } from './dto/find-asset-performance-telemetry';
import { Metric } from 'src/metrics/entities/metric.entity';
import { TelemetryDisplayProperty } from './dto/telemetry-display-property.dto.';
import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
import { FindDeviceTypeMetricsAttributeByMultipleIDsDto } from 'src/device-type-metrics-attribute/dto/find-device-type-metrics-attribute-byMultipleIDs.dto';
import { FindCurrentTelemetryPayloadsByMultipleIDs } from 'src/current-telemetry-payload/dto/find-current-telemetry-payloads-byMultipleIDs.dto';
import { brotliCompress } from 'zlib';
import { FindDevicesPerformanceTelemetryDto } from './dto/find-devices-performance-telemetry.dto';
import { TelemetryPayloadV3DTO } from './dto/telemetry-payload-v3.dto';
import { FindCurrentTelemetryDto } from 'src/current-telemetry-payload/dto/find-current-telemetry.dto';
import { FindTelemetryPayloadDto } from 'src/telemetry-payload/dto/find-telemetry-payload.dto';
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
    private readonly assetCurrentPerformanceSourceService: AssetCurrentPerformanceSourceService,
    private readonly deviceTypeMetricsAttributeService: DeviceTypeMetricsAttributeService,
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
      this.logger.debug(`${msgTemplate} : ${event} : Start`);
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










  async getDatedAssetCurrentPerformanceTelemetry(
    assetId: string,
    inputDateInEpoch: number,
  ) {
    const inputDate = convertInputToDate(inputDateInEpoch);
    const fnName = this.getDatedAssetCurrentPerformanceTelemetry.name;
    this.logger.debug(
      `${fnName} : Input assetId : ${assetId}, Input date in Epoch : ${inputDateInEpoch}, Input date : ${inputDate} : Start`,
    );

    const aCPSs =
      await this.assetCurrentPerformanceSourceService.findByMultipleIDs({
        csvAssetIDs: assetId,
      });
    this.logger.debug(
      `${fnName} : No of Asset Current Performance Sources : ${aCPSs.length}`,
    );
    throwErrIfNoData<AssetCurrentPerformanceSource>(
      aCPSs,
      `No asset current performance sources for Asset ${assetId}`,
    );

    const assetCurrPerfSrcByKey = new Map<
      string,
      AssetCurrentPerformanceSource
    >();
    const findCTPLDTOs: FindCurrentTelemetryDto[] = [];
    // const partialACPSs: Partial<AssetCurrentPerformanceSource>[] = [];
    const deviceTypeIDSet = new Set<string>();

    for (const assetCurrPerfSrc of aCPSs) {
      const aCPSObj = new AssetCurrentPerformanceSource(assetCurrPerfSrc);
      if (aCPSObj.virtualDevice?.deviceTypeId) {
        deviceTypeIDSet.add(aCPSObj.virtualDevice.deviceTypeId);
      }
      const findMetricDTO: FindMetricDto = {
        metricsAttributeId: aCPSObj.metricsAttributeId,
      };
      findCTPLDTOs.push({
        assetId: aCPSObj.assetId,
        virtualDeviceId: aCPSObj.virtualDeviceId ?? IsNull(),
        metric: findMetricDTO,
      });
      // partialACPSs.push({
      //   assetId: aCPSObj.assetId,
      //   virtualDeviceId: aCPSObj.virtualDeviceId,
      //   metricsAttributeId: aCPSObj.metricsAttributeId,
      // });
      // assetCurrPerfSrcByKey.set(aCPSObj.getKey(), aCPSObj);
    }
    this.logger.debug(
      `${fnName} : No of Device type ID set : ${deviceTypeIDSet.size}`,
    );
    /* dTMAs are required to get the displayOrder */
    // let dTMAs: DeviceTypeMetricsAttribute[] = [];
    let dTMAsByKey: { [key: string]: DeviceTypeMetricsAttribute[] } = {};
    if (deviceTypeIDSet.size > 0) {
      dTMAsByKey = await this.deviceTypeMetricsAttributeService.dTMAsByByKey(
        {
          csvDeviceTypeIDs: [...deviceTypeIDSet].join(','),
        },
        false,
        true,
      );
    }

    const cTPLsByTime =
      await this.currentTelemetryPayloadService.findByMultipleConditionsGroupByTime(
        findCTPLDTOs,
      );
    /* TODO - Here, we are checking only the first date in cTPLsByTime to decide whether to fetch telemetry from telemetry payloads or not. We need to check for all the dates in cTPLsByTime and find the max date and compare it with input date. If max date is greater than input date, then fetch telemetry from telemetry payloads, else return cTPLsByTime */
    const cTPLOnlyDate = startOfDate(
      new Date(parseInt(Object.keys(cTPLsByTime)[0])),
    );
    const startOfDateInput = startOfDate(inputDate);
    this.logger.debug(
      `${fnName} : Input date only : ${startOfDateInput} , Retrieved date only : ${cTPLOnlyDate}`,
    );
    if (cTPLOnlyDate > startOfDateInput) {
      this.logger.debug(
        `${fnName} : Retrieved date is greater than input date : ${cTPLOnlyDate} > ${startOfDateInput}`,
      );
      this.logger.debug(
        `${fnName} : Finding telemetry from Telemetry payloads`,
      );
      const tPLs =
        await this.telemetryPayloadService.findLatestTPLForATimePeriod(
          // partialACPSs,
          findCTPLDTOs,
          startOfDateInput.valueOf(),
          endOfDate(inputDate).valueOf(),
        );
      // return new TelemetryPayloadsRepo(tPLs).getCTPLDTOV3(
      //   assetCurrPerfSrcByKey,
      //   dTMAsByKey,
      // );
      return new TelemetryPayloadsRepo(tPLs).getCTPLDTOV3({
        aCPSByKey: assetCurrPerfSrcByKey,
        dTMAsByKey,
      });
    }
    else {
      this.logger.debug(
        `${fnName} : Input date is greater than or equal to retrieved date : ${startOfDateInput} => ${cTPLOnlyDate}`,
      );
      // return new CurrentTelemetryPayloadsRepo(
      //   Object.values(cTPLsByTime).flat(),
      // ).getCTPLDTOV3(assetCurrPerfSrcByKey, dTMAsByKey);

      return new CurrentTelemetryPayloadsRepo(
        Object.values(cTPLsByTime).flat(),
      ).getCTPLDTOV3({
        aCPSByKey: assetCurrPerfSrcByKey,
        dTMAsByKey,
      });
    }
  }



  private e = "this is working";
  // async getDatedDeviceCurrentTelemetrySirApproved(
  //   assetID: string,
  //   virtualDeviceID: string,
  //   deviceTypeID: string,
  //   inputDateInEpoch: number,
  // ) {
  //   const fnName = this.getDatedDeviceCurrentTelemetry.name;

  //   const inputDate = convertInputToDate(inputDateInEpoch);

  //   this.logger.debug(
  //     `${fnName} : Asset : ${assetID}, VirtualDevice : ${virtualDeviceID}, DeviceType : ${deviceTypeID}, Date : ${inputDate}`,
  //   );

  //   const dTMAs =
  //     await this.getDeviceTypeMetricsAttributeByMultipleIDs(
  //       {
  //         csvDeviceTypeIDs: deviceTypeID,
  //       },
  //       true,
  //     );

  //   if (_.isEmpty(dTMAs)) {
  //     this.logger.debug(`${fnName} : No DeviceTypeMetricsAttributes found`);
  //     return [];
  //   }

  //   const assetCurrPerfSrcByKey = new Map<
  //     string,
  //     AssetCurrentPerformanceSource
  //   >();

  //   const findCTPLDTOs: FindCurrentTelemetryDto[] = [];
  //   const partialACPSs: Partial<AssetCurrentPerformanceSource>[] = [];
  //   const deviceTypeIDSet = new Set<string>();

  //   for (const dTMA of dTMAs) {
  //     deviceTypeIDSet.add(deviceTypeID);

  //     // const acps = new AssetCurrentPerformanceSource({
  //     //   assetId: assetID,
  //     //   virtualDeviceId: virtualDeviceID,
  //     //   metricsAttributeId: dTMA.metricsAttributeId,
  //     // });

  //     // assetCurrPerfSrcByKey.set(acps.getKey(), acps);

  //     const key = assetID + KEY_SEPARATOR + virtualDeviceID + KEY_SEPARATOR + dTMA.metricsAttributeId;

  //     assetCurrPerfSrcByKey.set(
  //       key,
  //       {
  //         assetId: assetID,
  //         virtualDeviceId: virtualDeviceID,
  //         metricsAttributeId: dTMA.metricsAttributeId,
  //       } as AssetCurrentPerformanceSource,
  //     );

  //     findCTPLDTOs.push({
  //       assetId: assetID,
  //       virtualDeviceId: virtualDeviceID,
  //       metric: {
  //         metricsAttributeId: dTMA.metricsAttributeId,
  //       },
  //     });

  //     partialACPSs.push({
  //       assetId: assetID,
  //       virtualDeviceId: virtualDeviceID,
  //       metricsAttributeId: dTMA.metricsAttributeId,
  //     });
  //   }

  //   let dTMAsByKey: { [key: string]: DeviceTypeMetricsAttribute[] } = {};

  //   if (deviceTypeIDSet.size > 0) {
  //     dTMAsByKey =
  //       await this.deviceTypeMetricsAttributeService.dTMAsByByKey(
  //         {
  //           csvDeviceTypeIDs: [...deviceTypeIDSet].join(','),
  //         },
  //         false,
  //         true,
  //       );
  //   }

  //   const cTPLsByTime =
  //     await this.currentTelemetryPayloadService.findByMultipleConditionsGroupByTime(
  //       findCTPLDTOs,
  //     );

  //   if (_.isEmpty(cTPLsByTime)) {
  //     return [];
  //   }

  //   const cTPLOnlyDate = startOfDate(
  //     new Date(Number(Object.keys(cTPLsByTime)[0])),
  //   );

  //   const startOfDateInput = startOfDate(inputDate);

  //   this.logger.debug(
  //     `${fnName} : Input date : ${startOfDateInput}, Retrieved date : ${cTPLOnlyDate}`,
  //   );

  //   if (cTPLOnlyDate > startOfDateInput) {
  //     this.logger.debug(
  //       `${fnName} : Loading historical TelemetryPayload`,
  //     );

  //     const tPLs =
  //       await this.telemetryPayloadService.findLatestTPLForATimePeriod(
  //         partialACPSs,
  //         startOfDateInput.valueOf(),
  //         endOfDate(inputDate).valueOf(),
  //       );

  //     return new TelemetryPayloadsRepo(tPLs).getCTPLDTOV3(
  //       assetCurrPerfSrcByKey,
  //       dTMAsByKey,
  //     );
  //   }
  //   else {
  //     this.logger.debug(
  //       `${fnName} : Loading CurrentTelemetryPayload`,
  //     );

  //     return new CurrentTelemetryPayloadsRepo(
  //       Object.values(cTPLsByTime).flat(),
  //     ).getCTPLDTOV3(assetCurrPerfSrcByKey, dTMAsByKey);
  //   }
  // }


  async getDatedDeviceCurrentTelemetry(
    assetID: string,
    virtualDeviceID: string,
    deviceTypeID: string,
    inputDateInEpoch: number,
  ) {
    const fnName = this.getDatedDeviceCurrentTelemetry.name;

    const inputDate = convertInputToDate(inputDateInEpoch);

    this.logger.debug(
      `${fnName} : Asset : ${assetID}, VirtualDevice : ${virtualDeviceID}, DeviceType : ${deviceTypeID}, Date : ${inputDate}`,
    );

    const dTMAs =
      await this.getDeviceTypeMetricsAttributeByMultipleIDs(
        {
          csvDeviceTypeIDs: deviceTypeID,
        },
        true,
      );

    if (_.isEmpty(dTMAs)) {
      this.logger.debug(`${fnName} : No DeviceTypeMetricsAttributes found`);
      return [];
    }

    const findCTPLDTOs: FindCurrentTelemetryDto[] = dTMAs.map(dTMA => ({
      assetId: assetID,
      virtualDeviceId: virtualDeviceID,
      metric: {
        metricsAttributeId: dTMA.metricsAttributeId,
      },
    }));

    const dTMAsByKey = _.groupBy(
      dTMAs,
      dTMA => new DeviceTypeMetricsAttribute(dTMA).getKey(),
    );

    const cTPLsByTime =
      await this.currentTelemetryPayloadService.findByMultipleConditionsGroupByTime(
        findCTPLDTOs,
      );

    if (_.isEmpty(cTPLsByTime)) {
      return [];
    }

    const cTPLOnlyDate = startOfDate(
      new Date(Number(Object.keys(cTPLsByTime)[0])),
    );

    const startOfDateInput = startOfDate(inputDate);

    this.logger.debug(
      `${fnName} : Input date : ${startOfDateInput}, Retrieved date : ${cTPLOnlyDate}`,
    );

    if (cTPLOnlyDate > startOfDateInput) {
      this.logger.debug(
        `${fnName} : Loading historical TelemetryPayload`,
      );

      const tPLs =
        await this.telemetryPayloadService.findLatestTPLForATimePeriod(
          findCTPLDTOs,
          startOfDateInput.valueOf(),
          endOfDate(inputDate).valueOf(),
        );

      return new TelemetryPayloadsRepo(tPLs).getCTPLDTOV3({
        dTMAsByKey,
      });
    }
    else {
      this.logger.debug(
        `${fnName} : Loading CurrentTelemetryPayload`,
      );

      return new CurrentTelemetryPayloadsRepo(
        Object.values(cTPLsByTime).flat(),
      ).getCTPLDTOV3({
        dTMAsByKey,
      });
    }
  }

  private async getDeviceTypeMetricsAttributeByMultipleIDs(
    searchCriteria: FindDeviceTypeMetricsAttributeByMultipleIDsDto,
    forDisplay: boolean = false,
    //msgTemplate: string,
  ) {
    const event = `Inputs : ${JSON.stringify(searchCriteria)}`;
    const fnIdentifier =
      'getDeviceTypeMetricsAttributeByMultipleIDs()' + ' ' + event;
    try {
      this.logger.debug(`${fnIdentifier} : Start`);
      const relationsRequired = true;

      return await this.deviceTypeMetricsAttributeService.findByMultipleIDs(
        searchCriteria,
        relationsRequired,
        forDisplay,
      );
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      throw new Error(errMsg);
    } finally {
      this.logger.debug(`${fnIdentifier} : End`);
    }
  }




  private t = 'sir'
  // async getDevicesPerformanceTelemetry(
  //   searchCriteria: FindDevicesPerformanceTelemetryDto,
  // ) {
  //   const event = `Input : Search Criteria : ${JSON.stringify(searchCriteria)}`;
  //   const msgTemplate = `${this.serviceName}.getPerformanceTelemetry() : ${event}`;
  //   try {
  //     this.logger.debug(`${msgTemplate} : Start`);

  //     let telemetryPayloads = [];
  //     telemetryPayloads =
  //       await this.telemetryPayloadService.findForMultipleDevicesForATimePeriod(
  //         searchCriteria,
  //       );
  //     const telemetryPayloadDTOs: Array<TelemetryPayloadDto> = [];
  //     if (telemetryPayloads.length > 0) {
  //       const groupTelemetryPayloadsByVD = _.groupBy(
  //         telemetryPayloads,
  //         this.telemetryPayloadGroupByVirtualDeviceID,
  //       );

  //       for (const [, telemetryPayloads] of Object.entries(
  //         groupTelemetryPayloadsByVD,
  //       )) {
  //         const telemetryDevice = TelemetryDevice.createFromTelemetry(
  //           telemetryPayloads[0],
  //         );
  //         const telemetryDisplayProperty: TelemetryDisplayProperty = {
  //           displayName: telemetryPayloads[0].metric.metricsAttributeId,
  //           metricsAttributeId: telemetryPayloads[0].metric.metricsAttributeId,
  //           frequency: telemetryPayloads[0].metric.frequency,
  //           unit: telemetryPayloads[0].metric.unit,
  //           displayOrder: 10000,
  //         };
  //         const metricDTOs: Array<Partial<Metric>> = [];
  //         const metrics = telemetryPayloads.map((telemetryPayload) =>
  //           //metricDTOs.push(new MetricDto(telemetryPayload.metric)),
  //           metricDTOs.push(getMetricDTO(telemetryPayload.metric)),
  //         );
  //         telemetryPayloadDTOs.push(
  //           new TelemetryPayloadDto(
  //             telemetryDevice,
  //             metricDTOs,
  //             telemetryDisplayProperty,
  //           ),
  //         );
  //       }
  //     } else {
  //       this.logger.debug(`No telemetry payload records`);
  //     }
  //     //return findTelemetryPayload;
  //     return telemetryPayloadDTOs;
  //   } catch (error) {
  //     const errMsg = getTryCatchErrorStr(error);
  //     this.logger.error(`${msgTemplate} : ${errMsg}`);
  //     throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
  //   } finally {
  //     this.logger.debug(`${msgTemplate} : End`);
  //   }
  // }


  async getDevicesPerformanceTelemetry(
    searchCriteria: FindDevicesPerformanceTelemetryDto,
  ) {
    const fnName = this.getDevicesPerformanceTelemetry.name;
    const event = `Input : Search Criteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(`${fnName} : ${event}`);

    try {
      console.log("in iot")
      const telemetryPayloads =
        await this.telemetryPayloadService.findForMultipleDevicesForATimePeriod(
          searchCriteria,
        );

      if (_.isEmpty(telemetryPayloads)) {
        this.logger.debug(`${fnName} : No telemetry payload records found`);
        return [];
      }
      return new TelemetryPayloadsRepo(telemetryPayloads).getCTPLDTOV3({});
    } catch (error) {
      const errMsg = getTryCatchErrorStr(error);
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      this.logger.debug(`${fnName} : End`);
    }
  }


  telemetryPayloadGroupByVirtualDeviceID(telemetryPayload: TelemetryPayload) {
    return telemetryPayload.virtualDeviceId;
  }

  private f = 'my'
  // async getDatedDevicesPerformanceTelemetry(
  //   searchCriteria: FindDevicesPerformanceTelemetryDto,
  //   inputDateInEpoch: number,
  // ): Promise<TelemetryPayloadV3DTO[]> {
  //   const fnName = this.getDatedDevicesPerformanceTelemetry.name;

  //   const inputDate = convertInputToDate(inputDateInEpoch);

  //   this.logger.debug(
  //     `${fnName} : SearchCriteria : ${JSON.stringify(searchCriteria)}, Date : ${inputDate}`,
  //   );

  //   // Parse CSVs
  //   const assetIDs = searchCriteria.csvAssetIDs?.split(',') ?? [];
  //   const virtualDeviceIDs = searchCriteria.csvVirtualDeviceIDs.split(',');

  //   // Get latest telemetry for all requested devices/metrics
  //   // Build assetCurrPerfSrcByKey, partialACPSs, findCTPLDTOs
  //   // (same logic as getDatedDeviceCurrentTelemetry, but loop over all devices)

  //   // Get DTMAs
  //   // Build dTMAsByKey

  //   // Get CurrentTelemetryPayloads grouped by time
  //   // Compare requested date with CTPL date

  //   if (/* requested date is historical */) {
  //     const tPLs =
  //       await this.telemetryPayloadService.findLatestTPLForATimePeriod(
  //         partialACPSs,
  //         startOfDate(inputDate).valueOf(),
  //         endOfDate(inputDate).valueOf(),
  //       );

  //     return new TelemetryPayloadsRepo(tPLs).getCTPLDTOV3(
  //       assetCurrPerfSrcByKey,
  //       dTMAsByKey,
  //     );
  //   }

  //   return new CurrentTelemetryPayloadsRepo(
  //     Object.values(cTPLsByTime).flat(),
  //   ).getCTPLDTOV3(assetCurrPerfSrcByKey, dTMAsByKey);
  // }



  async getAssetPerformanceTelemetry(
    searchCriteria: FindAssetPerformanceTelemetry,
  ) {
    const msgTemplate = this.serviceName + `.getAssetPerformanceTelemetry()`;
    //try {
    this.logger.debug(`${msgTemplate} : Start`);

    const findTelemetryPayload =
      FindTelemetryPayloadForAPeriod.createFromFindAssetPerformanceTelemetry(
        searchCriteria,
      );
    let telemetryPayloads = [];
    telemetryPayloads =
      await this.telemetryPayloadService.findForATimePeriodInAsc(
        findTelemetryPayload,
      );
    this.logger.debug(
      `${msgTemplate} : No of rcvdTelemetryPayloads : ${telemetryPayloads.length}`,
    );

    let metrics: Partial<Metric>[] = [];
    let telemetryDevice: TelemetryDevice;
    let telemetryDisplayProperty: TelemetryDisplayProperty;
    if (telemetryPayloads.length > 0) {
      telemetryDevice = TelemetryDevice.createFromTelemetry(
        telemetryPayloads[0],
      );
      let frequency = telemetryPayloads[0].metric.frequency;

      for (const rcvdTelemetryPayload of telemetryPayloads) {
        const telemetryPayload = new TelemetryPayload(rcvdTelemetryPayload);
        metrics.push(getMetricDTO(telemetryPayload.metric));
      }
      const metricsAttributeId =
        metrics.length > 0
          ? telemetryPayloads[0].metric.metricsAttributeId
          : searchCriteria.metricsAttributeId;

      telemetryDisplayProperty = {
        metricsAttributeId: metricsAttributeId!,
        frequency: frequency,
        displayName: metricsAttributeId!,
        unit: telemetryPayloads[0].metric.unit,
        /* displayOrder:
              assetCurrPerfSrc.assetTypeCurrentPerformanceSource.displayOrder, */
      };
    } else {
      telemetryDevice =
        TelemetryDevice.createFromFindAssetPerformanceTelemetry(searchCriteria);
      telemetryDisplayProperty = {
        metricsAttributeId: searchCriteria.metricsAttributeId!,
        frequency: searchCriteria.frequency ?? MetricsFrequency.INSTANT,
        displayName: searchCriteria.metricsAttributeId!,
        //unit: searchCriteria.unit,
        /* displayOrder:
              assetCurrPerfSrc.assetTypeCurrentPerformanceSource.displayOrder, */
      };
      metrics = [];

      //throw new Error('No telemetry');
    }
    return new TelemetryPayloadDto(
      telemetryDevice,
      metrics,
      telemetryDisplayProperty,
    );
  }


  // my 
  async getAssetPerformanceTelemetryy(
    searchCriteria: FindAssetPerformanceTelemetry,
  ) {
    const fnName = this.getAssetPerformanceTelemetry.name;

    this.logger.debug(`${fnName} : Start`);

    const findTelemetryPayload =
      FindTelemetryPayloadForAPeriod.createFromFindAssetPerformanceTelemetry(
        searchCriteria,
      );

    const telemetryPayloads =
      await this.telemetryPayloadService.findForATimePeriodInAsc(
        findTelemetryPayload,
      );

    if (_.isEmpty(telemetryPayloads)) {
      return [];
    }

    const aCPSs =
      await this.assetCurrentPerformanceSourceService.findByMultipleIDs({
        csvAssetIDs: searchCriteria.assetId,
      });

    const aCPSByKey = new Map<string, AssetCurrentPerformanceSource>();
    const deviceTypeIDSet = new Set<string>();

    for (const aCPS of aCPSs) {
      const aCPSObj = new AssetCurrentPerformanceSource(aCPS);

      aCPSByKey.set(aCPSObj.getKey(), aCPSObj);

      if (aCPSObj.virtualDevice?.deviceTypeId) {
        deviceTypeIDSet.add(aCPSObj.virtualDevice.deviceTypeId);
      }
    }

    let dTMAsByKey: _.Dictionary<DeviceTypeMetricsAttribute[]> = {};

    if (deviceTypeIDSet.size > 0) {
      dTMAsByKey =
        await this.deviceTypeMetricsAttributeService.dTMAsByByKey(
          {
            csvDeviceTypeIDs: [...deviceTypeIDSet].join(','),
          },
          false,
          true,
        );
    }

    return new TelemetryPayloadsRepo(telemetryPayloads).getCTPLDTOV3({
      aCPSByKey,
      dTMAsByKey,
    });
  }



}




