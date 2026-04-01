import { PartialType } from '@nestjs/mapped-types';
import { Device } from '../entities/device.entity';

export interface FindDevicesFromMultipleIDs {
  csvOrgIDs?: string;
  csvOwnerOrgIDs?: string;
  csvAssetTypeIDs?: string;
  csvAssetIDs?: string;
  csvVirtualDeviceIDs?: string;
  csvDeviceIDs?: string;
  csvDeviceTypeIDs?: string;
  csvSerialNos?: string;
  csvClientDeviceIDs?: string;
  csvDeviceModelIDs?: string;
}
