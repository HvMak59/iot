import { Injectable } from '@nestjs/common';

import { VirtualDeviceService } from '../virtual-device/virtual-device.service';
import { CurrentTelemetryPayloadService } from '../current-telemetry-payload/current-telemetry-payload.service';
import { VirtualDeviceGroupService } from '../virtual-device-group/virtual-device-group.service';
import { GroupMetricsAttributeAggregationService } from '../group-metrics-attribute-aggregation/group-metrics-attribute-aggregation.service';
import { AggregationContextData } from './aggregation-context.interface';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
import { VirtualDeviceGroup } from 'src/virtual-device-group/entities/virtual-device-group.entity';
import { GroupMetricsAttributeAggregation } from 'src/group-metrics-attribute-aggregation/entities/group-metrics-attribute-aggregation.entity';

// import { AggregationContextData } from './interfaces/aggregation-context.interface';

@Injectable()
export class AggregationContext {

    constructor(

        // private readonly virtualDeviceService: VirtualDeviceService,

        // private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,

        // private readonly virtualDeviceGroupService: VirtualDeviceGroupService,

        // private readonly groupMetricsAggregationService: GroupMetricsAttributeAggregationService,

    ) { }

    // async load(): Promise<AggregationContextData> {

    //     // Step 1

    //     const parents =
    //         await this.virtualDeviceService.claimPendingParents();

    //     if (!parents.length) {

    //         return {
    //             parents: [],
    //             children: [],
    //             telemetry: [],
    //             groups: [],
    //             rules: [],
    //             childrenByParent: new Map(),
    //             telemetryByVD: new Map(),
    //             groupsByVD: new Map(),
    //             rulesByGroup: new Map(),
    //         };

    //     }

    //     const children =
    //         await this.virtualDeviceService.findChildren(
    //             parents.map(p => p.id),
    //         );

    //     const telemetry =
    //         await this.currentTelemetryPayloadService.findLatestTelemetry(
    //             children.map(c => c.id),
    //         );

    //     const groups =
    //         await this.virtualDeviceGroupService.findByVirtualDeviceIDs(
    //             children.map(c => c.id),
    //         );

    //     const groupIds = [
    //         ...new Set(
    //             groups.map(g => g.groupId),
    //         ),
    //     ];

    //     const rules =
    //         await this.groupMetricsAggregationService.findByGroupIDs(
    //             groupIds,
    //         );



    //     return {

    //         parents,

    //         children,

    //         telemetry,

    //         groups,

    //         rules,

    //         childrenByParent:
    //             this.buildChildrenMap(children),

    //         telemetryByVD:
    //             this.buildTelemetryMap(telemetry),

    //         groupsByVD:
    //             this.buildGroupMap(groups),

    //         rulesByGroup:
    //             this.buildRuleMap(rules),

    //     };

    // }


    // private buildChildrenMap(
    //     children: VirtualDevice[],
    // ): Map<string, VirtualDevice[]> {

    //     const map = new Map<string, VirtualDevice[]>();

    //     for (const child of children) {

    //         if (!child.parentId)
    //             continue;

    //         const list =
    //             map.get(child.parentId) ?? [];

    //         list.push(child);

    //         map.set(
    //             child.parentId,
    //             list,
    //         );

    //     }

    //     return map;

    // }

    // private buildTelemetryMap(
    //     telemetry: CurrentTelemetryPayload[],
    // ): Map<string, CurrentTelemetryPayload[]> {

    //     const map =
    //         new Map<string, CurrentTelemetryPayload[]>();

    //     for (const t of telemetry) {

    //         const list =
    //             map.get(t.virtualDeviceId!) ?? [];

    //         list.push(t);

    //         map.set(
    //             t.virtualDeviceId!,
    //             list,
    //         );

    //     }

    //     return map;

    // }

    // private buildGroupMap(
    //     groups: VirtualDeviceGroup[],
    // ): Map<string, VirtualDeviceGroup[]> {

    //     const map =
    //         new Map<string, VirtualDeviceGroup[]>();

    //     for (const group of groups) {

    //         const list =
    //             map.get(group.virtualDeviceId) ?? [];

    //         list.push(group);

    //         map.set(
    //             group.virtualDeviceId,
    //             list,
    //         );

    //     }

    //     return map;

    // }

    // private buildRuleMap(
    //     rules: GroupMetricsAttributeAggregation[],
    // ): Map<string, GroupMetricsAttributeAggregation[]> {

    //     const map =
    //         new Map<string, GroupMetricsAttributeAggregation[]>();

    //     for (const rule of rules) {

    //         const list =
    //             map.get(rule.groupId) ?? [];

    //         list.push(rule);

    //         map.set(
    //             rule.groupId,
    //             list,
    //         );

    //     }

    //     return map;

    // }




}