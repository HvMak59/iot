// import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';

export interface FindPerformanceTelemetry {
  assetTypeId?: string;
  assetId: string;
  isDeviceGroup?: boolean;
  virtualDeviceId: string;
  metricsAttributeId: string;
  startTime: string;
  endTime: string;
}
