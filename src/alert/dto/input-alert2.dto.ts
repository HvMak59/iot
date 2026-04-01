import { PartialType } from '@nestjs/mapped-types';
import { KEY_SEPARATOR } from 'src/app_config/constants';

import { Alert } from '../entities/alert.entity';

export class InputAlert2Dto extends PartialType(Alert) {
  constructor(inputAlert2Dto: InputAlert2Dto) {
    super(inputAlert2Dto);
    Object.assign(this, inputAlert2Dto);
  }

  passthruDeviceId?: string;
  passthruDeviceModelId?: string;
  deviceModelId?: string;
  //deviceModelAlertFindMethod?: DeviceModelAlertFindMethod;

  /* getKeyForMap(deviceModelAlertFindMethod: DeviceModelAlertFindMethod) {
    switch (deviceModelAlertFindMethod) {
      case DeviceModelAlertFindMethod.ONLY_DEVICE:
        return (
          (this.deviceModelId ?? '') +
          KEY_SEPARATOR +
          '' +
          KEY_SEPARATOR +
          this.alertId
        );
      case DeviceModelAlertFindMethod.ONLY_RMU:
        return (
          KEY_SEPARATOR +
          (this.passthruDeviceModelId ?? '') +
          KEY_SEPARATOR +
          this.alertId
        );
      case DeviceModelAlertFindMethod.DEVICE_AND_RMU:
        return (
          (this.deviceModelId ?? '') +
          KEY_SEPARATOR +
          (this.passthruDeviceModelId ?? '') +
          KEY_SEPARATOR +
          this.alertId
        );
      default:
        return '';
    }
  } */
}
