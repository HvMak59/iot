import { PartialType, PickType } from '@nestjs/mapped-types';
// import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';
import {
  CurrentTelemetryPayload,
  CurrentTelemetryPayload as TelemetryPayload,
} from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
// import { Device } from 'src/device/entities/device.entity';
// import { FindAssetPerformanceTelemetry } from './find-asset-performance-telemetry';

//export class TelemetryDevice extends PickType(CurrentTelemetryPayload, ['assetId', 'source', 'instanceId', 'virtualInstanceId']) {
export class TelemetryDevice /*extends PartialType(Device)*/ {
  //isDeviceGroup: boolean;
  assetId: string;
  virtualDeviceId: string; // added by me 
  id: string; // added by me 
  constructor(telemetryDevice: Partial<TelemetryDevice>) {
    // super();
    Object.assign(this, telemetryDevice);
  }

  // static createFromFindAssetPerformanceTelemetry(
  //   findAssetPerformanceTelemetry: FindAssetPerformanceTelemetry,
  // ) {
  //   return new TelemetryDevice({
  //     assetId: findAssetPerformanceTelemetry.assetId,
  //     //isDeviceGroup: findAssetPerformanceTelemetry.isDeviceGroup,
  //     virtualDeviceId: findAssetPerformanceTelemetry.virtualDeviceId,
  //   });
  // }
  // static createFromAssetCurrentPerformanceSource(
  //   assetCurrPerfSrc: Partial<AssetCurrentPerformanceSource>,
  // ) {
  //   /* Pending virtual device id changes */
  //   return new TelemetryDevice({
  //     assetId: assetCurrPerfSrc.assetId,
  //     //isDeviceGroup: assetCurrPerfSrc.isDeviceGroup, */
  //     virtualDeviceId: assetCurrPerfSrc.virtualDeviceId,
  //   });
  // }
  static createFromTelemetry(
    telemetry: Partial<TelemetryPayload> | Partial<CurrentTelemetryPayload>,
  ) {
    return new TelemetryDevice({
      assetId: telemetry.assetId,
      //isDeviceGroup: currentTelemetryPayload.isDeviceGroup, */
      virtualDeviceId: telemetry.virtualDeviceId,
      id: telemetry.deviceId,
    });
  }

  /* static createFromCurrentTelemetryPayload(
    currentTelemetryPayload: Partial<TelemetryPayload>,
  ) {
    return new TelemetryDevice({
      assetId: currentTelemetryPayload.virtualDevice?.assetId,
      //isDeviceGroup: currentTelemetryPayload.isDeviceGroup,
      virtualDeviceId: currentTelemetryPayload.virtualDeviceId,
      id: currentTelemetryPayload.deviceId,
    });
  }

  static createFromTelemetryPayload(
    telemetryPayload: Partial<TelemetryPayload>,
  ) {
    return new TelemetryDevice({
      assetId: telemetryPayload.virtualDevice?.assetId,
      //isDeviceGroup: telemetryPayload.isDeviceGroup,
      virtualDeviceId: telemetryPayload.virtualDeviceId,
      id: telemetryPayload.deviceId,
    });
  } */
}
