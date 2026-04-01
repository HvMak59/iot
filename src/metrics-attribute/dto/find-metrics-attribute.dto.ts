import { FindOptionsWhere } from 'typeorm';
import { MetricsAttribute } from '../entities/metrics-attribute.entity';

export interface FindMetricsAttributeDto
  extends FindOptionsWhere<MetricsAttribute> {}
