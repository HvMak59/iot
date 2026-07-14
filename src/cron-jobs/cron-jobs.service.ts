import { Injectable } from '@nestjs/common';
import { CurrentTelemetryPayloadService } from 'src/current-telemetry-payload/current-telemetry-payload.service';
import { InputAlert2Dto } from 'src/alert/dto/input-alert2.dto';
import { IotServerService } from 'src/iot-server/iot-server.service';
import { RMU_OFFLINE, RMU_OFFLINE_THRESHOLD } from 'src/app_config/constants';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PeriodTelemetryPayloadAuditService } from 'src/period-telemetry-payload-audit/period-telemetry-payload-audit.service';
import { TelemetryPayloadService } from 'src/telemetry-payload/telemetry-payload.service';
import { VirtualDeviceService } from 'src/virtual-device/virtual-device.service';
import { MetricsFrequency } from 'src/common';
import { VirtualDeviceGroupService } from 'src/virtual-device-group/virtual-device-group.service';
import { GroupMetricsAttributeAggregationService } from 'src/group-metrics-attribute-aggregation/group-metrics-attribute-aggregation.service';
// import { AggregationService } from './aggregation.service';

@Injectable()
export class CronJobsService {
    private isRunning = false;   // ← add this line

    constructor(
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
        private readonly iotServerService: IotServerService,
        private readonly virtualDeviceService: VirtualDeviceService,
        // private readonly virtualDeviceGroupService: VirtualDeviceGroupService,
        // private readonly groupMetricsAttributeAggregationService: GroupMetricsAttributeAggregationService
        // private readonly aggregationService: AggregationService
    ) { }


    // */2   *   *   *   *
    // │     │   │   │   │
    // │     │   │   │   └─ Day of week
    // │     │   │   └───── Month
    // │     │   └───────── Day of month
    // │     └───────────── Hour
    // └─────────────────── Minute

    // @Cron('*/20 * * * *')  // every 20 minutes
    async createRmuOfflineAlert() {
        const rmus = await this.currentTelemetryPayloadService.findLatestRmuForOfflineCheck();

        const cutoffTime = new Date(Date.now() - RMU_OFFLINE_THRESHOLD);

        const byAsset = new Map<string, {
            csvVirtualDeviceIDs: string[];
            arrivedAlerts2: InputAlert2Dto[];
        }>();

        for (const rmu of rmus) {
            if (!rmu.assetId || !rmu.virtualDeviceId) continue;

            let group = byAsset.get(rmu.assetId);

            if (!group) {
                group = {
                    csvVirtualDeviceIDs: [],
                    arrivedAlerts2: [],
                };
                byAsset.set(rmu.assetId, group);
            }

            // add all RMUs, offline + online
            group.csvVirtualDeviceIDs.push(rmu.virtualDeviceId);

            const lastTime = new Date(rmu.metric?.txnCaptureTime);

            const isOffline = lastTime < cutoffTime;

            if (isOffline) {
                group.arrivedAlerts2.push(
                    new InputAlert2Dto({
                        alertId: RMU_OFFLINE,   // export const RMU_OFFLINE = 'rmuOffline';
                        assetId: rmu.assetId,
                        deviceId: rmu.deviceId,
                        virtualDeviceId: rmu.virtualDeviceId,
                        deviceModelId: rmu.device?.deviceModelId,
                        openDateTime: Date.now(),
                    } as any),
                );
            }
        }

        const results = [];

        for (const [assetId, group] of byAsset.entries()) {
            const result = await this.iotServerService.manageAlerts2(
                '',
                assetId,
                group.csvVirtualDeviceIDs.join(','),
                group.arrivedAlerts2,
                Date.now(),
                RMU_OFFLINE, // we have added one optional field in managealert input, because 
                // wihout this, it was closing other alerts for same asset if rmu comes online  
            );
            results.push({ assetId, ...result });
        }

        return results;
    }

    // @Cron('0 0 * * *')  // every day at midnight
    // async processMaxTelemetryAggregation(
    // inputDate: string,
    // metricsFrequency: string,
    // isCalculationForced: boolean
    // ) {
    //     const periodTMPyld =
    //         await this.periodTelemetryPayloadAuditService.findPeriodTelemetryRecordSetA(
    //             inputDate,
    //             metricsFrequency,
    //             isCalculationForced,
    //         );

    //     const telemetryPyld =
    //         await this.telemetryPayloadService.findTelemetryPayloadRecordSetB(
    //             periodTMPyld,
    //         );

    //     const recordSetC =
    //         await this.virtualDeviceService.findRecordSetC(periodTMPyld);

    //     const maxMetrics =
    //         await this.periodTelemetryPayloadAuditService.findMaxTelemetryValueRecordSetD(periodTMPyld);

    //     const recordSetE =
    //         await this.periodTelemetryPayloadAuditService.prepareRecordSetE(telemetryPyld, maxMetrics);

    //     return {
    //         periodTMPyld,
    //         telemetryPyld,
    //         maxMetrics,
    //         recordSetE
    //     };
    // }

    @Cron('0 0 * * *')  // every day at midnight
    async processMaxTelemetryAggregation(
        inputDate: string,
        metricsFrequency: MetricsFrequency,
        isCalculationForced: boolean
    ) {
        return await this.iotServerService.processMaxTelemetryAggregation(inputDate, metricsFrequency, isCalculationForced);
    }


    // async aggregateTelemetry() {

    //     const parents = await this.virtualDeviceService.findPendingParents();

    //     if (!parents.length)
    //         return;

    //     const children =
    //         await this.virtualDeviceService.findChildren(
    //             parents.map(x => x.id)
    //         );

    //     // const telemetry =
    //     //     await this.currentTelemetryPayloadService.findLatestTelemetry(
    //     //         children.map(x => x.id)
    //     //     );

    //     const groups =
    //         await this.virtualDeviceGroupService.findByVirtualDeviceIDs(
    //             children.map(x => x.id)
    //         );

    //     const rules =
    //         await this.groupMetricsAttributeAggregationService.findByGroupIDs(
    //             groups.map(x => x.groupId)
    //         );

    //     const dto = [];

    //     for (const parent of parents) {

    //         // const result =
    //         //     await this.aggregateParent(
    //         //         parent,
    //         //         children,
    //         //         telemetry,
    //         //         groups,
    //         //     rules
    //         // );

    //         // dto.push(...result);

    //     }

    //     // await this.currentTelemetryPayloadService.createV2(dto);

    //     await this.virtualDeviceService.markAggregationCompleted(
    //         parents.map(x => x.id)
    //     );

    // }


    private aggregationn = 'On Interval';
    // @Cron()
    async aggregation() {
        const parentVdsNeedsAggregation =
            await this.virtualDeviceService.findVirtualDeviceNeedsAggregation();

        // rest aggregation logic....


    }
}

