import { PartialType } from '@nestjs/mapped-types';
import { Metric } from '../entities/metric.entity';

export class CreateMetricDto extends PartialType(Metric) {}
