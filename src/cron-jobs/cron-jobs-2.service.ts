import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as _ from 'lodash';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
import { VirtualDeviceService } from 'src/virtual-device/virtual-device.service';
import { CurrentTelemetryPayloadService } from 'src/current-telemetry-payload/current-telemetry-payload.service';
import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
import { CreateCurrentTelemetryDto } from 'src/current-telemetry-payload/dto/create-current-telemetry.dto';
import { MetricsAttributeAggregation } from 'src/metrics-attribute-aggregation/entities/metrics-attribute-aggregation.entity';
import { AggStrategy } from 'src/utils/enums';
import { Metric } from 'src/metrics/entities/metric.entity';

@Injectable()
export class AggregationCronService {
    private readonly logger = new Logger(AggregationCronService.name);

    constructor(
        private readonly virtualDeviceService: VirtualDeviceService,
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
    ) { }

    // @Cron('*/5 * * * *')
    async aggregation() {
        const fName = `${this.constructor.name}.${this.aggregation.name}`;
        this.logger.debug(`${fName} : Start`);

        try {
            const candidateParents =
                await this.virtualDeviceService.findParentVdsWithAggregationConfig();

            if (!candidateParents.length) {
                this.logger.debug(`${fName} : No candidate parent VDs found`);
                return;
            }

            const parentsNeedingAggregation =
                await this.filterParentsNeedingAggregation(candidateParents);

            if (!parentsNeedingAggregation.length) {
                this.logger.debug(`${fName} : No parent VDs require aggregation`);
                return;
            }

            // 3. Aggregate each one — no flag mutation needed, this is naturally idempotent
            for (const parentVD of parentsNeedingAggregation) {
                try {
                    this.logger.debug(`${fName} : Processing parent VD : ${parentVD.id}`);
                    await this.aggregateParent(parentVD);
                    this.logger.debug(
                        `${fName} : Aggregation completed for parent VD : ${parentVD.id}`,
                    );
                } catch (error) {
                    this.logger.error(
                        `${fName} : Aggregation failed for parent VD : ${parentVD.id}`,
                        error,
                    );
                    // No status to roll back — next cron tick will just re-evaluate
                    // this parent from telemetry timestamps again.
                }
            }
        } catch (error) {
            this.logger.error(`${fName} : ${error}`);
            throw error;
        } finally {
            this.logger.debug(`${fName} : End`);
        }
    }




    private async filterParentsNeedingAggregation(
        parentVds: VirtualDevice[],
    ) {
        const parentIds = parentVds.map(p => p.id);
        const allChildIds = _.flatMap(parentVds, p =>
            (p.children ?? []).map(c => c.id),
        );
        const allMetricIds = _.uniq(
            _.flatMap(parentVds, p => this.getMetricIdsForParent(p)),
        );

        const relevantVdIds = _.uniq([...parentIds, ...allChildIds]);

        const telemetryRows =
            await this.currentTelemetryPayloadService.findLatestTelemetryForVdsAndMetrics(
                relevantVdIds,
                allMetricIds,
            );

        const byVdAndMetric = this.indexByVdAndMetric(telemetryRows);

        return parentVds.filter(parent => {
            const metricIds = this.getMetricIdsForParent(parent);
            const childIds = (parent.children ?? []).map(c => c.id);

            return metricIds.some(metricId => {
                const parentRow = byVdAndMetric.get(`${parent.id}:${metricId}`);
                const parentAggTime = parentRow?.metric?.txnCaptureTime
                    ? new Date(parentRow.metric.txnCaptureTime).getTime()
                    : -Infinity; // never aggregated -> always needs it

                const childMaxTime = childIds.reduce((max, childId) => {
                    const childRow = byVdAndMetric.get(`${childId}:${metricId}`);
                    if (!childRow) return max;
                    const t = new Date(childRow.metric.txnCaptureTime).getTime();
                    return t > max ? t : max;
                }, -Infinity);

                return childMaxTime > parentAggTime;
            });
        });
    }

    private getMetricIdsForParent(parent: VirtualDevice): string[] {
        return _.uniq(
            _.flatMap(parent.virtualDeviceGroups ?? [], vdg =>
                (vdg.group?.groupMetricsAttributeAggregations ?? []).map(
                    g => g.metricsAttributeAggregation.metricsAttributeId,
                ),
            ),
        );
    }

    private indexByVdAndMetric(
        rows: CurrentTelemetryPayload[],
    ): Map<string, CurrentTelemetryPayload> {
        const map = new Map<string, CurrentTelemetryPayload>();
        for (const row of rows) {
            map.set(`${row.virtualDeviceId}:${row.metric.metricsAttributeId}`, row);
        }
        return map;
    }


    async aggregateParent(parentVD: VirtualDevice) {
        const children = parentVD.children ?? [];

        if (!children.length) {
            this.logger.debug(`No children found for parent VD : ${parentVD.id}`);
            return;
        }

        const childVirtualDeviceIds = children.map(child => child.id);

        for (const virtualDeviceGroup of parentVD.virtualDeviceGroups ?? []) {
            const group = virtualDeviceGroup.group;
            if (!group) continue;

            const groupAggregations = group.groupMetricsAttributeAggregations ?? [];
            if (groupAggregations.length == 0) {
                this.logger.debug(`GroupMetricAttrAggr not found`);
                continue;
            }

            const metricsAttributeAggregations = groupAggregations.map(
                g => g.metricsAttributeAggregation,
            );

            await this.aggregateGroup(
                parentVD,
                childVirtualDeviceIds,
                metricsAttributeAggregations,
            );
        }
    }

    async aggregateGroup(
        parentVD: VirtualDevice,
        childVirtualDeviceIds: string[],
        metricAggregations: MetricsAttributeAggregation[],
    ) {
        const metricsAttributeIds = _.uniq(
            metricAggregations.map(a => a.metricsAttributeId),
        );

        const latestTelemetry =
            await this.currentTelemetryPayloadService.findLatestTelemetryForVdsAndMetrics(
                childVirtualDeviceIds,
                metricsAttributeIds,
            );

        if (latestTelemetry.length == 0) {
            this.logger.debug(`No telemetry found for parent VD : ${parentVD.id}`);
            return;
        }

        const telemetryByMetric = _.groupBy(
            latestTelemetry,
            t => t.metric.metricsAttributeId,
        );

        const aggregatedTelemetry: CreateCurrentTelemetryDto[] = [];

        for (const metricAggregation of metricAggregations) {
            const telemetryForMetric =
                telemetryByMetric[metricAggregation.metricsAttributeId];

            if (!telemetryForMetric || telemetryForMetric.length == 0) {
                this.logger.debug('TelemetryMetrics not found');
                continue;
            }

            const aggregatedMetric = this.calculateAggregation(
                telemetryForMetric,
                metricAggregation,
            );

            if (!aggregatedMetric) continue;

            aggregatedTelemetry.push({
                assetId: parentVD.assetId,
                virtualDeviceId: parentVD.id,
                deviceId: parentVD.deviceId!,
                metric: aggregatedMetric,
            });
        }

        if (aggregatedTelemetry.length) {
            await this.currentTelemetryPayloadService.createV2(aggregatedTelemetry);
        }
    }

    private calculateAggregation(
        telemetryRecords: CurrentTelemetryPayload[],
        metricAggregation: MetricsAttributeAggregation,
    ) {
        const now = new Date();

        const recordsForAggregation = telemetryRecords.filter(record => {
            if (metricAggregation.aggStrategy === AggStrategy.last) return true;

            if (metricAggregation.aggStrategy === AggStrategy.within20Mins) {
                const telemetryTime = new Date(record.metric.txnCaptureTime).getTime();
                const timeDifference = now.getTime() - telemetryTime;
                return timeDifference <= 20 * 60 * 1000;
            }

            return false;
        });

        if (recordsForAggregation.length == 0) {
            this.logger.debug('No records found for aggregation');
            return null;
        }

        const values = recordsForAggregation.map(r => Number(r.metric.measure));

        let result: number;
        switch (metricAggregation.aggregation) {
            case 'sum':
                result = _.sum(values);
                break;
            case 'avg':
                result = _.sum(values) / values.length;
                break;
            default:
                throw new Error(`Unsupported aggregation: ${metricAggregation.aggregation}`);
        }

        return new Metric({
            metricsAttributeId: metricAggregation.metricsAttributeId,
            measure: Number(result.toFixed(2)).toString(),
            frequency: recordsForAggregation[0].metric.frequency,
            txnCaptureTime: new Date(),
            txnCapturePeriod: new Date(),
            isCalculated: true,
        });
    }
}