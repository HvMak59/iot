import { MetricWithDisplayProperty } from './metric_with_display_property.dto';
import { TelemetryDevice } from './telemetry-device.dto';

export class TelemetryPayloadV3DTO {
  constructor(telemetryPayloadV3DTO: Partial<TelemetryPayloadV3DTO>) {
    Object.assign(this, telemetryPayloadV3DTO);
  }
  telemetryDevice: TelemetryDevice;
  metricsWithDisplayProperties: MetricWithDisplayProperty[];
}
