import _ from 'lodash';
import { FindMetricDto } from 'src/metrics/dto/find-metric.dto';
import { IsNull } from 'typeorm';
import { CreateCurrentTelemetryDto } from '../dto/create-current-telemetry.dto';
import { FindCurrentTelemetryDto } from '../dto/find-current-telemetry.dto';
import { CurrentTelemetryPayload } from './current-telemetry-payload.entity';
import { TelemetryDevice } from 'src/iot-server/dto/telemetry-device.dto';
import { Metric } from 'src/metrics/entities/metric.entity';
import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';
import { DeviceTypeMetricsAttribute } from 'src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { CurrentTelemetryPayloadDTOV2 } from '../dto/current-telemetry-payload-v2.dto';
import { getMetricDTO, getTPLV3DTO } from 'src/utils/others';
import { TelemetryPayloadV3DTO } from 'src/iot-server/dto/telemetry-payload-v3.dto';

export class CurrentTelemetryPayloadsRepo {
  currentTelemetryPayloads: (
    | CurrentTelemetryPayload
    | CreateCurrentTelemetryDto
  )[];

  constructor(
    currentTelemetryPayloads: (
      | CurrentTelemetryPayload
      | CreateCurrentTelemetryDto
    )[],
  ) {
    this.currentTelemetryPayloads = currentTelemetryPayloads;
  }

  getCurrentTelemetryPayloads(): (
    | CurrentTelemetryPayload
    | CreateCurrentTelemetryDto
  )[] {
    return this.currentTelemetryPayloads;
  }

  getCurrentTelemetryPayloadsCount(): number {
    return this.currentTelemetryPayloads.length;
  }

  getCTPLByAssetIdVDeviceIdMAId(): Map<
    string,
    CreateCurrentTelemetryDto | CurrentTelemetryPayload
  > {
    const ctplMap = new Map<
      string,
      CreateCurrentTelemetryDto | CurrentTelemetryPayload
    >();
    for (const ctpl of this.currentTelemetryPayloads) {
      const ctplObj = new CurrentTelemetryPayload(ctpl);
      ctplMap.set(ctplObj.getKey(), ctpl);
    }
    return ctplMap;
  }

  getSearchCriterias() {
    const ctplSearchCriterias: FindCurrentTelemetryDto[] = [];
    for (const ctpl of this.currentTelemetryPayloads) {
      // Create a search object for each telemetry payload
      const metricSearchCriteria: FindMetricDto = {
        metricsAttributeId: ctpl.metric?.metricsAttributeId,
      };
      const ctplSearchCriteria: FindCurrentTelemetryDto = {
        assetId: ctpl.assetId,
        virtualDeviceId: ctpl.virtualDeviceId ?? IsNull(),
        metric: metricSearchCriteria,
      };
      ctplSearchCriterias.push(ctplSearchCriteria);
      // Do something with the searchObject, like adding it to an array
    }
    return ctplSearchCriterias;
  }

  getScope(): Record<string, string> {
    const scope: Record<string, string> = {};
    for (const ctpl of this.currentTelemetryPayloads) {
      const metricId = ctpl.metric?.metricsAttributeId;
      if (metricId) {
        scope[metricId] = ctpl.metric?.measure ?? '';
      }
    }
    return scope;
  }

  getCTPLDTOsV2() {
    const cTPLDTOsV2: CurrentTelemetryPayloadDTOV2[] = [];
    const cTPLsByPK = _.groupBy(this.currentTelemetryPayloads, (ctpl) =>
      new CurrentTelemetryPayload(ctpl).getVDKey(),
    );
    for (const [pk, cTPLs] of Object.entries(cTPLsByPK)) {
      const telemetryDevice = TelemetryDevice.createFromTelemetry(cTPLs[0]);
      const metrics: Partial<Metric>[] = [];
      for (const cTPL of cTPLs) {
        metrics.push(cTPL.metric!);
      }
      cTPLDTOsV2.push(
        new CurrentTelemetryPayloadDTOV2({ telemetryDevice, metrics }),
      );
    }
    return cTPLDTOsV2;
  }

  getCTPLDTOV3(
    aCPSByKey: Map<string, AssetCurrentPerformanceSource>,
    //aCPSByKey: _.Dictionary<AssetCurrentPerformanceSource[]>,
    dTMAByKey: _.Dictionary<DeviceTypeMetricsAttribute[]>,
  ): TelemetryPayloadV3DTO[] {
    return getTPLV3DTO(   // this is in others 
      this.currentTelemetryPayloads as CurrentTelemetryPayload[],
      aCPSByKey,
      CurrentTelemetryPayload,
      dTMAByKey,
    );
  }

  private ae = 4;

  // createTelemetyDevicesAndMetrics() {
  //   const telemetryDeviceByVDId: Map<string, TelemetryDevice> = new Map();
  //   const metricsByVDId: Map<string, Partial<Metric>[]> = new Map();
  //   for (const ctpl of this.currentTelemetryPayloads) {
  //     if (telemetryDeviceByVDId.has(ctpl.virtualDeviceId!)) {
  //       const metricDTO = new Metric(ctpl.metric!).getMetricDTO();
  //       metricsByVDId.get(ctpl.virtualDeviceId!)?.push(metricDTO);
  //     } else {
  //       const telemetryDevice = TelemetryDevice.createFromTelemetry(ctpl);
  //       const metricDTO = new Metric(ctpl.metric!).getMetricDTO();
  //       const virtualDeviceId = ctpl.virtualDeviceId;
  //       if (virtualDeviceId) {
  //         telemetryDeviceByVDId.set(virtualDeviceId, telemetryDevice);
  //         if (metricsByVDId.has(virtualDeviceId)) {
  //           metricsByVDId.get(virtualDeviceId)?.push(metricDTO);
  //         } else {
  //           metricsByVDId.set(virtualDeviceId, [metricDTO]);
  //         }
  //       } else {
  //         throw new Error(
  //           `Virtual device id is missing for telemetry payload with asset id : ${ctpl.assetId} and metric id : ${ctpl.metric?.metricsAttributeId}`,
  //         );
  //       }
  //     }
  //     if (telemetryDeviceByVDId.size > 0) {
  //       const telemetryDevicesWithMetrics: TelemetryDeviceWithMetrics[] = [];
  //       for (const [vDId, device] of telemetryDeviceByVDId.entries()) {
  //         const metrics = metricsByVDId.get(vDId);
  //         const telemetryDeviceWithMetrics: TelemetryDeviceWithMetrics =
  //           new TelemetryDeviceWithMetrics(device, metrics ?? []);
  //         telemetryDevicesWithMetrics.push(telemetryDeviceWithMetrics);
  //       }
  //       return telemetryDevicesWithMetrics;
  //     } else {
  //       throw new Error(
  //         `Cannot create telemetry devices with metrics as virtual device id is missing for all telemetry payloads`,
  //       );
  //     }

  //     /* if (this.currentTelemetryPayloads.length > 0) {
  //     const telemetryDevice = TelemetryDevice.createFromTelemetry(
  //       this.currentTelemetryPayloads[0],
  //     );
  //     const telemetryDisplayProperty: TelemetryDisplayProperty = {
  //       metricsAttributeId:
  //         this.currentTelemetryPayloads[0].metric?.metricsAttributeId!,
  //       frequency: this.currentTelemetryPayloads[0].metric!.frequency,
  //       displayName:
  //         this.currentTelemetryPayloads[0].metric?.metricsAttributeId!,
  //       unit: this.currentTelemetryPayloads[0].metric?.unit,
  //     };

  //     const metricDTOs: Array<Partial<MetricDto>> = [];
  //     this.currentTelemetryPayloads.map((telemetryPayload) =>
  //       //metricDTOs.push(new MetricDto(telemetryPayload.metric)),
  //       metricDTOs.push(getMetricDTO(telemetryPayload.metric!)),
  //     );

  //     const telemetryPayloadDto = {
  //       telemetryDevice,
  //       telemetryDisplayProperty,
  //       metrics: metricDTOs,
  //     };
  //     return telemetryPayloadDto;
  //   } else {
  //     throw new Error(
  //       `Cannot create telemetry payload dto from empty telemetry payloads array : ${JSON.stringify(
  //         this.currentTelemetryPayloads,
  //       )}`,
  //     );
  //   } */
  //   }
  // }

  // createDevicesWithMetrics() {
  //   const telemetryDeviceByVDId: Map<string, TelemetryDevice> = new Map();
  //   const cTPLsByVDId: Map<string, CurrentTelemetryPayload[]> = new Map();
  //   for (const ctpl of this.currentTelemetryPayloads) {
  //     const virtualDeviceId = ctpl.virtualDeviceId;
  //     if (virtualDeviceId) {
  //       if (telemetryDeviceByVDId.has(virtualDeviceId)) {
  //         cTPLsByVDId
  //           .get(virtualDeviceId)
  //           ?.push(ctpl as CurrentTelemetryPayload);
  //       } else {
  //         telemetryDeviceByVDId.set(
  //           virtualDeviceId,
  //           TelemetryDevice.createFromTelemetry(ctpl),
  //         );
  //         cTPLsByVDId.set(virtualDeviceId, [ctpl as CurrentTelemetryPayload]);
  //       }
  //     } else {
  //     }
  //   }
  //   const telemetryDevicesWithMetrics: TelemetryDeviceWithMetrics[] = [];
  //   //if (cTPLsByVDId.size > 0) {
  //   for (const [vDId, ctpls] of cTPLsByVDId.entries()) {
  //     const telemetryDevice = telemetryDeviceByVDId.get(vDId);
  //     const telemetryDeviceWithMetrics: TelemetryDeviceWithMetrics =
  //       new TelemetryDeviceWithMetrics(
  //         telemetryDevice!,
  //         ctpls.map((ctpl) => getMetricDTO(ctpl.metric)),
  //       );
  //     telemetryDevicesWithMetrics.push(telemetryDeviceWithMetrics);
  //   }
  //   //}
  //   return telemetryDevicesWithMetrics;
  // }
}
