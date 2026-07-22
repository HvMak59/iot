import { CurrentTelemetryPayloadService } from "src/current-telemetry-payload/current-telemetry-payload.service";
import { VirtualDeviceService } from "src/virtual-device/virtual-device.service";
import { AggregationContextData } from "./aggregation-context.interface";
import { CreateCurrentTelemetryDto } from "src/current-telemetry-payload/dto/create-current-telemetry.dto";
import { Injectable } from "@nestjs/common";
import { VirtualDevice } from "src/virtual-device/entities/virtual-device.entity";
import { GroupMetricsAttributeAggregation } from "src/group-metrics-attribute-aggregation/entities/group-metrics-attribute-aggregation.entity";
import { Metric } from "src/metrics/entities/metric.entity";
import { CurrentTelemetryPayload } from "src/current-telemetry-payload/entities/current-telemetry-payload.entity";

@Injectable()
export class AggregationService {

    constructor(

        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,

        private readonly virtualDeviceService: VirtualDeviceService,

    ) { }

    async aggregate(
        context: AggregationContextData,
    ) {

        const aggregatedTelemetry: CreateCurrentTelemetryDto[] = [];

        for (const parent of context.parents) {

            const parentTelemetry =
                this.aggregateParent(
                    parent,
                    context,
                );

            aggregatedTelemetry.push(
                ...parentTelemetry,
            );
        }

        if (aggregatedTelemetry.length) {

            await this.currentTelemetryPayloadService.createV2(
                aggregatedTelemetry,
            );

        }

        // await this.virtualDeviceService.markAggregationCompleted(
        // context.parents.map(p => p.id),
        // );

    }


    private aggregateParent(
        parent: VirtualDevice,
        context: AggregationContextData,
    ): CreateCurrentTelemetryDto[] {

        const telemetryDtos: CreateCurrentTelemetryDto[] = [];

        const children =
            context.childrenByParent.get(parent.id) ?? [];

        if (!children.length)
            return telemetryDtos;

        const groupIds = new Set<string>();

        for (const child of children) {

            const groups =
                context.groupsByVD.get(child.id) ?? [];

            groups.forEach(g =>
                groupIds.add(g.groupId),
            );

        }

        for (const groupId of groupIds) {

            const rules =
                context.rulesByGroup.get(groupId) ?? [];

            telemetryDtos.push(

                ...this.aggregateGroup(
                    parent,
                    children,
                    rules,
                    context,
                ),

            );

        }

        return telemetryDtos;

    }

    private aggregateGroup(

        parent: VirtualDevice,

        children: VirtualDevice[],

        rules: GroupMetricsAttributeAggregation[],

        context: AggregationContextData,

    ): CreateCurrentTelemetryDto[] {

        const result: CreateCurrentTelemetryDto[] = [];

        for (const rule of rules) {

            const dto =
                this.calculateMetric(
                    parent,
                    children,
                    rule,
                    context,
                );

            if (dto)
                result.push(dto);

        }

        return result;

    }

    private calculateMetric(

        parent: VirtualDevice,

        children: VirtualDevice[],

        rule: GroupMetricsAttributeAggregation,

        context: AggregationContextData,

    ): CreateCurrentTelemetryDto | null {

        const values: CurrentTelemetryPayload[] = [];

        for (const child of children) {

            const telemetry =
                context.telemetryByVD.get(child.id) ?? [];

            values.push(

                ...telemetry.filter(

                    t =>
                        t.metric.metricsAttributeId ===
                        rule.metricsAttributeAggregation.metricsAttributeId,

                ),


            );

        }



        if (!values.length)
            return null;



        let measure = 0;

        switch (
        rule.metricsAttributeAggregation.aggregation
        ) {

            case 'sum':

                measure = values.reduce(

                    (sum, t) =>
                        sum + Number(t.metric.measure),

                    0,

                );

                break;

            case 'avg':

                measure =
                    values.reduce(

                        (sum, t) =>
                            sum + Number(t.metric.measure),

                        0,

                    ) /
                    values.length;

                break;

        }



        const sample = values[0];

        return {

            assetId: parent.assetId,

            virtualDeviceId: parent.id,

            metric: new Metric({

                metricsAttributeId:
                    sample.metric.metricsAttributeId,

                measure:
                    measure.toString(),

                unit:
                    sample.metric.unit,

                frequency:
                    sample.metric.frequency,

                txnCaptureTime:
                    new Date(),

                isCalculated: true,

            }),

        };

    }
}