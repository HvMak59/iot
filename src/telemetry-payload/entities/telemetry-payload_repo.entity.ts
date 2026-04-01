// import { KEY_SEPARATOR } from 'src/app_config/constants';
import { TelemetryPayload } from './telemetry-payload.entity';
import { Metric } from 'src/metrics/entities/metric.entity';
// import { TelemetryDevice } from 'src/iot-server/dto/telemetry-device.dto';
// import _ from 'lodash';

export class TelemetryPayloadsRepo {
  telemetryPayloads: TelemetryPayload[] = [];
  constructor(telemetryPayloads: TelemetryPayload[]) {
    this.telemetryPayloads = telemetryPayloads;
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
