import { PartialType } from '@nestjs/mapped-types';
import { DeviceModelAlert } from '../entities/device-model-alert.entity';

export class CreateDeviceModelAlertDto extends PartialType(DeviceModelAlert) {}
