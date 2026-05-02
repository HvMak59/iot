import { PartialType } from '@nestjs/mapped-types';
import { GroupMetricsAttributeAggregation } from '../entities/group-metrics-attribute-aggregation.entity';

export class CreateGroupMetricsAttributeAggregationDto extends PartialType(
  GroupMetricsAttributeAggregation,
) {}
