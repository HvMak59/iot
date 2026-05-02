// import { PartialType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupMetricsAttributeAggregationDto } from './create-group-metrics-attribute-aggregation.dto';

export class UpdateGroupMetricsAttributeAggregationDto extends PartialType(CreateGroupMetricsAttributeAggregationDto) { }
