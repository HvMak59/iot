import { DeviceModelAlert } from '../entities/device-model-alert.entity';

export class DeviceModelAlerts {
  deviceModelAlerts: DeviceModelAlert[];
  deviceModelAlertsByObjKey = new Map<string, DeviceModelAlert>();
  constructor(deviceModelAlerts: DeviceModelAlert[]) {
    this.deviceModelAlerts = deviceModelAlerts;
  }

  addDeviceModelAlerts(deviceModelAlerts: DeviceModelAlert[]) {
    this.deviceModelAlerts = this.deviceModelAlerts.concat(deviceModelAlerts);
  }

  byObjKey() {
    const deviceModelAlertsMap = new Map<string, DeviceModelAlert>();

    for (const deviceModelAlert of this.deviceModelAlerts) {
      const deviceModelAlertObj = new DeviceModelAlert(deviceModelAlert);
      deviceModelAlertsMap.set(
        deviceModelAlertObj.getKey(),
        deviceModelAlertObj,
      );
    }
    return deviceModelAlertsMap;
  }

  noOfAlerts() {
    return this.deviceModelAlerts.length;
  }
}
