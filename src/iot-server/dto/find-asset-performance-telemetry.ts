// import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';
import { DisplayPriority, MetricsFrequency } from 'src/utils/enums';

export class FindAssetPerformanceTelemetry {
  assetTypeId?: string;
  assetId: string;
  //isDeviceGroup?: boolean;
  virtualDeviceId?: string;
  //label?: string;
  metricsAttributeId?: string;
  startTime: string;
  endTime: string;
  frequency?: MetricsFrequency;
  displayPriority?: DisplayPriority;

  constructor(
    findAssetPerformanceTelemetry: Partial<FindAssetPerformanceTelemetry>,
  ) {
    findAssetPerformanceTelemetry
      ? Object.assign(this, findAssetPerformanceTelemetry)
      : Object.assign(this, {});
  }

  // update(assetCurrPerfSrc: AssetCurrentPerformanceSource) {
  //   //this.isDeviceGroup = assetCurrPerfSrc.isDeviceGroup;
  //   this.virtualDeviceId = assetCurrPerfSrc.virtualDeviceId;
  //   this.metricsAttributeId = assetCurrPerfSrc.metricsAttributeId;
  // }
}
