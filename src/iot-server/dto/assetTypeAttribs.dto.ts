import { AssetStateWiseCount } from './assetStatewiseCount.dto';
import { IAssetStateWiseCount } from './iAssetStateWiseCount';

export interface AssetTypeAttribsDto {
  assetStateWiseCount?: IAssetStateWiseCount;
  warningCount?: number;
  faultCount?: number;
  deviceCount?: number;
  csvAssetIDs?: string;
}
