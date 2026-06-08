import { Injectable } from "@nestjs/common";
import _ from "lodash";
import { KEY_SEPARATOR } from "src/app_config/constants";
import { winstonServerLogger } from "src/app_config/serverWinston.config";
import { MetricsFrequency } from "src/common";
import { PeriodTelemetryPayloadAudit } from "src/period-telemetry-payload-audit/entities/period-telemetry-payload-audit.entity";
import { PeriodTelemetryPayloadAuditService } from "src/period-telemetry-payload-audit/period-telemetry-payload-audit.service";
import { CreateTelemetryPayloadDto } from "src/telemetry-payload/dto/create-telemetry-payload.dto";
import { TelemetryPayload } from "src/telemetry-payload/entities/telemetry-payload.entity";
import { TelemetryPayloadService } from "src/telemetry-payload/telemetry-payload.service";
import { VirtualDevice } from "src/virtual-device/entities/virtual-device.entity";
import { VirtualDeviceService } from "src/virtual-device/virtual-device.service";

@Injectable()
export class WrapperService {

    private readonly logger = winstonServerLogger(WrapperService.name);

    constructor(
        private readonly telemetryPayloadService: TelemetryPayloadService,
        private readonly periodTelemetryPayloadAuditService: PeriodTelemetryPayloadAuditService,
        private readonly virtualDeviceService: VirtualDeviceService,
    ) { }

    async processMaxTelemetryAggregation(
        inputDate: string,
        metricsFrequency: MetricsFrequency,
        isCalculationForced: boolean
    ) {
        const fnName = this.processMaxTelemetryAggregation.name;
        const input = `Input: InputDate : ${inputDate}, MetricsFrequency: ${metricsFrequency}, IsCalculationForced: ${isCalculationForced}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const periodTMPylds = await this.periodTelemetryPayloadAuditService.findPeriodTelemetryPayloads(inputDate, metricsFrequency, isCalculationForced);

        const telemetryPylds = await this.telemetryPayloadService.findTelemetryPayloads(periodTMPylds);

        const parentVDs = await this.virtualDeviceService.findParentVirtualDevices(periodTMPylds);

        const periodTMWthMaxMeasure = await this.findMaxPeriodTelemetryPayloadValue(periodTMPylds);

        const maxMeasureMtrcsMap = await this.findMaxTelmetryPayload(telemetryPylds, periodTMWthMaxMeasure);

        const aggregationInputRecords = await this.recordsForAggregation(parentVDs, maxMeasureMtrcsMap);

        const aggregatedParentTelemetryPayloads = await this.aggregatedRecords(aggregationInputRecords);

        return {
            aggregatedParentTelemetryPayloads
        };
    }


    async findMaxPeriodTelemetryPayloadValue(
        periodTMPylds: Record<string, PeriodTelemetryPayloadAudit[]>,
    ) {
        const result = Object.values(periodTMPylds)
            .map((records) =>
                _.maxBy(
                    records,
                    (record) => Number(record.metric?.measure ?? 0),
                ),
            )
            .filter(
                (record): record is PeriodTelemetryPayloadAudit => Boolean(record),
            );

        return result;
    }

    async findMaxTelmetryPayload(
        telemetryPylds: TelemetryPayload[],
        periodTMPylds: PeriodTelemetryPayloadAudit[]
    ) {
        const periodTeleMPyldsMap = new Map<string, PeriodTelemetryPayloadAudit>();

        for (const periodTeleMPyld of periodTMPylds) {
            const key = periodTeleMPyld.getTelemetryKey();
            periodTeleMPyldsMap.set(key, periodTeleMPyld);
        }

        const maxMeasureMtrcsMap = new Map<string, TelemetryPayload | PeriodTelemetryPayloadAudit>();

        for (const telemetryPyld of telemetryPylds) {
            const key = telemetryPyld.getTelemetryKey();
            const periodTeleMPyld = periodTeleMPyldsMap.get(key);

            if (!periodTeleMPyld) {
                maxMeasureMtrcsMap.set(key, telemetryPyld);
            }
            else {
                const teleMPValue = Number(telemetryPyld.metric?.measure ?? 0);
                const periodTeleMPValue = Number(periodTeleMPyld.metric?.measure ?? 0);

                if (periodTeleMPValue > teleMPValue) {
                    this.logger.debug(
                        `PeriodTelemetryPayload value ${periodTeleMPValue} is greater than TelemetryPayload value ${teleMPValue}`,
                    );
                    maxMeasureMtrcsMap.set(key, periodTeleMPyld);
                } else {
                    this.logger.debug(
                        `TelemetryPayload value ${teleMPValue} is greater than or equal to PeriodTelemetryPayload value ${periodTeleMPValue}`,
                    );
                    maxMeasureMtrcsMap.set(key, telemetryPyld);
                }
            }
        }

        for (const periodTeleMPyld of periodTMPylds) {
            const key = periodTeleMPyld.getTelemetryKey();

            if (maxMeasureMtrcsMap.has(key) == false) {
                maxMeasureMtrcsMap.set(key, periodTeleMPyld);
            }
        }

        return Array.from(maxMeasureMtrcsMap.values());
    }

    async recordsForAggregation(
        parentVDs: VirtualDevice[],
        maxMeasureMtrcs: (TelemetryPayload | PeriodTelemetryPayloadAudit)[]
    ) {
        const result = [];

        for (const parentVD of parentVDs) {

            const childVDs = parentVD.children ?? [];

            if (childVDs.length === 0) {
                this.logger.debug('There is not any children for parentId:', parentVD.id);
                continue;
            }

            const metricToAggKeyMap =
                new Map<string, Map<string, (TelemetryPayload | PeriodTelemetryPayloadAudit)[]>>();
            // metric -> (freq:period -> records)

            for (const child of childVDs) {

                for (const record of maxMeasureMtrcs) {

                    if (record.assetId !== parentVD.assetId || record.virtualDeviceId !== child.id) {
                        this.logger.debug("Not matching payload");
                        continue;
                    }

                    const metricId = record.metric.metricsAttributeId;
                    const aggregationKey = record.metric.frequency + KEY_SEPARATOR + record.metric?.txnCapturePeriod;

                    if (metricToAggKeyMap.has(metricId) == false) {
                        metricToAggKeyMap.set(metricId, new Map());
                    }

                    const aggKeyMap = metricToAggKeyMap.get(metricId)!;
                    const existing = aggKeyMap.get(aggregationKey);

                    if (existing) {
                        existing.push(record);
                    } else {
                        aggKeyMap.set(aggregationKey, [record]);
                    }
                }
            }

            for (const vdGroup of parentVD.virtualDeviceGroups ?? []) {

                const group = vdGroup.group;

                for (const groupAgg of group?.groupMetricsAttributeAggregations ?? []) {

                    const metricsAgg = groupAgg.metricsAttributeAggregation;
                    const configuredMetricId = metricsAgg.metricsAttributeId;
                    const aggregation = metricsAgg.aggregation;

                    const aggKeyMap = metricToAggKeyMap.get(configuredMetricId);

                    if (!aggKeyMap || aggKeyMap.size === 0) {
                        this.logger.debug(`No mathcing record for: ${configuredMetricId}`);
                        continue;
                    }

                    for (const telemetryRecords of aggKeyMap.values()) {

                        if (!telemetryRecords.length) continue;

                        const firstRecord = telemetryRecords[0];

                        result.push({
                            assetId: parentVD.assetId,
                            virtualDeviceId: parentVD.id,
                            groupId: vdGroup.groupId,
                            metricId: configuredMetricId,
                            frequency: firstRecord.metric.frequency,
                            txnCapturePeriod: firstRecord.metric?.txnCapturePeriod,
                            aggregation,
                            telemetryRecords,
                        });
                    }
                }
            }
        }
        return result;
    }

    async aggregatedRecords(
        aggregationInputRecords: any[],
    ) {

        const result: CreateTelemetryPayloadDto[] = [];

        for (const record of aggregationInputRecords) {
            const values =
                record.telemetryRecords.map(
                    (r: any) => Number(r.metric?.measure ?? 0),
                );

            if (values.length == 0) {
                continue;
            }
            // this.logger.debug("values", values);
            this.logger.debug(`values for ${record.virtualDeviceId}: asset ${record.assetId}`, values);

            let aggregatedValue = 0;

            this.logger.debug("aggregation strategy", record.aggregation);

            switch (record.aggregation) {
                case 'sum':
                    aggregatedValue = _.sum(values);
                    break;

                case 'avg':
                    aggregatedValue = _.sum(values) / values.length;
                    break;

                default:
                    break;
            }

            aggregatedValue = Number(
                aggregatedValue.toFixed(2),
            );

            result.push({
                assetId: record.assetId,
                virtualDeviceId: record.virtualDeviceId,
                metric: {
                    metricsAttributeId: record.metricId,
                    frequency: record.frequency,
                    txnCapturePeriod: record.txnCapturePeriod,
                    txnCaptureTime: new Date(),
                    measure: String(aggregatedValue),
                },
            } as CreateTelemetryPayloadDto);
        }
        return result;
    }
}