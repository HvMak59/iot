import { PartialType } from '@nestjs/mapped-types';
import { FindOptionsWhere } from 'typeorm';
import { DeviceModel } from '../entities/device-model.entity';

export interface FindDeviceModelDto extends FindOptionsWhere<DeviceModel> {}
