import { SseService } from "src/sse/sse.service";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { winstonServerLogger } from "src/app_config/serverWinston.config";
import { AssetCurrentPerformanceSourceService } from "src/asset-current-performance-source/asset-current-performance-source.service";
import { AssetCurrentPerformanceSource } from "src/asset-current-performance-source/entities/asset-current-performance-source.entity";
import { DeviceTypeMetricsAttribute } from "src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity";
import { DeviceTypeMetricsAttributeService } from "src/device-type-metrics-attribute/device-type-metrics-attribute.service";
import { getTPLV3DTO } from "src/utils/others";
import _ from "lodash";
import { AssetCurrentPerformanceSourceRepo } from "src/asset-current-performance-source/entities/asset-current-performance-source-repo.entity";
import { CurrentTelemetryPayloadService } from "src/current-telemetry-payload/current-telemetry-payload.service";
import { CurrentTelemetryPayload } from "src/current-telemetry-payload/entities/current-telemetry-payload.entity";

@Injectable()
export class TelemetryEventsListener {

    private readonly logger = winstonServerLogger(TelemetryEventsListener.name);

    constructor(
        private readonly telemetrySseService: SseService,
        private readonly aCPSService: AssetCurrentPerformanceSourceService,
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
        private readonly deviceTypeMetricsAttributeService: DeviceTypeMetricsAttributeService,
    ) { }

    // @OnEvent('telemetry.inserted')
    async handleTelemetryInserted(payloads: CurrentTelemetryPayload[]) {
        const fnName = this.handleTelemetryInserted.name;

        if (!payloads || payloads.length === 0) {
            this.logger.error(`Empty payloads`);
            return;
        }

        const assetIds = _.uniq(payloads.map(p => p.assetId).filter(Boolean));

        for (const assetId of assetIds) {
            const aCPSs = await this.aCPSService.findByAssetID(assetId!);

            if (_.isNil(aCPSs) || aCPSs.length === 0) {
                this.logger.warn(`${fnName} No ACPS found for asset ${assetId}, skipping`);
                continue;
            }

            this.logger.debug(`${fnName} Found ${aCPSs.length} ACPS for asset ${assetId}`);

            const aCPSByKey = new Map<string, AssetCurrentPerformanceSource>();
            const deviceTypeIDSet = new Set<string>();

            for (const aCPS of aCPSs) {
                const aCPSObj = new AssetCurrentPerformanceSource(aCPS);
                aCPSByKey.set(aCPSObj.getKey(), aCPSObj);
                if (aCPSObj.virtualDevice?.deviceTypeId) {
                    deviceTypeIDSet.add(aCPSObj.virtualDevice.deviceTypeId);
                }
            }

            let dTMAByKey: { [key: string]: DeviceTypeMetricsAttribute[] } = {};
            if (deviceTypeIDSet.size > 0) {
                dTMAByKey = await this.deviceTypeMetricsAttributeService.dTMAsByByKey(
                    { csvDeviceTypeIDs: [...deviceTypeIDSet].join(',') },
                    false,
                    true,
                );
            }

            const aCPSRepo = new AssetCurrentPerformanceSourceRepo(aCPSs);
            const findCTPLDTOs = aCPSRepo.getFindCTPLDTOs();
            const cTPLs = await this.currentTelemetryPayloadService.findByMultipleConditions(findCTPLDTOs);

            const message = {
                // data: getTPLV3DTO(cTPLs, aCPSByKey, CurrentTelemetryPayload, dTMAByKey),
            };

            // this.telemetrySseService.publish(assetId!, message);
        }
    }
}



