import { PartialType } from '@nestjs/mapped-types';
import { AlertFromTelemetry } from 'src/iot-server/entities/alert-from-telemetry';
import { CurrentOpenAlert } from '../entities/current-open-alert.entity';

export class CreateCurrentOpenAlertDto extends PartialType(CurrentOpenAlert) {
  /* constructor(alertFromTelemetry: AlertFromTelemetry) {
    super();
    if (alertFromTelemetry) {
      this.alertId = alertFromTelemetry.measureName!;
      this.alertType = alertFromTelemetry.alertType;
      this.assetId = alertFromTelemetry.assetId!;
      this.deviceId = alertFromTelemetry.deviceId!;
      this.virtualDeviceId = alertFromTelemetry.virtualDeviceId!;
      this.openDateTime = alertFromTelemetry.txnCaptureTime!;
    }
  } */
}
