import { PartialType } from '@nestjs/mapped-types';
import { CreateMetricsAttributeAggregationDto } from './create-metrics-attribute-aggregation.dto';

export class UpdateMetricsAttributeAggregationDto extends PartialType(
  CreateMetricsAttributeAggregationDto,
) {}
