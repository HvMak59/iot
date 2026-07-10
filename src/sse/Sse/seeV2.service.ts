import { Injectable, MessageEvent } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import _ from 'lodash';
import { Observable, ReplaySubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { AssetCurrentPerformanceSourceService } from 'src/asset-current-performance-source/asset-current-performance-source.service';
import { AssetCurrentPerformanceSourceRepo } from 'src/asset-current-performance-source/entities/asset-current-performance-source-repo.entity';
import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';
import { CurrentTelemetryPayloadService } from 'src/current-telemetry-payload/current-telemetry-payload.service';
import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
import { DeviceTypeMetricsAttributeService } from 'src/device-type-metrics-attribute/device-type-metrics-attribute.service';
import { DeviceTypeMetricsAttribute } from 'src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { getTPLV3DTO } from 'src/utils/others';

@Injectable()
export class SseService {

    private readonly logger = winstonServerLogger(SseService.name);
    private streams = new Map<string, ReplaySubject<MessageEvent>>();

    constructor(
        private readonly aCPSService: AssetCurrentPerformanceSourceService,
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
        private readonly deviceTypeMetricsAttributeService: DeviceTypeMetricsAttributeService,
    ) { }

    async subscribe(assetId: string, virtualDeviceId?: string): Promise<Observable<MessageEvent>> {
        const key = virtualDeviceId
            ? this.buildKey(assetId, virtualDeviceId)
            : this.buildKey(assetId);

        let stream = this.streams.get(key);
        if (!stream) {
            stream = new ReplaySubject<MessageEvent>(1);
            this.streams.set(key, stream);

            await this.handleTelemetryInserted([{ assetId } as CurrentTelemetryPayload]);
        }

        this.logger.debug(`Client subscribed: ${key}`);

        return stream.pipe(
            finalize(() => {
                this.logger.debug(`Client disconnected: ${key}`);
                if (!stream!.observed) {
                    this.streams.delete(key);
                    this.logger.debug(`Removed stream: ${key}`);
                }
            }),
        );
    }

    publish(assetId: string, message: MessageEvent, virtualDeviceId?: string) {
        if (virtualDeviceId) {
            const assetVDKey = this.buildKey(assetId, virtualDeviceId);
            const assetVDStream = this.streams.get(assetVDKey);

            if (assetVDStream) {
                this.logger.debug(`Publishing to stream: ${assetVDKey}`);
                assetVDStream.next(message);
            }
            else {
                this.logger.debug(`No stream found for this virtualDevice ${virtualDeviceId}`);
            }
            return;
        }

        const assetKey = this.buildKey(assetId);
        const assetStream = this.streams.get(assetKey);
        if (assetStream) {
            this.logger.debug(`Publishing to stream: ${assetStream}`);
            assetStream.next(message);
        }
        else {
            this.logger.debug(`No stream found for assetId: ${assetId}`);
        }
    }

    private buildKey(assetId: string, virtualDeviceId?: string): string {
        return virtualDeviceId ?
            assetId + KEY_SEPARATOR + virtualDeviceId
            :
            assetId;
    }

    hasStream(assetId: string, virtualDeviceId?: string): boolean {
        const key = virtualDeviceId
            ? this.buildKey(assetId, virtualDeviceId)
            : this.buildKey(assetId);

        return this.streams.has(key);
    }

    // added listener here, no need for separate istener
    @OnEvent('telemetry.inserted')
    async handleTelemetryInserted(payloads: CurrentTelemetryPayload[]) {
        const fnName = this.handleTelemetryInserted.name;
        if (!payloads || payloads.length === 0) return;

        const assetIds = _.uniq(payloads.map(p => p.assetId).filter(Boolean));

        for (const assetId of assetIds) {
            const aCPSs = await this.aCPSService.findByAssetID(assetId!);

            if (_.isNil(aCPSs) || aCPSs.length === 0) {
                this.logger.debug(`${fnName} No ACPS found for asset ${assetId}, skipping`);
                continue;
            }

            this.logger.debug(`${fnName} Found ${aCPSs.length} ACPS for asset ${assetId}`);

            const aCPSByKey = new Map<string, AssetCurrentPerformanceSource>();
            const aCPSByVD = new Map<string, Map<string, AssetCurrentPerformanceSource>>();
            const deviceTypeIDSet = new Set<string>();

            for (const aCPS of aCPSs) {
                const aCPSObj = new AssetCurrentPerformanceSource(aCPS);
                const key = aCPSObj.getKey();
                const vdId = aCPSObj.virtualDeviceId!;

                aCPSByKey.set(key, aCPSObj);

                if (!aCPSByVD.has(vdId)) {
                    aCPSByVD.set(vdId, new Map());
                }
                aCPSByVD.get(vdId)!.set(key, aCPSObj);
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

            const cTPLsByVD = _.groupBy(cTPLs, (c) => c.virtualDeviceId);

            for (const [virtualDeviceId, vdCTPLs] of Object.entries(cTPLsByVD)) {

                if (!this.hasStream(assetId!, virtualDeviceId)) {
                    this.logger.debug(`No stream found for virtualDevice: ${virtualDeviceId}`);
                    continue;
                }
                const vdACPSByKey = aCPSByVD.get(virtualDeviceId) ?? new Map();

                const vdMessage = {
                    // data: getTPLV3DTO(vdCTPLs, vdACPSByKey, CurrentTelemetryPayload, dTMAByKey),
                };

                // this.publish(assetId!, vdMessage, virtualDeviceId);
            }

            if (this.hasStream(assetId!)) {
                // const message = { data: getTPLV3DTO(cTPLs, aCPSByKey, CurrentTelemetryPayload, dTMAByKey) };
                // this.publish(assetId!, message);
            }
            else {
                this.logger.debug(`No stream found for assetId: ${assetId}`);
            }
        }
    }
}