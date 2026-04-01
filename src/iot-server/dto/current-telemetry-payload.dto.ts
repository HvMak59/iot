import { MetricDto } from 'src/metrics/dto/metric.dto';
import { Metric } from 'src/metrics/entities/metric.entity';
import { TelemetryDevice } from './telemetry-device.dto';
import { TelemetryDisplayProperty } from './telemetry-display-property.dto.';

export class CurrentTelemetryPayloadDTO {
  //telemetryMeasure: Metrics;
  //telemetryDisplayProperty?: TelemetryDisplayProperty;
  //telemetryDevice?: TelemetryDevice;

  constructor(
    //public metric: MetricDto,
    public metric: Partial<Metric>,
    public telemetryDisplayProperty?: TelemetryDisplayProperty,
    public telemetryDevice?: TelemetryDevice,
  ) {
    this.metric = metric;
    this.telemetryDevice = telemetryDevice;
    this.telemetryDisplayProperty = telemetryDisplayProperty;
  }
  /* constructor (currentTelemetryPayloadDto : Partial<CurrentTelemetryPayloadDto>) {
        currentTelemetryPayloadDto ? Object.assign(this, currentTelemetryPayloadDto) : Object.assign(this, {});       
    } */
}
