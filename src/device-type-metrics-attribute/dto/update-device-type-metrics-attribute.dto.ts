// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceTypeMetricsAttributeDto } from './create-device-type-metrics-attribute.dto';

export class UpdateDeviceTypeMetricsAttributeDto extends PartialType(
  CreateDeviceTypeMetricsAttributeDto,
) { }
