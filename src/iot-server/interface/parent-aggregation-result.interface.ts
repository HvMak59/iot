import { MetricsFrequency } from "src/common";
import { PeriodTelemetryPayloadAudit } from "src/period-telemetry-payload-audit/entities/period-telemetry-payload-audit.entity";

export interface ParentAggregationResult {
    assetId: string;
    virtualDeviceId: string;
    groupId: string;
    metricId: string;
    frequency: MetricsFrequency;
    txnCapturePeriod: Date;
    aggregation: string;
    childWiseMaxRecords: PeriodTelemetryPayloadAudit[];
    parentMaxRecord: PeriodTelemetryPayloadAudit;
}