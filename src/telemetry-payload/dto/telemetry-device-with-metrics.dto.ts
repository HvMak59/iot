import { TelemetryDevice } from 'src/iot-server/dto/telemetry-device.dto';
import { MetricDto } from 'src/metrics/dto/metric.dto';
// import { MetricDto } from 'src/metrics/dto/metric.dto';
import { Metric } from 'src/metrics/entities/metric.entity';

export class TelemetryDeviceWithMetrics {
  public device: TelemetryDevice;
  // public metrics: Partial<Metric>[];
  public metrics: MetricDto[];

  constructor(device: TelemetryDevice, metrics: MetricDto[]) {
    this.device = device;
    this.metrics = metrics;
  }
}
