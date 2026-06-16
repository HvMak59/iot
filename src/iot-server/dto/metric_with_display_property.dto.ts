import { Metric } from 'src/metrics/entities/metric.entity';
import { TelemetryDisplayProperty } from './telemetry-display-property.dto.';

export class MetricWithDisplayProperty {
  constructor(metricWithDisplayProperty: Partial<MetricWithDisplayProperty>) {
    Object.assign(this, metricWithDisplayProperty);
  }
  metric: Partial<Metric>;
  telemetryDisplayProperty: TelemetryDisplayProperty;
}
