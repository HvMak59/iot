import { TelemetryDevice } from 'src/iot-server/dto/telemetry-device.dto';
import { Metric } from 'src/metrics/entities/metric.entity';

export class CurrentTelemetryPayloadDTOV2 {
  constructor(
    currentTelemetryPayloadDTO: Partial<CurrentTelemetryPayloadDTOV2>,
  ) {
    Object.assign(this, currentTelemetryPayloadDTO);
  }

  telemetryDevice: TelemetryDevice;
  metrics: Partial<Metric>[];
}
