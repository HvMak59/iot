// import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';

export interface FindDevicesPerformanceTelemetryDto {
  assetTypeId?: string;
  csvAssetIDs?: string;
  csvVirtualDeviceIDs: string;
  metricsAttributeId: string;
  startTime: string;
  endTime: string;
}
