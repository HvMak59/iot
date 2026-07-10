import { FindOptionsWhere } from 'typeorm';
import { CurrentTelemetryPayload } from '../entities/current-telemetry-payload.entity';
import { DeviceTypeMetricsAttribute } from 'src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';

/* export class FindCurrentTelemetryDto extends PartialType(
  CurrentTelemetryPayload,
) {} */

export interface FindCurrentTelemetryDto
  extends FindOptionsWhere<CurrentTelemetryPayload> {
  metricsAttributeId?: string
}


export interface TelemetryPayloadOptions {
  dTMAsByKey?: _.Dictionary<DeviceTypeMetricsAttribute[]>;
  aCPSByKey?: Map<string, AssetCurrentPerformanceSource>;
}