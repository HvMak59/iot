import { PartialType } from '@nestjs/mapped-types';
import { FindOptionsWhere } from 'typeorm';
import { GroupMetricsAttributeAggregation } from '../entities/group-metrics-attribute-aggregation.entity';

export interface FindGroupMetricsAttributeAggregationDto
  extends FindOptionsWhere<GroupMetricsAttributeAggregation> {}
