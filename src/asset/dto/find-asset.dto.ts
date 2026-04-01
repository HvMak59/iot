import { FindOptionsWhere } from 'typeorm';
import { Asset } from '../entities/asset.entity';
// import { Asset } from 'asset/entities/asset.entity';

export interface FindAssetDto extends FindOptionsWhere<Asset> { }
