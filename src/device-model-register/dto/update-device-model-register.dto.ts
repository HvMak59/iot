// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/mapped-types';
import { DeviceModelRegister } from '../entities/device-model-register.entity';

export class UpdateDeviceModelRegisterDto extends PartialType(DeviceModelRegister) { }
