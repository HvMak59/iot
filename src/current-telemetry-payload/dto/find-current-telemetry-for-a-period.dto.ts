import { FindTelemetryPayloadForAPeriod } from 'src/telemetry-payload/dto/find-telemetry-payload-for-a-period.dto';

export class FindCurrentTelemetryForAPeriod extends FindTelemetryPayloadForAPeriod {
  constructor(findCurrentTelemetryForAPeriod: FindTelemetryPayloadForAPeriod) {
    super(findCurrentTelemetryForAPeriod);
    Object.assign(this, findCurrentTelemetryForAPeriod);
  }
}
