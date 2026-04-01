import { FindOptionsWhere } from 'typeorm';
import { Device } from '../entities/device.entity';

export interface FindDeviceDto extends FindOptionsWhere<Device> {}
