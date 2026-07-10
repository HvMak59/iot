import { PartialType } from '@nestjs/mapped-types';
// import _ from 'lodash';
// import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';
// import { FindAssetPerformanceTelemetry } from 'src/iot-server/dto/find-asset-performance-telemetry';
import { Metric } from 'src/metrics/entities/metric.entity';
import { TelemetryPayload } from '../entities/telemetry-payload.entity';
import { FindAssetPerformanceTelemetry } from 'src/iot-server/dto/find-asset-performance-telemetry';

export class FindTelemetryPayloadForAPeriod extends PartialType(
  TelemetryPayload,
) {
  metricsAttributeId: string;
  startTime: number;
  endTime: number;

  constructor(findTelemetryPayload: Partial<FindTelemetryPayloadForAPeriod>) {
    super();
    Object.assign(this, findTelemetryPayload);
  }

  // static createFromAssetCurrentPerformanceSource(
  //   assetCurrentPerformanceSource: AssetCurrentPerformanceSource,
  // ) {
  //   return new FindTelemetryPayloadForAPeriod({
  //     assetId: assetCurrentPerformanceSource.assetId,
  //     virtualDeviceId: assetCurrentPerformanceSource.virtualDeviceId,
  //     /* isDeviceGroup: assetCurrentPerformanceSource.isDeviceGroup
  //       ? assetCurrentPerformanceSource.isDeviceGroup
  //       : undefined, */
  //     metricsAttributeId: assetCurrentPerformanceSource.metricsAttributeId,
  //   });
  // }
  static createFromFindAssetPerformanceTelemetry(
    findAssetPerformanceTelemetry: FindAssetPerformanceTelemetry,
  ) {
    const newObj = new FindTelemetryPayloadForAPeriod({
      assetId: findAssetPerformanceTelemetry.assetId,
      virtualDeviceId: findAssetPerformanceTelemetry.virtualDeviceId,
      /* isDeviceGroup: findAssetPerformanceTelemetry.isDeviceGroup
        ? findAssetPerformanceTelemetry.isDeviceGroup
        : undefined, */
      metricsAttributeId: findAssetPerformanceTelemetry.metricsAttributeId,
    });
    newObj.updateTimeRange(
      findAssetPerformanceTelemetry.startTime,
      findAssetPerformanceTelemetry.endTime,
    );
    return newObj;
  }
  // static createFromFindAssetPerformanceTelemetry(
  //   findAssetPerformanceTelemetry: FindAssetPerformanceTelemetry,
  // ) {
  //   const newObj = new FindTelemetryPayloadForAPeriod({
  //     assetId: findAssetPerformanceTelemetry.assetId,
  //     virtualDeviceId: findAssetPerformanceTelemetry.virtualDeviceId,
  //     /* isDeviceGroup: findAssetPerformanceTelemetry.isDeviceGroup
  //       ? findAssetPerformanceTelemetry.isDeviceGroup
  //       : undefined, */
  //     metricsAttributeId: findAssetPerformanceTelemetry.metricsAttributeId,
  //   });
  //   newObj.updateTimeRange(
  //     findAssetPerformanceTelemetry.startTime,
  //     findAssetPerformanceTelemetry.endTime,
  //   );
  //   return newObj;
  // }

  updateTimeRange(startTime: number | string, endTime: number | string) {
    this.startTime =
      typeof startTime == 'string' ? parseInt(startTime) : startTime;
    this.endTime = typeof endTime == 'string' ? parseInt(endTime) : endTime;
  }
}
