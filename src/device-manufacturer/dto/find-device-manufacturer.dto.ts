import { PartialType } from '@nestjs/mapped-types';
import { DeviceManufacturer } from 'src/device-manufacturer/entities/device-manufacturer.entity';
import { FindOptionsWhere } from 'typeorm';

/* export class FindDeviceManufacturerDto extends PartialType(
  DeviceManufacturer,
) {} */
export interface FindDeviceManufacturerDto
  extends FindOptionsWhere<DeviceManufacturer> {}
