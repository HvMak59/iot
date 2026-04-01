import { FindOptionsWhere } from 'typeorm';
import { CurrentTelemetryPayload } from '../entities/current-telemetry-payload.entity';

/* export class FindCurrentTelemetryDto extends PartialType(
  CurrentTelemetryPayload,
) {} */

export interface FindCurrentTelemetryDto
  extends FindOptionsWhere<CurrentTelemetryPayload> {}
