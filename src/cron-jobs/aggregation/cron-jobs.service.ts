import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import _ from "lodash";
import { winstonServerLogger } from "src/app_config/serverWinston.config";
import { CurrentTelemetryPayloadService } from "src/current-telemetry-payload/current-telemetry-payload.service";
import { CurrentTelemetryPayload } from "src/current-telemetry-payload/entities/current-telemetry-payload.entity";
import { IotServerService } from "src/iot-server/iot-server.service";
import { MetricsAttributeAggregation } from "src/metrics-attribute-aggregation/entities/metrics-attribute-aggregation.entity";
import { Metric } from "src/metrics/entities/metric.entity";
import { TelemetryPayload } from "src/telemetry-payload/entities/telemetry-payload.entity";
import { AggStrategy } from "src/utils/enums";
import { VirtualDevice } from "src/virtual-device/entities/virtual-device.entity";
import { VirtualDeviceService } from "src/virtual-device/virtual-device.service";

@Injectable()
export class CronJobsService {
    private readonly logger = winstonServerLogger(CronJobsService.name);
    constructor(
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
        private readonly iotServerService: IotServerService,
        private readonly virtualDeviceService: VirtualDeviceService,
    ) { }



    @Cron(CronExpression.EVERY_5_MINUTES) // change according to requirenment
    async aggregation() {
        this.logger.debug('Aggregation cron started');

        const parents = await this.virtualDeviceService.findParents();

        if (_.isEmpty(parents)) {
            this.logger.debug('No parents found');
            return;
        }


        const allVirtualDeviceIds = _.uniq(
            parents.flatMap(parent => [
                parent.id,
                ...(parent.children ?? []).map(child => child.id),
            ]),
        );

        // Collect every metric id needed across ALL parents in one shot
        const allMetricIds = _.uniq(
            parents.flatMap(parent =>
                (parent.virtualDeviceGroups ?? []).flatMap(vdg =>
                    (vdg.group?.groupMetricsAttributeAggregations ?? []).map(
                        x => x.metricsAttributeAggregation.metricsAttributeId,
                    ),
                ),
            ),
        );

        // ONE query for the all parents instead of one query per parent
        const telemetryByVD = await this.currentTelemetryPayloadService
            .findLatestTelemetryGroupedByVD(allVirtualDeviceIds, allMetricIds);

        for (const parent of parents) {
            await this.aggregateParent(parent, telemetryByVD);
        }

        this.logger.debug('Aggregation cron completed');
    }

    async aggregateParent(
        parentVD: VirtualDevice,
        telemetryByVD: Record<string, CurrentTelemetryPayload[]>,
    ) {
        const children = parentVD.children ?? [];

        if (_.isEmpty(children)) {
            this.logger.debug(`No children found for ${parentVD.id}`);
            return;
        }

        const childVirtualDeviceIds = children.map((child) => child.id);

        const allMetricAggregations = parentVD.virtualDeviceGroups?.flatMap(vdg =>
            (vdg.group?.groupMetricsAttributeAggregations ?? []).map(
                x => x.metricsAttributeAggregation,
            ),
        ) ?? [];

        if (_.isEmpty(allMetricAggregations)) {
            return;
        }

        // Last aggregation time of each metric
        const parentLastAggregationByMetric = new Map<string, number>();

        for (const telemetry of telemetryByVD[parentVD.id] ?? []) {

            parentLastAggregationByMetric.set(
                telemetry.metric.metricsAttributeId,
                telemetry.metric.txnCaptureTime.getTime(),
            );
        }

        const childTelemetryByMetric = new Map<string, CurrentTelemetryPayload[]>();
        const aggregationRequiredMetrics = new Set<string>();

        // Process ONLY this parent's children
        for (const childVDId of childVirtualDeviceIds) {

            const telemetryPayloads = telemetryByVD[childVDId] ?? [];

            for (const telemetry of telemetryPayloads) {

                const metricId = telemetry.metric.metricsAttributeId;
                const telemetryTime = telemetry.metric.txnCaptureTime.getTime();
                const lastAggregationTime = parentLastAggregationByMetric.get(metricId);

                if (
                    lastAggregationTime === undefined ||
                    telemetryTime > lastAggregationTime
                ) {
                    aggregationRequiredMetrics.add(metricId);
                }

                const records = childTelemetryByMetric.get(metricId);

                if (records) {
                    records.push(telemetry);
                } else {
                    childTelemetryByMetric.set(
                        metricId,
                        [telemetry],
                    );
                }
            }
        }

        if (aggregationRequiredMetrics.size === 0) {
            this.logger.debug(
                `No child telemetry arrived after last aggregation for ${parentVD.id}`,
            );
            return;
        }

        const aggregatedTelemetry: TelemetryPayload[] = [];

        for (const virtualDeviceGroup of parentVD.virtualDeviceGroups ?? []) {

            const group = virtualDeviceGroup.group;

            if (!group) {
                continue;
            }

            const metricAggregations = group.groupMetricsAttributeAggregations.map(
                x => x.metricsAttributeAggregation,
            );

            const groupTelemetry = this.aggregateGroup(
                parentVD,
                metricAggregations,
                childTelemetryByMetric,
                aggregationRequiredMetrics,
            );

            aggregatedTelemetry.push(
                ...groupTelemetry,
            );
        }

        if (aggregatedTelemetry.length) {
            await this.iotServerService.saveTelemetryMetrics(
                aggregatedTelemetry,
            );
        }
    }

    aggregateGroup(
        parentVD: VirtualDevice,
        metricAggregations: MetricsAttributeAggregation[],
        childTelemetryByMetric: Map<string, CurrentTelemetryPayload[]>,
        aggregationRequiredMetrics: Set<string>,
    ) {
        const aggregatedTelemetry: TelemetryPayload[] = [];

        for (const metricAggregation of metricAggregations) {
            const metricId = metricAggregation.metricsAttributeId;

            // Skip if no child changed for this metric
            if (!aggregationRequiredMetrics.has(metricId)) {
                continue;
            }

            const telemetryForMetric = childTelemetryByMetric.get(metricId) ?? [];

            if (!telemetryForMetric.length) {
                continue;
            }

            let recordsForAggregation = telemetryForMetric;

            switch (metricAggregation.aggStrategy) {
                case AggStrategy.within20Mins:
                    const now = Date.now();

                    recordsForAggregation = telemetryForMetric.filter(
                        record => (now - record.metric.txnCaptureTime.getTime()) <= 20 * 60 * 1000,
                    );
            }

            if (!recordsForAggregation.length) {
                continue;
            }

            const aggregatedMetric = this.calculateAggregation(
                recordsForAggregation,
                metricAggregation,
            );

            if (!aggregatedMetric) {
                continue;
            }

            aggregatedTelemetry.push(new TelemetryPayload({
                assetId: parentVD.assetId,
                virtualDeviceId: parentVD.id,
                deviceId: parentVD.deviceId!,
                metric: aggregatedMetric
            }));
        }
        return aggregatedTelemetry;
    }

    private calculateAggregation(
        telemetryRecords: CurrentTelemetryPayload[],
        metricAggregation: MetricsAttributeAggregation,
    ) {
        const values = telemetryRecords.map(
            record => Number(record.metric.measure),
        );

        let result: number;

        switch (metricAggregation.aggregation) {

            case "sum":
                result = _.sum(values);
                break;

            case "avg":
                result = _.sum(values) / values.length;
                break;

            default:
                throw new Error(
                    `Unsupported aggregation: ${metricAggregation.aggregation}`,
                );
        }

        return new Metric({
            metricsAttributeId: metricAggregation.metricsAttributeId,
            measure: Number(result.toFixed(2)).toString(),
            frequency: telemetryRecords[0].metric.frequency,
            txnCaptureTime: new Date(),
            txnCapturePeriod: new Date(),
            isCalculated: true,
        });
    }
}