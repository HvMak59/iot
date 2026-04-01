import { PartialType } from '@nestjs/mapped-types';
import { MetricsAttribute } from '../entities/metrics-attribute.entity';

export class CreateMetricsAttributeDto extends PartialType(MetricsAttribute) {}
