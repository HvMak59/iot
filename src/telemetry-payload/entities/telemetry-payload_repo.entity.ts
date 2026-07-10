// import { KEY_SEPARATOR } from 'src/app_config/constants';
import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';
import { TelemetryPayload } from './telemetry-payload.entity';
import { Metric } from 'src/metrics/entities/metric.entity';
import { DeviceTypeMetricsAttribute } from 'src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { TelemetryPayloadV3DTO } from 'src/iot-server/dto/telemetry-payload-v3.dto';
import { getTPLV3DTO, getTPLV3DTOFOrDevice } from 'src/utils/others';
import { FindCurrentOpenAlertDto } from 'src/current-open-alert/dto/find-current-open-alert.dto';
import { TelemetryPayloadOptions } from 'src/current-telemetry-payload/dto/find-current-telemetry.dto';
// import { TelemetryDevice } from 'src/iot-server/dto/telemetry-device.dto';
// import _ from 'lodash';

export class TelemetryPayloadsRepo {
  telemetryPayloads: TelemetryPayload[] = [];
  constructor(telemetryPayloads: TelemetryPayload[]) {
    this.telemetryPayloads = telemetryPayloads;
  }



  // getCTPLDTOV3(
  //   // aCPSByKey: Map<string, AssetCurrentPerformanceSource>,
  //   // aCPSByKey: Map<string, findccur[]>,  // updated by hiten
  //   aCPSByKey: _.Dictionary<AssetCurrentPerformanceSource[]>,
  //   dTMAByKey: _.Dictionary<DeviceTypeMetricsAttribute[]>,
  // ): TelemetryPayloadV3DTO[] {
  // return getTPLV3DTO<TelemetryPayload>(
  //   this.telemetryPayloads as TelemetryPayload[],
  //   aCPSByKey,
  //   TelemetryPayload,
  //   dTMAByKey,
  // );
  // }

  getCTPLDTOV3(
    options: TelemetryPayloadOptions,
  ): TelemetryPayloadV3DTO[] {
    return getTPLV3DTO<TelemetryPayload>(
      this.telemetryPayloads as TelemetryPayload[],
      TelemetryPayload,
      options,
    );
  }

  getCTPLDTOV3ForDevice(
    findDTMAByKey: _.Dictionary<DeviceTypeMetricsAttribute[]>,
  ): TelemetryPayloadV3DTO[] {
    return getTPLV3DTOFOrDevice<TelemetryPayload>(
      this.telemetryPayloads as TelemetryPayload[],
      TelemetryPayload,
      findDTMAByKey,
    );
  }
  // static pyldKeyAndMetricHr: Set<string> = new Set<string>;

  // static pyldKeyAndMetricMin: Set<string> = new Set<string>();

  // extractMetrics(): Metric[] {
  //   const metrics: Metric[] = [];
  //   this.telemetryPayloads.forEach((tp) => {
  //     metrics.push(tp.metric);
  //   });
  //   return metrics;
  // }

  // addRecord(tp: TelemetryPayload) {
  //   this.telemetryPayloads.push(tp);
  // }

  // byAttributeKey(): _.Dictionary<TelemetryPayload[]> {
  //   const tpByDeviceMap = _.groupBy(this.telemetryPayloads, (tp) => new TelemetryPayload(tp).getAttributeKey());
  //   return tpByDeviceMap;
  // }

  // byMetricsAttributeId(): _.Dictionary<TelemetryPayload[]> {
  //   const tpByDeviceMap = _.groupBy(this.telemetryPayloads, (tp) => tp.metric.metricsAttributeId);
  //   return tpByDeviceMap;
  // }
  // getScope(): Record<string, string> {
  //   const scope: Record<string, string> = {};
  //   for (const ctpl of this.telemetryPayloads) {
  //     const metricId = ctpl.metric?.metricsAttributeId;
  //     if (metricId) {
  //       scope[metricId] = ctpl.metric?.measure ?? '';
  //     }
  //   }
  //   return scope;
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
