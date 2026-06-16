import { StringNullableChain } from 'lodash';
// import { FindAssetTypeCurrentPerformanceSourceDto } from 'src/asset-type-current-performance-source/dto/find-asset-type-current-performance-source.dto';
import { AssetTypeCurrentPerformanceSource } from 'src/asset-type-current-performance-source/entities/asset-type-current-performance-source.entity';
import { FindAssetPerformanceTelemetry } from 'src/iot-server/dto/find-asset-performance-telemetry';
import { FindOptionsWhere } from 'typeorm';
import { DisplayPriority as DisplayPriority } from 'src/utils/enums';

export class FindAssetCurrentPerformanceSourceDto {
  assetId: string;
  displayPriority?: DisplayPriority;
  virtualDeviceId?: string;
  metricsAttributeId?: string;
  constructor(
    ...args: [
      findAssetCurrentPerformanceSourceDto: Partial<FindAssetPerformanceTelemetry>,
    ]
  ) {
    if (args.length > 0) {
      this.assetId = args[0].assetId!;
      if (args[0].displayPriority != undefined) {
        this.displayPriority = args[0].displayPriority;
      }
      if (args[0].virtualDeviceId) {
        this.virtualDeviceId = args[0].virtualDeviceId;
      }
      args[0].metricsAttributeId
        ? (this.metricsAttributeId = args[0].metricsAttributeId)
        : null;
    } else {
      Object.assign(this, {});
    }
  }
}
