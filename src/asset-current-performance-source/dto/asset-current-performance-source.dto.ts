import { PickType } from '@nestjs/mapped-types';
import { Asset } from 'src/asset/entities/asset.entity';
import { AssetCurrentPerformanceSource } from '../entities/asset-current-performance-source.entity';

export class AssetCurrentPerformanceSourceDto extends PickType(
  AssetCurrentPerformanceSource,
  ['virtualDeviceId', 'metricsAttributeId'],
) {
  constructor(assetCurrentPerfSrc: Partial<AssetCurrentPerformanceSource>) {
    super();
    this.virtualDeviceId = assetCurrentPerfSrc.virtualDeviceId!;
    this.metricsAttributeId = assetCurrentPerfSrc.metricsAttributeId!;
  }
}
