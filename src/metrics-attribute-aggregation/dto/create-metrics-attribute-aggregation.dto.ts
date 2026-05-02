import { PartialType } from '@nestjs/mapped-types';
import { MetricsAttributeAggregation } from '../entities/metrics-attribute-aggregation.entity';

export class CreateMetricsAttributeAggregationDto extends PartialType(
  MetricsAttributeAggregation,
) {}
