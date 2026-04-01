import { PartialType } from '@nestjs/mapped-types';
import { Device } from '../entities/device.entity';

export class UpdateDeviceDto extends PartialType(Device) {
  constructor(updateDevice: UpdateDeviceDto) {
    super();
    const { /*entityState*/ ...result } = updateDevice;
    Object.assign(this, result);
  }
}
