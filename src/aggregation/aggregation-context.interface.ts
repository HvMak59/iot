import { CurrentTelemetryPayload } from "src/current-telemetry-payload/entities/current-telemetry-payload.entity";
import { GroupMetricsAttributeAggregation } from "src/group-metrics-attribute-aggregation/entities/group-metrics-attribute-aggregation.entity";
import { VirtualDeviceGroup } from "src/virtual-device-group/entities/virtual-device-group.entity";
import { VirtualDevice } from "src/virtual-device/entities/virtual-device.entity";

export interface AggregationContextData {

    parents: VirtualDevice[];
    children: VirtualDevice[];
    telemetry: CurrentTelemetryPayload[];
    groups: VirtualDeviceGroup[];
    rules: GroupMetricsAttributeAggregation[];
    childrenByParent: Map<string, VirtualDevice[]>;
    telemetryByVD: Map<string, CurrentTelemetryPayload[]>;
    groupsByVD: Map<string, VirtualDeviceGroup[]>;
    rulesByGroup: Map<string, GroupMetricsAttributeAggregation[]>;
}