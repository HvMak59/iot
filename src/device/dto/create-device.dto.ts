import { PartialType } from '@nestjs/mapped-types';
import { Device } from '../entities/device.entity';

export class CreateDeviceDto extends PartialType(Device) {}
