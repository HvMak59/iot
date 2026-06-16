import _ from 'lodash';
import { AssetCurrentPerformanceSource } from './asset-current-performance-source.entity';
import { FindCurrentTelemetryDto } from 'src/current-telemetry-payload/dto/find-current-telemetry.dto';

export class AssetCurrentPerformanceSourceRepo {
  constructor(
    private readonly assetCurrentPerformanceSources: AssetCurrentPerformanceSource[],
  ) {}

  getACPSsByPK() {
    return _.groupBy(this.assetCurrentPerformanceSources, (acps) =>
      new AssetCurrentPerformanceSource(acps).getKey(),
    );
  }

  getACPSByPKUsingMap(): Map<string, AssetCurrentPerformanceSource> {
    const acpsMap = new Map<string, AssetCurrentPerformanceSource>();
    for (const acps of this.assetCurrentPerformanceSources) {
      const acpsObj = new AssetCurrentPerformanceSource(acps);
      acpsMap.set(acpsObj.getKey(), acpsObj);
    }
    return acpsMap;
  }

  getACPSKeys() {
    return Object.keys(this.getACPSsByPK());
  }

  getFindCTPLDTOs() {
    const findCTPLDTOs: FindCurrentTelemetryDto[] = [];
    for (const acps of this.assetCurrentPerformanceSources) {
      const findCTPLDto: FindCurrentTelemetryDto =
        new AssetCurrentPerformanceSource(acps).getFindCTPLDTO(); /* {
        assetId: acps.assetId,
        virtualDeviceId: acps.virtualDeviceId,
        metric: {
          metricsAttributeId: acps.metricsAttributeId,
        },
      } */
      findCTPLDTOs.push(findCTPLDto);
    }
    return findCTPLDTOs;
  }
}
