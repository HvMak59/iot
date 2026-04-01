import { FindOptionsWhere } from 'typeorm';
import { Metric } from '../entities/metric.entity';

export interface FindMetricDto extends FindOptionsWhere<Metric> {}
