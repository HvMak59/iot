export interface FindAlertsByMultipleIDsDTO {
  csvIDs?: string;
  csvOrgIDs?: string;
  csvAssetTypeIDs?: string;
  csvAssetIDs?: string;
  csvVirtualDeviceIDs?: string;
  csvSourceAttributes?: string;
  //csvMetricsAttributeIDs?: string;
  csvAlertIDs?: string;
  startTime?: number;
  endTime?: number;
}
