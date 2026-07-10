import { MetricDto } from 'src/metrics/dto/metric.dto';
import { Metric } from 'src/metrics/entities/metric.entity';
import { TelemetryDevice } from './telemetry-device.dto';
import { TelemetryDisplayProperty } from './telemetry-display-property.dto.';

export class TelemetryPayloadDto {
  //telemetryDevice: TelemetryDevice;
  //telemetryDisplayProperty?: TelemetryDisplayProperty;
  //telemetryMeasures: Metrics[];
  constructor(
    public telemetryDevice: TelemetryDevice,
    // public metrics: Partial<MetricDto>[],
    public metrics: Partial<Metric>[],
    public telemetryDisplayProperty?: TelemetryDisplayProperty,
  ) {
    this.telemetryDevice = telemetryDevice;
    this.telemetryDisplayProperty = telemetryDisplayProperty;
    this.metrics = metrics;
  }
}
