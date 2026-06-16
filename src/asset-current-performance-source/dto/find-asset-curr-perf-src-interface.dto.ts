import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { AssetCurrentPerformanceSource } from '../entities/asset-current-performance-source.entity';

export interface FindAssetCurrPerfSrcInterfaceDto
  extends FindOptionsWhere<AssetCurrentPerformanceSource> {}
