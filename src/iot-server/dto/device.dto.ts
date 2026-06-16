import { DeviceModel } from 'src/device-model/entities/device-model.entity';
import { Device } from 'src/device/entities/device.entity';
// import { Org } from 'src/org/entities/org.entity';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
// import { EntityState } from 'src/utils/commonModels/entity_state';

export class DeviceDto {
  id: string;

  ownerOrgId: string;

  // ownerOrg: Org;

  deviceTypeId?: string;

  deviceManufacturerId: string;

  virtualDevice?: VirtualDevice;

  virtualDeviceId?: string;

  serialNo: string;

  deviceModelId: string;

  deviceModel: DeviceModel;

  assetId?: string;

  deviceModelStateDescription?: string;

  deviceModelStateTime?: Date;

  // entityState: EntityState;

  searchTerm?: string;

  clientDeviceId?: string;

  IMEI?: string;

  validateIMEI?: boolean;

  phoneNumber?: string;

  constructor(device: Device) {
    this.id = device.id;
    this.ownerOrgId = device.ownerOrgId;
    // this.ownerOrg = device.ownerOrg;
    // this.deviceTypeId = device.deviceModel.deviceTypeId;
    // this.deviceManufacturerId = device.deviceModel.deviceManufacturerId;
    this.virtualDevice = device.virtualDevice;
    this.virtualDeviceId = device.virtualDeviceId;
    this.serialNo = device.serialNo;
    this.deviceModelId = device.deviceModelId;
    this.deviceModel = device.deviceModel;
    this.assetId = device.virtualDevice
      ? device.virtualDevice.assetId
      : undefined;
    // if (device.deviceModelState) {
    //   this.deviceModelStateDescription = device.deviceModelState.description;
    //   this.deviceModelStateTime = device.deviceModelStateTime;
    // }
    /* this.warnigCount = device.warningCount;
    this.faultCount = device.faultCount; */
    // this.entityState = device.entityState;
    this.searchTerm = device.searchTerm;
    this.clientDeviceId = device.clientDeviceId;
    this.IMEI = device.iMEI;
    this.validateIMEI = device.validateIMEI;
    this.phoneNumber = device.phoneNumber;
  }

  // constructor(device: Device) { }
}
