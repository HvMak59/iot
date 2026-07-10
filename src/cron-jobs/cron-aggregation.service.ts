// import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import * as _ from 'lodash';

// import { VirtualDevice } from '../virtual-device/entities/virtual-device.entity';
// import { CurrentTelemetryPayload } from '../current-telemetry-payload/entities/current-telemetry-payload.entity';
// // import { Metric } from '../current-telemetry-payload/entities/metric.entity';
// import { AggStrategy } from '../utils/enums';

// import { VirtualDeviceService } from '../virtual-device/virtual-device.service';
// import { VirtualDeviceGroupService } from '../virtual-device-group/virtual-device-group.service';
// import { GroupMetricsAttributeAggregationService } from '../group-metrics-attribute-aggregation/group-metrics-attribute-aggregation.service';
// import { CurrentTelemetryPayloadService } from '../current-telemetry-payload/current-telemetry-payload.service';
// import { TelemetryPayloadService } from '../telemetry-payload/telemetry-payload.service';
// import { MetricsAttributeAggregation } from '../metrics-attribute-aggregation/entities/metrics-attribute-aggregation.entity';

// @Injectable()
// export class AggregationCronService {

//     private readonly logger = new Logger(AggregationCronService.name);

//     private readonly WITHIN_20_MINS_MS = 20 * 60 * 1000;

//     constructor(
//         private readonly virtualDeviceService: VirtualDeviceService,
//         private readonly virtualDeviceGroupService: VirtualDeviceGroupService,
//         private readonly groupMetricsAttributeAggregationService: GroupMetricsAttributeAggregationService,
//         private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
//         private readonly telemetryPayloadService: TelemetryPayloadService,
//     ) { }

//     @Cron(CronExpression.EVERY_5_MINUTES)
//     async processScheduledAggregation(): Promise<void> {

//         const fnName = 'processScheduledAggregation';

//         this.logger.log(`${fnName} : Started`);

//         const parents = await this.virtualDeviceService.findParentsNeedingAggregation();

//         if (!parents.length) {

//             this.logger.log(`${fnName} : Nothing pending`);

//             return;
//         }

//         this.logger.log(`${fnName} : ${parents.length} parents found`);

//         for (const parent of parents) {

//             try {
//                 // uncomment this
//                 // await this.processParent(parent);

//             } catch (error) {

//                 this.logger.error(
//                     `${fnName} : Parent ${parent.id} failed`,
//                     error.stack,
//                 );

//                 await this.virtualDeviceService.markNeedsAggregation(
//                     parent.id,
//                 );

//             }

//         }

//         this.logger.log(`${fnName} : Finished`);

//     }


//     // uncomment this
//     // private async processParent(
//     //     parent: VirtualDevice,
//     // ) {

//     //     const fnName = `processParent(${parent.id})`;

//     //     const claimed =
//     //         await this.virtualDeviceService.claimForAggregation(
//     //             parent.id,
//     //         );

//     //     if (!claimed) {

//     //         this.logger.debug(`${fnName} already processing`);

//     //         return;

//     //     }

//     //     const children =
//     //         await this.virtualDeviceService.getChildren(
//     //             parent.id,
//     //         );

//     //     if (!children.length) {

//     //         this.logger.debug(`${fnName} no children`);

//     //         return;

//     //     }

//     //     const childIds = children.map(x => x.id);

//     //     const virtualDeviceGroups =
//     //         await this.virtualDeviceGroupService.findByVirtualDeviceIds(
//     //             childIds,
//     //         );

//     //     if (!virtualDeviceGroups.length) {

//     //         this.logger.debug(`${fnName} no groups`);

//     //         await this.virtualDeviceService.clearAggregationPending(parent.id);

//     //         return;

//     //     }

//     //     const groupedVirtualDeviceGroups =
//     //         this.virtualDeviceGroupService.groupByGroup(
//     //             virtualDeviceGroups,
//     //         );

//     //     const groupIds = [...groupedVirtualDeviceGroups.keys()];

//     //     const groupRules =
//     //         await this.groupMetricsAttributeAggregationService
//     //             .findByGroupIds(groupIds);

//     //     if (!groupRules.length) {

//     //         await this.virtualDeviceService.clearAggregationPending(parent.id);

//     //         return;

//     //     }

//     //     const rulesByGroup =
//     //         new Map<string, MetricsAttributeAggregation[]>();

//     //     for (const rule of groupRules) {

//     //         const list =
//     //             rulesByGroup.get(rule.groupId) ?? [];

//     //         list.push(rule.metricsAttributeAggregation);

//     //         rulesByGroup.set(
//     //             rule.groupId,
//     //             list,
//     //         );

//     //     }


//     //     const attributeIds =
//     //         _.uniq(
//     //             groupRules.map(
//     //                 x => x.metricsAttributeAggregation.metricsAttributeId,
//     //             ),
//     //         );

//     //     //---------------------------------------------
//     //     // Current Telemetry
//     //     //---------------------------------------------

//     //     const currentTelemetry =
//     //         await this.currentTelemetryPayloadService
//     //             .getLatestTelemetry(
//     //                 childIds,
//     //                 attributeIds,
//     //             );

//     //     const telemetryMap =
//     //         new Map<string, CurrentTelemetryPayload>();

//     //     for (const payload of currentTelemetry) {

//     //         telemetryMap.set(

//     //             `${payload.virtualDeviceId}_${payload.metric.metricsAttributeId}`,

//     //             payload,

//     //         );

//     //     }

//     //     //---------------------------------------------
//     //     // Aggregate Every Group
//     //     //---------------------------------------------

//     //     const currentPayloads: CurrentTelemetryPayload[] = [];

//     //     const historyPayloads = [];

//     //     for (const [groupId, devices] of groupedVirtualDeviceGroups) {

//     //         const childIdsOfGroup =
//     //             devices.map(x => x.virtualDeviceId);

//     //         const rules =
//     //             rulesByGroup.get(groupId) ?? [];

//     //         for (const rule of rules) {

//     //             const result =
//     //                 this.aggregateForAttribute(

//     //                     childIdsOfGroup,

//     //                     rule,

//     //                     telemetryMap,

//     //                     Date.now(),

//     //                 );

//     //             if (!result) {

//     //                 continue;

//     //             }

//     //             const payload =
//     //                 new CurrentTelemetryPayload({

//     //                     assetId: parent.assetId,

//     //                     virtualDeviceId: parent.id,

//     //                     metric: {

//     //                         metricsAttributeId:
//     //                             rule.metricsAttributeId,

//     //                         measure:
//     //                             result.value.toString(),

//     //                         txnCaptureTime:
//     //                             result.latestTxnCaptureTime,

//     //                     } as Metric,

//     //                 });

//     //             currentPayloads.push(payload);

//     //             historyPayloads.push(payload);

//     //         }

//     //     }

//     //     //---------------------------------------------
//     //     // Save
//     //     //---------------------------------------------

//     //     if (currentPayloads.length) {

//     //         await this.currentTelemetryPayloadService.saveMany(
//     //             currentPayloads,
//     //         );

//     //         await this.telemetryPayloadService.saveBulk(
//     //             historyPayloads,
//     //         );

//     //     }

//     //     //---------------------------------------------
//     //     // Completed
//     //     //---------------------------------------------

//     //     await this.virtualDeviceService.clearAggregationPending(
//     //         parent.id,
//     //     );

//     //     this.logger.debug(`${fnName} completed`);

//     // }


//     private aggregateForAttribute(

//         childIds: string[],

//         rule: MetricsAttributeAggregation,

//         telemetryMap: Map<string, CurrentTelemetryPayload>,

//         nowEpoch: number,

//     ): { value: number; latestTxnCaptureTime: Date } | null {

//         let sum = 0;

//         let count = 0;

//         let latestTxnEpoch = 0;

//         for (const childId of childIds) {

//             const payload =
//                 telemetryMap.get(
//                     `${childId}_${rule.metricsAttributeId}`,
//                 );

//             if (!payload) {

//                 continue;

//             }

//             const txnEpoch =
//                 new Date(
//                     payload.metric.txnCaptureTime,
//                 ).valueOf();

//             if (
//                 rule.aggStrategy === AggStrategy.within20Mins
//             ) {

//                 if (
//                     nowEpoch - txnEpoch >
//                     this.WITHIN_20_MINS_MS
//                 ) {

//                     continue;

//                 }

//             }

//             const value =
//                 parseFloat(
//                     payload.metric.measure,
//                 );

//             if (isNaN(value)) {

//                 continue;

//             }

//             sum += value;

//             count++;

//             latestTxnEpoch =
//                 Math.max(
//                     latestTxnEpoch,
//                     txnEpoch,
//                 );

//         }

//         if (!count) {

//             return null;

//         }

//         return {

//             value:
//                 rule.aggregation === 'avg'
//                     ? sum / count
//                     : sum,

//             latestTxnCaptureTime:
//                 new Date(latestTxnEpoch),

//         };

//     }

// }