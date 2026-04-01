import { PartialType } from '@nestjs/mapped-types';
// import { KEY_SEPARATOR } from 'src/app_config/constants';
import { Alert } from '../entities/alert.entity';
import { DeviceModelAlertFindMethod } from 'src/utils/enums';
import { KEY_SEPARATOR } from 'src/app_config/constants';
// import { DeviceModelAlertFindMethod } from 'utils/enums';

export class InputAlertDto extends PartialType(Alert) {
  constructor(inputAlertDto: InputAlertDto) {
    super(inputAlertDto);
    Object.assign(this, inputAlertDto);
  }
  rmuDeviceId?: string;
  rmuDeviceModelId?: string;
  deviceModelId?: string;
  deviceModelAlertFindMethod?: DeviceModelAlertFindMethod;

  getKeyForMap(deviceModelAlertFindMethod: DeviceModelAlertFindMethod) {
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
          (this.rmuDeviceModelId ?? '') +
          KEY_SEPARATOR +
          this.alertId
        );
      case DeviceModelAlertFindMethod.DEVICE_AND_RMU:
        return (
          (this.deviceModelId ?? '') +
          KEY_SEPARATOR +
          (this.rmuDeviceModelId ?? '') +
          KEY_SEPARATOR +
          this.alertId
        );
      default:
        return '';
    }
    /* return (
      (this.deviceModelId ?? '') +
      KEY_SEPARATOR +
      (this.rmuDeviceModelId ?? '') +
      KEY_SEPARATOR +
      this.alertId
    ); */
  }

  /*  prepareForInsert(deviceModelAlert?: DeviceModelAlert) {
    if (deviceModelAlert != null) {
      this.message = deviceModelAlert.message;
      this.possibleCause = deviceModelAlert.possibleCause;
      this.proposedSolution = deviceModelAlert.proposedSolution;
      this.alertType = deviceModelAlert.alertType;
    }
    delete this.rmuDeviceId;
    delete this.rmuDeviceModelId;
    delete this.deviceModelId;
    delete this.deviceModelAlertFindMethod;
  } */
}
