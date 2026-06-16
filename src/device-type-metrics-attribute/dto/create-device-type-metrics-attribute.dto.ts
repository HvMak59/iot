import { PartialType } from '@nestjs/mapped-types';
import { DeviceTypeMetricsAttribute } from '../entities/device-type-metrics-attribute.entity';

export class CreateDeviceTypeMetricsAttributeDto extends PartialType(
  DeviceTypeMetricsAttribute,
) {}
