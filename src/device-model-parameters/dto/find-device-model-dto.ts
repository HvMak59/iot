import { FindOptionsWhere } from 'typeorm';
import { DeviceModelRegister } from '../entities/device-model-register.entity';

export interface FindDeviceModelRegisterDto extends FindOptionsWhere<DeviceModelRegister> { }
