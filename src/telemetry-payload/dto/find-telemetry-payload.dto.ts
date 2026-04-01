import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { TelemetryPayload } from '../entities/telemetry-payload.entity';

export interface FindTelemetryPayloadDto
  extends FindOptionsWhere<TelemetryPayload> {
  metricsAttributeId?: string;
}
