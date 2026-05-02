import { PartialType } from '@nestjs/mapped-types';
import { FindOptionsWhere } from 'typeorm';
import { MetricsAttributeAggregation } from '../entities/metrics-attribute-aggregation.entity';

/* export class FindDeviceGroupMetricsAttributeDto extends PartialType(
  DeviceGroupMetricsAttribute,
) {} */
export interface FindMetricsAttributeAggregationDto
  extends FindOptionsWhere<MetricsAttributeAggregation> {}
