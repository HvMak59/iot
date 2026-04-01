import _ from 'lodash';

export interface FindOrgsOrAssets {
  csvOrgIDs?: string;
  csvOrgHierIDs?: string;
  csvAssetTypeIDs?: string;
  csvAssetIDs?: string;
  /* constructor(findOrgsOrAssets: Partial<FindOrgsOrAssets>) {
    Object.assign(this, findOrgsOrAssets);
  } */
}

export function getUniqueFindOrgsOrAssets(findOrgsOrAssets: FindOrgsOrAssets) {
  if (findOrgsOrAssets.csvAssetIDs) {
    const uniqueAssetIDs = _.uniq(findOrgsOrAssets.csvAssetIDs.split(','));
    findOrgsOrAssets.csvAssetIDs = uniqueAssetIDs.join(',');
  }
  if (findOrgsOrAssets.csvOrgIDs) {
    const uniqueOrgIDs = _.uniq(findOrgsOrAssets.csvOrgIDs.split(','));
    findOrgsOrAssets.csvOrgIDs = uniqueOrgIDs.join(',');
  }
  if (findOrgsOrAssets.csvAssetTypeIDs) {
    const assetTypeIDs = findOrgsOrAssets.csvAssetTypeIDs.split(',');
    const uniqueAssetTypeIDs = _.uniq(assetTypeIDs);
    findOrgsOrAssets.csvAssetTypeIDs = uniqueAssetTypeIDs.join(',');
  }
  if (findOrgsOrAssets.csvOrgHierIDs) {
    const orgHierIDs = findOrgsOrAssets.csvOrgHierIDs.split(',');
    const uniqueOrgHierIDs = _.uniq(orgHierIDs);
    findOrgsOrAssets.csvOrgHierIDs = uniqueOrgHierIDs.join(',');
  }
  return findOrgsOrAssets;
}
