import { TelemetryPayload } from './telemetry-payload.entity';
import { Metric } from 'src/metrics/entities/metric.entity';
import { TelemetryDevice } from 'src/iot-server/dto/telemetry-device.dto';
import _ from 'lodash';
import { TelemetryDisplayProperty } from 'src/iot-server/dto/telemetry-display-property.dto.';
// import { getMetricDTO, getTPLV3DTO, getTPLV5DTO } from '../../../utils/others';
import { MetricDto } from 'src/metrics/dto/metric.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { TelemetryDeviceWithMetrics } from '../dto/telemetry-device-with-metrics.dto';
import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';
import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
import { TelemetryPayloadV3DTO } from 'src/iot-server/dto/telemetry-payload-v3.dto';
import { DeviceTypeMetricsAttribute } from 'src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { getMetricDTO, getTPLV3DTO } from 'src/utils/others';
import { TelemetryDeviceWithMetrics } from '../dto/telemetry-device-with-metrics.dto';
// import { MetricsDisplay } from 'src/utils/commonModels/metrics-display.entity';

export class TelemetryPayloadsRepo {
  telemetryPayloads: TelemetryPayload[] = [];
  constructor(telemetryPayloads: TelemetryPayload[]) {
    this.telemetryPayloads = telemetryPayloads;
  }

  static pyldKeyAndMetricHr: Set<string> = new Set<string>();

  static pyldKeyAndMetricMin: Set<string> = new Set<string>();

  extractMetrics(): Metric[] {
    const metrics: Metric[] = [];
    this.telemetryPayloads.forEach((tp) => {
      metrics.push(tp.metric);
    });
    return metrics;
  }

  addRecord(tp: TelemetryPayload) {
    this.telemetryPayloads.push(tp);
  }

  byAttributeKey(): _.Dictionary<TelemetryPayload[]> {
    const tpByDeviceMap = _.groupBy(this.telemetryPayloads, (tp) =>
      new TelemetryPayload(tp).getAttributeKey(),
    );
    return tpByDeviceMap;
  }

  byMetricsAttributeId(): _.Dictionary<TelemetryPayload[]> {
    const tpByDeviceMap = _.groupBy(
      this.telemetryPayloads,
      (tp) => tp.metric.metricsAttributeId,
    );
    return tpByDeviceMap;
  }
  getScope(): Record<string, string> {
    const scope: Record<string, string> = {};
    for (const ctpl of this.telemetryPayloads) {
      const metricId = ctpl.metric?.metricsAttributeId;
      if (metricId) {
        scope[metricId] = ctpl.metric?.measure ?? '';
      }
    }
    return scope;
  }

  createTelemetryPayloadDto() {
    if (this.telemetryPayloads.length > 0) {
      const telemetryDevice = TelemetryDevice.createFromTelemetry(
        this.telemetryPayloads[0],
      );
      const telemetryDisplayProperty: TelemetryDisplayProperty = {
        metricsAttributeId:
          this.telemetryPayloads[0].metric.metricsAttributeId!,
        frequency: this.telemetryPayloads[0].metric.frequency,
        displayName: this.telemetryPayloads[0].metric.metricsAttributeId!,
        unit: this.telemetryPayloads[0].metric.unit,
      };

      const metricDTOs: Array<Partial<Metric>> = [];
      this.telemetryPayloads.map((telemetryPayload) =>
        //metricDTOs.push(new MetricDto(telemetryPayload.metric)),
        metricDTOs.push(getMetricDTO(telemetryPayload.metric)),
      );

      const telemetryPayloadDto = {
        telemetryDevice,
        telemetryDisplayProperty,
        metrics: metricDTOs,
      };
      return telemetryPayloadDto;
    } else {
      throw new Error(
        `Cannot create telemetry payload dto from empty telemetry payloads array : ${JSON.stringify(
          this.telemetryPayloads,
        )}`,
      );
    }
  }

  telemetryDevicesWithMetrics() {
    const logger = winstonServerLogger(this.telemetryDevicesWithMetrics.name);
    const telemetryDevicesWithMetrics: TelemetryDeviceWithMetrics[] = [];
    if (this.telemetryPayloads.length > 0) {
      const metricDTOsByVD: Map<string, MetricDto[]> = new Map();
      const telemetryDeviceByVD: Map<string, TelemetryDevice> = new Map();
      logger.debug(`Iterating telemetry payloads`);
      for (const tp of this.telemetryPayloads) {
        const telemetryDevice = new TelemetryDevice({
          virtualDeviceId: tp.virtualDeviceId,
          id: tp.deviceId,
          name: tp.virtualDevice?.name,
          assetId: tp.assetId,
          displayOrder: tp.virtualDevice?.displayOrder ?? 0,
        });
        logger.debug(
          `Telemetry device is : ${JSON.stringify(telemetryDevice)}`,
        );
        const virtualDeviceId = telemetryDevice.virtualDeviceId;
        logger.debug(`Virtual device ID is : ${virtualDeviceId}`);
        telemetryDeviceByVD.set(virtualDeviceId!, telemetryDevice);
        /* const metricDTO = getMetricDTO(tp.metric);
        logger.debug(
          `Metric DTO after getMetricDTO is : ${JSON.stringify(metricDTO)}`,
        ); */
        if (metricDTOsByVD.has(virtualDeviceId!)) {
          logger.debug(
            `metricDTOsByVD has virtual device ID : ${virtualDeviceId}`,
          );
          metricDTOsByVD.get(virtualDeviceId!)?.push(new MetricDto(tp.metric));
          logger.debug(`1. metricDTOsByVD size is : ${metricDTOsByVD.size}`);
        } else {
          metricDTOsByVD.set(virtualDeviceId!, [new MetricDto(tp.metric)]);
          logger.debug(
            `Added metric DTO for virtual device ID : ${virtualDeviceId}`,
          );
        }
        logger.debug(`2. metricDTOsByVD size : ${metricDTOsByVD.size}`);
      }
      logger.debug(
        `Finished processing telemetry payloads : ${this.telemetryPayloads.length}`,
      );
      for (const [virtualDeviceId, metricDTOs] of metricDTOsByVD) {
        logger.debug(
          `Telemetry Device : ${virtualDeviceId}, No of metrics : ${metricDTOs.length}`,
        );
        const telemetryDeviceWithMetrics = new TelemetryDeviceWithMetrics(
          telemetryDeviceByVD.get(virtualDeviceId!)!,
          metricDTOs,
        );
        telemetryDevicesWithMetrics.push(telemetryDeviceWithMetrics);
      }
      return telemetryDevicesWithMetrics;
    }
  }

  // getCTPLDTOV3(
  //   aCPSByKey: Map<string, AssetCurrentPerformanceSource>,
  //   //aCPSByKey: _.Dictionary<AssetCurrentPerformanceSource[]>,
  //   dTMAByKey: _.Dictionary<DeviceTypeMetricsAttribute[]>,
  // ): TelemetryPayloadV3DTO[] {
  // return getTPLV3DTO<TelemetryPayload>(
  //   this.telemetryPayloads as TelemetryPayload[],
  //   TelemetryPayload,
  //   aCPSByKey,
  //   dTMAByKey,
  // );
  // }

  // getCTPLDTOV5(
  //   metricsDisplaysByPK: Map<string, MetricsDisplay>,
  //   vDNameByVDID?: Map<string, string>,
  // ): TelemetryPayloadV3DTO[] {
  //   return getTPLV5DTO(
  //     this.telemetryPayloads as TelemetryPayload[],
  //     TelemetryPayload,
  //     metricsDisplaysByPK,
  //     vDNameByVDID,
  //   );
  // }
  /* this.telemetryPayloads.forEach((tp) => {
      const deviceID = tp.device.deviceID;
      if (tpByDeviceMap.has(deviceID)) {
        const tpList = tpByDeviceMap.get(deviceID);
        tpList.push(tp);
        tpByDeviceMap.set(deviceID, tpList);
      } else {
        tpByDeviceMap.set(deviceID, [tp]);
      }
    }); */

  /* static doesTheMetricHaveSameHr(key: string, hr: number): boolean {
    return TelemetryPayloadsRepo.pyldKeyAndMetricHr.has(key + KEY_SEPARATOR + hr);
  }

  static setMetricHr(key: string, hr: number) {
    TelemetryPayloadsRepo.pyldKeyAndMetricHr.add(key + KEY_SEPARATOR + hr);
  } */
}
