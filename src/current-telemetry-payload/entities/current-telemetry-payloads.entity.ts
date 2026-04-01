// import _ from 'lodash';
import { FindMetricDto } from 'src/metrics/dto/find-metric.dto';
import { IsNull } from 'typeorm';
import { CreateCurrentTelemetryDto } from '../dto/create-current-telemetry.dto';
import { FindCurrentTelemetryDto } from '../dto/find-current-telemetry.dto';
import { CurrentTelemetryPayload } from './current-telemetry-payload.entity';

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
        // assetId: ctpl.assetId,
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
}
