import { PartialType } from '@nestjs/mapped-types';
import { DeviceModelRegister } from '../entities/device-model-register.entity';

export class CreateDeviceModelRegisterDto extends PartialType(DeviceModelRegister) { }
