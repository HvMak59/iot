import { DeviceTypeAttributes } from 'src/iot-server/dto/device-type-attributes.dto';
import { DeviceTypeWiseAttributes } from 'src/iot-server/dto/device-type-wise-attributes.dto';
import { Device } from './device.entity';

export class Devices {
  devices: Device[];
  constructor(devices: Device[]) {
    this.devices = devices;
  }

  // getDevicesAttribs() {
  //   const deviceMap = new Map<string, DeviceTypeAttributes>();

  //   for (const device of this.devices) {
  //     const storedDeviceTypeAttribs = deviceMap.get(
  //       device.deviceModel.deviceTypeId,
  //     );
  //     if (storedDeviceTypeAttribs) {
  //       ++storedDeviceTypeAttribs.deviceCount;
  //       storedDeviceTypeAttribs.faultCount +=
  //         device.entityState.faultCount ?? 0;
  //       storedDeviceTypeAttribs.warningCount +=
  //         device.entityState.warningCount ?? 0;
  //       deviceMap.set(device.deviceModel.deviceTypeId, storedDeviceTypeAttribs);
  //     } else {
  //       const deviceTypeAttribs: DeviceTypeAttributes = {
  //         deviceCount: 1,
  //         faultCount: device.entityState.faultCount ?? 0,
  //         warningCount: device.entityState.warningCount ?? 0,
  //       };
  //       deviceMap.set(device.deviceModel.deviceTypeId, deviceTypeAttribs);
  //     }
  //   }
  //   const deviceTypeWiseAttribsRecords: Array<DeviceTypeWiseAttributes> = [];
  //   deviceMap.forEach((deviceTypeAttribs, deviceTypeID) => {
  //     const deviceTypeWiseAttribs: DeviceTypeWiseAttributes = {
  //       deviceTypeID: deviceTypeID,
  //       deviceTypeAttributes: deviceTypeAttribs,
  //     };
  //     deviceTypeWiseAttribsRecords.push(deviceTypeWiseAttribs);
  //   });
  //   return deviceTypeWiseAttribsRecords;
  // }
}
