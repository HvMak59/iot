import { SseService } from "src/sse/sse.service";
import { CurrentTelemetryPayloadService } from "../current-telemetry-payload/current-telemetry-payload.service";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CurrentTelemetryPayload } from "../current-telemetry-payload/entities/current-telemetry-payload.entity";
import { KEY_SEPARATOR } from "src/app_config/constants";
import { winstonServerLogger } from "src/app_config/serverWinston.config";
import { AssetCurrentPerformanceSourceService } from "src/asset-current-performance-source/asset-current-performance-source.service";
import { AssetCurrentPerformanceSource } from "src/asset-current-performance-source/entities/asset-current-performance-source.entity";
import { DeviceTypeMetricsAttribute } from "src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity";
import { DeviceTypeMetricsAttributeService } from "src/device-type-metrics-attribute/device-type-metrics-attribute.service";
import { getTPLV3DTO } from "src/utils/others";
import _ from "lodash";
import { AssetCurrentPerformanceSourceRepo } from "src/asset-current-performance-source/entities/asset-current-performance-source-repo.entity";

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
    // async handleTelemetryInserted(payloads: CurrentTelemetryPayload[]) {
    //     console.log("listener");
    //     if (!payloads || payloads.length === 0) return;

    //     const currentTeleMPylds = await this.currentTelemetryPayloadService.findByIds(payloads.map(s => s.id));

    //     const groupedByVd = new Map<string, CurrentTelemetryPayload[]>();

    //     for (const payload of currentTeleMPylds) {
    //         const vd = payload.virtualDeviceId;

    //         if (!vd) {
    //             this.logger.error(`virtualDevice missing`);
    //             continue;
    //         }
    //         const key = vd;

    //         if (!groupedByVd.has(key)) {
    //             groupedByVd.set(key, []);
    //         }

    //         groupedByVd.get(key)!.push(payload);
    //     }

    //     for (const [virtualDeviceId, devicePayloads] of groupedByVd.entries()) {
    //         console.log("Calling sse");
    //         this.telemetrySseService.publish(virtualDeviceId, devicePayloads);
    //     }
    // }


    private myWorking = '30-jun';
    // @OnEvent('telemetry.inserted')
    async handleTelemetryInserted(payloads: CurrentTelemetryPayload[]) {
        const fnName = this.handleTelemetryInserted.name;
        if (!payloads || payloads.length === 0) return;

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
                console.log("in acps loop");
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

            const cTPLsByVD = _.groupBy(cTPLs, (c) => c.virtualDeviceId);

            for (const [virtualDeviceId, vdCTPLs] of Object.entries(cTPLsByVD)) {

                if (!this.telemetrySseService.hasStream(assetId!, virtualDeviceId)) {
                    this.logger.error(`No stream found for virtualDevice: ${virtualDeviceId}`);
                    continue;
                }

                const vdACPSByKey = new Map<string, AssetCurrentPerformanceSource>();
                for (const [k, v] of aCPSByKey.entries()) {
                    if (v.virtualDeviceId === virtualDeviceId) {
                        vdACPSByKey.set(k, v);
                    }
                }

                const vdMessage = {
                    data: getTPLV3DTO(vdCTPLs, vdACPSByKey, CurrentTelemetryPayload, dTMAByKey),
                };

                this.telemetrySseService.publish(assetId!, vdMessage, virtualDeviceId);
            }

            if (this.telemetrySseService.hasStream(assetId!)) {
                const message = { data: getTPLV3DTO(cTPLs, aCPSByKey, CurrentTelemetryPayload, dTMAByKey) };
                this.telemetrySseService.publish(assetId!, message);
            }
            else {
                this.logger.error(`No stream found for assetId: ${assetId}`);
            }

            // const message = {
            //     data: getTPLV3DTO(cTPLs, aCPSByKey, CurrentTelemetryPayload, dTMAByKey),
            // };

            // // console.log("Asset", assetId);
            // this.telemetrySseService.publish(assetId!, message);
        }
    }


    private june30 = 'testingPending'
    // @OnEvent('telemetry.inserted')
    // async handleTelemetryInserted(payloads: CurrentTelemetryPayload[]) {
    //     const fnName = this.handleTelemetryInserted.name;
    //     if (!payloads || payloads.length === 0) return;

    //     const assetIds = _.uniq(payloads.map(p => p.assetId).filter(Boolean));

    //     for (const assetId of assetIds) {
    //         const aCPSs = await this.aCPSService.findByAssetID(assetId!);

    //         if (_.isNil(aCPSs) || aCPSs.length === 0) {
    //             this.logger.warn(`${fnName} No ACPS found for asset ${assetId}, skipping`);
    //             continue;
    //         }

    //         this.logger.debug(`${fnName} Found ${aCPSs.length} ACPS for asset ${assetId}`);

    //         const aCPSByKey = new Map<string, AssetCurrentPerformanceSource>();
    //         const deviceTypeIDSet = new Set<string>();

    //         for (const aCPS of aCPSs) {
    //             const aCPSObj = new AssetCurrentPerformanceSource(aCPS);
    //             aCPSByKey.set(aCPSObj.getKey(), aCPSObj);
    //             if (aCPSObj.virtualDevice?.deviceTypeId) {
    //                 deviceTypeIDSet.add(aCPSObj.virtualDevice.deviceTypeId);
    //             }
    //         }

    //         let dTMAByKey: { [key: string]: DeviceTypeMetricsAttribute[] } = {};
    //         if (deviceTypeIDSet.size > 0) {
    //             dTMAByKey = await this.deviceTypeMetricsAttributeService.dTMAsByByKey(
    //                 { csvDeviceTypeIDs: [...deviceTypeIDSet].join(',') },
    //                 false,
    //                 true,
    //             );
    //         }

    //         const aCPSRepo = new AssetCurrentPerformanceSourceRepo(aCPSs);
    //         const findCTPLDTOs = aCPSRepo.getFindCTPLDTOs();
    //         const cTPLs = await this.currentTelemetryPayloadService.findByMultipleConditions(findCTPLDTOs);

    //         if (!cTPLs || cTPLs.length === 0) {
    //             this.logger.debug(`${fnName} No current telemetry payloads found for asset ${assetId}`);
    //             continue;
    //         }

    //         const NO_VD = '__NONE__';
    //         const normalizeVdKey = (vdId: string | null | undefined) => vdId ?? NO_VD;

    //         const cTPLsByVD = _.groupBy(cTPLs, (c) => normalizeVdKey(c.virtualDeviceId));

    //         for (const [groupKey, vdCTPLs] of Object.entries(cTPLsByVD)) {
    //             // skip the no-VD group here; it has no specific VD stream to publish to
    //             if (groupKey === NO_VD) continue;

    //             const vdACPSByKey = new Map<string, AssetCurrentPerformanceSource>();
    //             for (const [k, v] of aCPSByKey.entries()) {
    //                 if (normalizeVdKey(v.virtualDeviceId) === groupKey) {
    //                     vdACPSByKey.set(k, v);
    //                 }
    //             }

    //             const vdMessage = {
    //                 data: getTPLV3DTO(vdCTPLs, vdACPSByKey, CurrentTelemetryPayload, dTMAByKey),
    //             };

    //             // specific publish only -> goes to assetId+vd stream
    //             this.telemetrySseService.publish(assetId!, vdMessage, groupKey);
    //         }

    //         // ---- 2. Full asset-level snapshot for the broad assetId-only stream ----
    //         const fullMessage = {
    //             data: getTPLV3DTO(cTPLs, aCPSByKey, CurrentTelemetryPayload, dTMAByKey),
    //         };

    //         // broad publish only -> goes to assetId-only stream
    //         this.telemetrySseService.publish(assetId!, fullMessage);
    //     }


    // }

    private wokring = '18/06';
    // @OnEvent('telemetry.inserted')
    // async handleTelemetryInserted(payloads: CurrentTelemetryPayload[]) {
    //     console.log("listener");
    //     const fnName = this.handleTelemetryInserted.name;
    //     if (!payloads || payloads.length === 0) return;

    //     const currentTeleMPylds = await this.currentTelemetryPayloadService.findByIds(
    //         payloads.map(s => s.id)
    //     );

    //     // const groupedByAsset = new Map<string, CurrentTelemetryPayload[]>();

    //     // for (const payload of currentTeleMPylds) {
    //     //     const assetId = payload.assetId;

    //     //     if (!assetId) {
    //     //         this.logger.error(`assetId missing on payload ${payload.id}`);
    //     //         continue;
    //     //     }

    //     //     if (!groupedByAsset.has(assetId)) {
    //     //         groupedByAsset.set(assetId, []);
    //     //     }

    //     //     groupedByAsset.get(assetId)!.push(payload);
    //     // }

    //     const groupedByAsset = _.groupBy(currentTeleMPylds, (payload) => payload.assetId);

    //     for (const [assetId, assetPayloads] of Object.entries(groupedByAsset)) {
    //         const aCPSs = await this.aCPSService.findByAssetID(assetId);

    //         if (_.isNil(aCPSs)) {
    //             this.logger.warn(
    //                 `${fnName} No ACPS found for asset ${assetId}, skipping sending CTPL`,
    //             );
    //             continue;
    //         }
    //         else {
    //             this.logger.debug(
    //                 `${fnName} Found ${aCPSs.length} ACPS for asset ${assetId}`,
    //             );

    //             const aCPSByKey = new Map<string, AssetCurrentPerformanceSource>();
    //             const deviceTypeIDSet = new Set<string>();

    //             for (const aCPS of aCPSs) {
    //                 const aCPSObj = new AssetCurrentPerformanceSource(aCPS);
    //                 aCPSByKey.set(aCPSObj.getKey(), aCPSObj);
    //                 if (aCPSObj.virtualDevice?.deviceTypeId) {
    //                     deviceTypeIDSet.add(aCPSObj.virtualDevice.deviceTypeId);
    //                 }
    //             }

    //             let dTMAByKey: { [key: string]: DeviceTypeMetricsAttribute[] } = {};
    //             if (deviceTypeIDSet.size > 0) {
    //                 dTMAByKey = await this.deviceTypeMetricsAttributeService.dTMAsByByKey(
    //                     {
    //                         csvDeviceTypeIDs: [...deviceTypeIDSet].join(',')
    //                     },
    //                     false,
    //                     true,
    //                 );
    //             }

    //             const aCPSRepo = new AssetCurrentPerformanceSourceRepo(aCPSs);
    //             const findCTPLDTOs = aCPSRepo.getFindCTPLDTOs();
    //             const cTPLs = await this.currentTelemetryPayloadService.findByMultipleConditions(findCTPLDTOs);

    //             const message = {
    //                 data: getTPLV3DTO(cTPLs, aCPSByKey, CurrentTelemetryPayload, dTMAByKey),
    //             };


    //             this.telemetrySseService.publish(assetId, message);
    //         }
    //     }
    // }
}




