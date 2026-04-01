import { Asset } from 'src/asset/entities/asset.entity';
import { User } from 'src/user/entities/user.entity';

export class UserOrgNoOfAssets {
  user: User;
  //assetTypeWiseNoOfAssets: Map<string, number>;
  assetTypesNoOfAssets: Array<AssetTypeNoOfAssets>;

  constructor(user: User) {
    this.user = user;
    //this.assetTypeWiseNoOfAssets = new Map();
    this.assetTypesNoOfAssets = [];
  }

  /* addAsset(asset: Asset) {
    let noOfAssets = this.assetTypeWiseNoOfAssets.get(asset.assetTypeId);
    noOfAssets ? noOfAssets++ : (noOfAssets = 1);
    this.assetTypeWiseNoOfAssets.set(asset.assetTypeId, noOfAssets);
  } */
}

export class AssetTypeNoOfAssets {
  assetType: string;
  noOfAssets: number;

  constructor(assetTypeNoOfAssets: AssetTypeNoOfAssets) {
    this.assetType = assetTypeNoOfAssets.assetType;
    this.noOfAssets = assetTypeNoOfAssets.noOfAssets;
  }
}
