import { CapacityDto } from './capacity.dto';
import { CurrentTelemetryPayloadDTO } from './current-telemetry-payload.dto';

export interface AssetTypeCurrentPerformance {
  capacity?: CapacityDto;
  currentTelemetryPayloads: CurrentTelemetryPayloadDTO[];
}
