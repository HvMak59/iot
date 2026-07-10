// import {
//     Injectable,
//     Logger,
// } from '@nestjs/common';

// import { VirtualDeviceService } from '../virtual-device/virtual-device.service';
// import { CurrentTelemetryPayloadService } from '../current-telemetry-payload/current-telemetry-payload.service';
// import { VirtualDeviceGroupService } from '../virtual-device-group/virtual-device-group.service';
// import { GroupMetricsAttributeAggregationService } from '../group-metrics-attribute-aggregation/group-metrics-attribute-aggregation.service';
// import { TelemetryPayloadService } from '../telemetry-payload/telemetry-payload.service';

// import { VirtualDevice } from '../virtual-device/entities/virtual-device.entity';
// import { MetricsAttributeAggregation } from 'src/metrics-attribute-aggregation/entities/metrics-attribute-aggregation.entity';
// import _ from 'lodash';
// import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
// import { Metric } from 'src/metrics/entities/metric.entity';
// import { AggStrategy } from 'src/utils/enums';

// @Injectable()
// export class AggregationService {

//     private readonly logger = new Logger(AggregationService.name);
//     private readonly WITHIN_20_MINS_MS = 20 * 60 * 1000;


//     constructor(

//         private readonly virtualDeviceService: VirtualDeviceService,
//         private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
//         private readonly virtualDeviceGroupService: VirtualDeviceGroupService,
//         private readonly groupMetricsAttributeAggregationService: GroupMetricsAttributeAggregationService,
//         private readonly telemetryPayloadService: TelemetryPayloadService,

//     ) { }


//     async processScheduledAggregation(): Promise<void> {
//         const fnName = 'processScheduledAggregation';
//         this.logger.debug(`${fnName} : Start`);

//         const parents = await this.virtualDeviceService.findParentsNeedingAggregation();
//         this.logger.debug(`${fnName} : ${parents.length} parents pending`);

//         for (const parent of parents) {
//             await this.processParent(parent);
//         }

//         this.logger.debug(`${fnName} : End`);
//     }

//     private async processParent(parent: VirtualDevice) {
//         const fnName = `processParent(${parent.id})`;

//         const claimed = await this.virtualDeviceService.claimForAggregation(parent.id);
//         if (!claimed) {
//             this.logger.debug(`${fnName} : already claimed elsewhere, skipping`);
//             return;
//         }

//         try {
//             const children = await this.virtualDeviceService.getChildren(parent.id);
//             if (!children.length) {
//                 this.logger.debug(`${fnName} : no children`);
//                 return;
//             }
//             const childIds = children.map((c) => c.id);

//             const virtualDeviceGroups = await this.virtualDeviceGroupService.findByVirtualDevice(parent.id);
//             if (!virtualDeviceGroups.length) {
//                 this.logger.debug(`${fnName} : not tagged to any group`);
//                 return;
//             }
//             const groupIds = _.uniq(virtualDeviceGroups.map((vdg) => vdg.groupId));

//             const groupMetricsAttributeAggregations =
//                 await this.groupMetricsAttributeAggregationService.findByGroupIds(groupIds);
//             if (!groupMetricsAttributeAggregations.length) {
//                 this.logger.debug(`${fnName} : no aggregation rules defined`);
//                 return;
//             }

//             const aggregationsByGroupId = new Map<string, MetricsAttributeAggregation[]>();
//             for (const gmaa of groupMetricsAttributeAggregations) {
//                 const list = aggregationsByGroupId.get(gmaa.groupId) ?? [];
//                 list.push(gmaa.metricsAttributeAggregation);
//                 aggregationsByGroupId.set(gmaa.groupId, list);
//             }

//             const allAttributeIds = _.uniq(
//                 groupMetricsAttributeAggregations.map((g) => g.metricsAttributeAggregation.metricsAttributeId),
//             );

//             const currentTelemetry = await this.currentTelemetryPayloadService.getLatestTelemetry(
//                 childIds,
//                 allAttributeIds,
//             );
//             if (!currentTelemetry.length) {
//                 this.logger.debug(`${fnName} : no current telemetry yet for children`);
//                 return;
//             }

//             const telemetryByChildAndAttribute = new Map<string, CurrentTelemetryPayload>();
//             for (const payload of currentTelemetry) {
//                 const key = payload.virtualDeviceId + payload.metric.metricsAttributeId;
//                 telemetryByChildAndAttribute.set(key, payload);
//             }

//             const nowEpoch = Date.now();
//             const resultsToSave: CurrentTelemetryPayload[] = [];

//             for (const groupId of groupIds) {
//                 const rules = aggregationsByGroupId.get(groupId);
//                 if (!rules?.length) continue;

//                 for (const rule of rules) {
//                     const aggregated = this.aggregateForAttribute(childIds, rule, telemetryByChildAndAttribute, nowEpoch);
//                     if (!aggregated) {
//                         this.logger.debug(
//                             `${fnName} : group ${groupId} : no valid values for ${rule.metricsAttributeId}, skipping`,
//                         );
//                         continue;
//                     }

//                     resultsToSave.push(
//                         new CurrentTelemetryPayload({
//                             assetId: parent.assetId,
//                             virtualDeviceId: parent.id,
//                             metric: {
//                                 metricsAttributeId: rule.metricsAttributeId,
//                                 measure: aggregated.value.toString(),
//                                 txnCaptureTime: aggregated.latestTxnCaptureTime,
//                             } as Metric,
//                         }),
//                     );
//                 }
//             }

//             if (resultsToSave.length) {
//                 await this.currentTelemetryPayloadService.saveMany(resultsToSave);
//                 // TODO: also insert into TelemetryPayload (history) once that
//                 // entity/service is available — same field shape as above.
//                 this.logger.debug(`${fnName} : saved ${resultsToSave.length} aggregated metric(s)`);
//             } else {
//                 this.logger.debug(`${fnName} : nothing aggregated`);
//             }
//         } catch (error) {
//             // Failure -> re-mark for retry next tick. One parent's failure must not
//             // stop the rest of this cron run from processing other parents.
//             this.logger.error(`${fnName} : failed, re-marking for retry : ${error}`);
//             await this.virtualDeviceService.markNeedsAggregation(parent.id);
//         }
//     }

//     // Self-contained sum/avg logic against your actual entity shape —
//     // no MetricBO, no GroupsBO. aggStrategy 'last' = always include regardless
//     // of age; 'Within_20_Mins' = exclude if older than 20 min from now.
//     private aggregateForAttribute(
//         childVirtualDeviceIds: string[],
//         rule: MetricsAttributeAggregation,
//         telemetryByChildAndAttribute: Map<string, CurrentTelemetryPayload>,
//         nowEpoch: number,
//     ): { value: number; latestTxnCaptureTime: Date } | null {
//         let sum = 0;
//         let count = 0;
//         let latestTxnEpoch = 0;

//         for (const childId of childVirtualDeviceIds) {
//             const key = childId + rule.metricsAttributeId;
//             const payload = telemetryByChildAndAttribute.get(key);
//             if (!payload) continue;

//             const txnEpoch = new Date(payload.metric.txnCaptureTime).valueOf();

//             if (rule.aggStrategy === AggStrategy.within20Mins) {
//                 const ageMs = nowEpoch - txnEpoch;
//                 if (ageMs > this.WITHIN_20_MINS_MS) continue; // stale — excluded, not zeroed
//             }
//             const measure = parseFloat(payload.metric.measure);
//             if (isNaN(measure)) continue;

//             sum += measure;
//             count++;
//             latestTxnEpoch = Math.max(latestTxnEpoch, txnEpoch);
//         }

//         if (count === 0) return null;

//         const value = rule.aggregation === 'avg' ? sum / count : sum;
//         return { value, latestTxnCaptureTime: new Date(latestTxnEpoch) };
//     }


//     // async processPendingAggregations(): Promise<void> {

//     //     this.logger.log('Finding Parent Virtual Devices');

//     //     const parentVirtualDevices = await this.virtualDeviceService.findPendingParents();

//     //     if (!parentVirtualDevices.length) {
//     //         this.logger.log('No Parent Virtual Devices Found');
//     //         return;
//     //     }

//     //     this.logger.log(
//     //         `${parentVirtualDevices.length} Parent Virtual Devices Found`,
//     //     );

//     //     for (const parentVirtualDevice of parentVirtualDevices) {

//     //         try {

//     //             await this.processParentVirtualDevice(parentVirtualDevice);

//     //         } catch (error) {

//     //             this.logger.error(
//     //                 `Aggregation Failed for Parent : ${parentVirtualDevice.id}`,
//     //                 error.stack,
//     //             );

//     //         }

//     //     }

//     // }

//     // private async processParentVirtualDevice(
//     //     parentVirtualDevice: VirtualDevice,
//     // ) {

//     //     this.logger.debug(
//     //         `Processing Parent : ${parentVirtualDevice.id}`,
//     //     );

//     //     const claimed =
//     //         await this.virtualDeviceService.claimAggregation(
//     //             parentVirtualDevice.id,
//     //         );

//     //     if (!claimed) {

//     //         this.logger.debug(
//     //             `${parentVirtualDevice.id} already claimed`,
//     //         );

//     //         return;
//     //     }

//     //     const childVirtualDevices =
//     //         await this.virtualDeviceService.getChildren(
//     //             parentVirtualDevice.id,
//     //         );

//     //     if (!childVirtualDevices.length) {

//     //         this.logger.debug(
//     //             'No Child Virtual Devices',
//     //         );

//     //         return;
//     //     }

//     //     // const currentTelemetry =
//     //     //     await this.currentTelemetryPayloadService.getLatestTelemetry(
//     //     //         childVirtualDevices.map(
//     //     //             device => device.id,
//     //     //         ),
//     //     //     );

//     //     const telemetryMap =
//     //         await this.currentTelemetryPayloadService.getLatestTelemetry(
//     //             childVirtualDevices.map(device => device.id),
//     //         );

//     //     const childVirtualDeviceIds = childVirtualDevices.map(vd => vd.id);

//     //     const groups = await this.virtualDeviceGroupService.getGroupsByParentVirtualDevice(
//     //         childVirtualDeviceIds,
//     //     );


//     //     for (const group of groups) {

//     //         group.group.groupMetricsAttributeAggregations

//     //     }


//     //     for (const group of virtualDeviceGroups) {

//     //         await this.aggregateGroup(
//     //             group.groupId,
//     //             currentTelemetry,
//     //         );

//     //     }

//     // }

//     // private async aggregateGroup(

//     //     groupId: string,

//     //     currentTelemetry: any[],

//     // ) {

//     //     this.logger.debug(
//     //         `Aggregating Group : ${groupId}`,
//     //     );

//     //     const aggregationRules =
//     //         await this.groupMetricsAttributeAggregationService
//     //             .getAggregationRules(groupId);

//     //     if (!aggregationRules.length) {

//     //         this.logger.debug(
//     //             'No Aggregation Rules',
//     //         );

//     //         return;
//     //     }


//     //     const aggregatedTelemetry = [];

//     //     /**
//     //      *
//     //      * NEXT IMPLEMENTATION
//     //      *
//     //      * Iterate aggregation rules
//     //      *
//     //      * Perform
//     //      *
//     //      * SUM
//     //      * AVG
//     //      * LAST
//     //      *
//     //      * Build TelemetryPayload DTO
//     //      *
//     //      */

//     //     //---------------------------------------------------
//     //     // Save
//     //     //---------------------------------------------------

//     //     if (aggregatedTelemetry.length) {

//     //         await this.telemetryPayloadService.saveBulk(
//     //             aggregatedTelemetry,
//     //         );

//     //     }

//     // }

// }