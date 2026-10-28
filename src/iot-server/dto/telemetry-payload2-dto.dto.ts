import { TelemetryDeviceWithMetrics } from 'src/telemetry-payload/dto/telemetry-device-with-metrics.dto';
import { TelemetryDisplayProperty } from '../../iot-server/dto/telemetry-display-property.dto.';
// import { TelemetryDeviceWithMetrics as TelemetryDevicesWithMetrics } from './telemetry-device-with-metrics.dto';

export class TelemetryPayload2Dto {
  //telemetryDevice: TelemetryDevice;
  //telemetryDisplayProperty?: TelemetryDisplayProperty;
  //telemetryMeasures: Metrics[];
  constructor(
    public telemetryDisplayProperty: TelemetryDisplayProperty,
    public telemetryDevicesWithMetrics: TelemetryDeviceWithMetrics[],
  ) {
    this.telemetryDevicesWithMetrics = telemetryDevicesWithMetrics;
    this.telemetryDisplayProperty = telemetryDisplayProperty;
  }
}
