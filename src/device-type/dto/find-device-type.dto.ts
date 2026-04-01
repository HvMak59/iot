import { PartialType } from '@nestjs/mapped-types';
import { DeviceType } from 'src/device-type/entities/device-type.entity';
import { FindOptionsWhere } from 'typeorm';

export interface FindDeviceTypeDto extends FindOptionsWhere<DeviceType> {}
