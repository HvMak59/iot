import { PartialType } from '@nestjs/mapped-types';
import { CreateMetricsAttributeDto } from './create-metrics-attribute.dto';

export class UpdateMetricsAttributeDto extends PartialType(
  CreateMetricsAttributeDto,
) {}
