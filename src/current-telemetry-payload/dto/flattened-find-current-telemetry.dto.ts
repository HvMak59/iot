import { FindOptionsWhere } from 'typeorm';
import { CurrentTelemetryPayload } from '../entities/current-telemetry-payload.entity';

/* export class FindCurrentTelemetryDto extends PartialType(
  CurrentTelemetryPayload,
) {} */

export interface FlattenedFindCurrentTelemetryDto
  extends FindOptionsWhere<CurrentTelemetryPayload> {
  metricsAttributeId?: string;
}
