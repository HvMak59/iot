import { PartialType } from '@nestjs/mapped-types';
import { FindOptionsWhere } from 'typeorm';
// import { DeviceModelAlertFindMethod } from 'src/utils/enums';
import { DeviceModelAlert } from '../entities/device-model-alert.entity';
import { DeviceModelAlertFindMethod } from 'src/utils/enums';

/* export class FindDeviceModelAlertDto extends PartialType(DeviceModelAlert) {} */
export interface FindDeviceModelAlertDto
  extends FindOptionsWhere<DeviceModelAlert> {
  deviceModelAlertFindMethod?: DeviceModelAlertFindMethod;
}
