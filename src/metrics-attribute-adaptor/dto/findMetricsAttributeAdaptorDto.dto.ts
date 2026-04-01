import { FindOptionsWhere } from 'typeorm';
// import { Device } from '../entities/device.entity';
import { MetricsAttributeAdaptor } from '../entities/metrics-attribute-adaptor.entity';

export interface FindMetricsAttributeAdaptorDto extends FindOptionsWhere<MetricsAttributeAdaptor> { }
