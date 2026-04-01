export class AssetStateWiseCount {
  assetState: string;
  assetCount: number;
  //assetStateWiseCount: Map<string, number>;

  constructor(assetStateWiseCount: AssetStateWiseCount) {
    this.assetState = assetStateWiseCount.assetState;
    this.assetCount = assetStateWiseCount.assetCount;
  }

  /* addAsset(asset: Asset) {
    const assetObj = new Asset(asset);
    const assetState = assetObj.getState();
    let count = this.assetStateWiseCount.get(assetState);
    count ? count++ : (count = 1);
    this.assetStateWiseCount.set(assetState, count);
  } */
}
