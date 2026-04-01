import { PartialType } from '@nestjs/mapped-types';
import { TelemetryPayload } from '../entities/telemetry-payload.entity';

export class FindTelemetryPayload extends PartialType(TelemetryPayload) {
  /* assetId: string;
  isDeviceGroup?: boolean;
  virtualDeviceId: string;*/
  metricsAttributeId: string;
  txnCaptureTimeInEpoch?: string | number;

  constructor(findTelemetryPayload: Partial<FindTelemetryPayload>) {
    super(findTelemetryPayload);
    Object.assign(this, findTelemetryPayload);
  }
}
