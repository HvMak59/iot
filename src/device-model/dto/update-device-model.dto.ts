import { PartialType } from '@nestjs/mapped-types';
import { DeviceModel } from '../entities/device-model.entity';

export class UpdateDeviceModelDto extends PartialType(DeviceModel) {}
