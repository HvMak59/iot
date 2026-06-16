import { FindOptionsWhere } from 'typeorm';
import { DeviceTypeMetricsAttribute } from '../entities/device-type-metrics-attribute.entity';

export interface FindDeviceTypeMetricsAttributeDto
  extends FindOptionsWhere<DeviceTypeMetricsAttribute> {}
