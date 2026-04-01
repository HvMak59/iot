import { MetricsAttribute } from 'src/metrics-attribute/entities/metrics-attribute.entity';

export interface DeviceModelAttributeDto {
  deviceModelId: string;
  metricsAttribute: MetricsAttribute;
  unitId?: string;
}
