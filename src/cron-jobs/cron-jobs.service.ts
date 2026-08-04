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
import { CreateTelemetryPayloadDto } from 'src/telemetry-payload/dto/create-telemetry-payload.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import _ from 'lodash';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
import { CreateCurrentTelemetryDto } from 'src/current-telemetry-payload/dto/create-current-telemetry.dto';
import { MetricsAttributeAggregation } from 'src/metrics-attribute-aggregation/entities/metrics-attribute-aggregation.entity';
import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
import { AggStrategy } from 'src/utils/enums';
import { Metric } from 'src/metrics/entities/metric.entity';
// import { AggregationService } from './aggregation.service';

@Injectable()
export class CronJobsService {
    private isRunning = false;   // ← add this line
    private readonly logger = winstonServerLogger(CronJobsService.name);
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


    private aggregatio = 'On Interval';
    // @Cron()
    async aggregationn() {
        const parentVdsNeedsAggregation =
            await this.virtualDeviceService.findVirtualDeviceNeedsAggregation();

        // aggregation logic....
        // const records = this.aggregatedRecords(parentVdsNeedsAggregation)

    }


    // @Cron('*/5 * * * *')
    async aggregation() {
        const fName = `${this.constructor.name}.${this.aggregation.name}`;

        this.logger.debug(`${fName} : Start`);

        try {
            const parentVdsNeedsAggregation =
                await this.virtualDeviceService.findVirtualDeviceNeedsAggregation();

            if (parentVdsNeedsAggregation.length == 0) {
                this.logger.debug(`${fName} : No parent VDs require aggregation`);
                return;
            }

            for (const parentVD of parentVdsNeedsAggregation) {
                try {
                    this.logger.debug(
                        `${fName} : Processing parent VD : ${parentVD.id}`,
                    );

                    await this.virtualDeviceService.markAggregationProcessing(
                        parentVD.id,
                    );

                    await this.aggregateParent(parentVD);

                    await this.virtualDeviceService.markAggregationCompleted(
                        parentVD.id,
                    );

                    this.logger.debug(
                        `${fName} : Aggregation completed for parent VD : ${parentVD.id}`,
                    );
                } catch (error) {
                    this.logger.error(
                        `${fName} : Aggregation failed for parent VD : ${parentVD.id}`,
                        error,

                    );
                    // Put it back into pending so next cron can retry
                    await this.virtualDeviceService.markAggregationPending(
                        parentVD.id,
                    );
                }
            }
        } catch (error) {
            this.logger.error(`${fName} : ${error}`);
            throw error;
        } finally {
            this.logger.debug(`${fName} : End`);
        }
    }

    async aggregateParent(parentVD: VirtualDevice) {
        const children = parentVD.children ?? [];

        if (!children.length) {
            this.logger.debug(
                `No children found for parent VD : ${parentVD.id}`,
            );
            return;
        }

        const childVirtualDeviceIds = children.map(child => child.id);

        for (const virtualDeviceGroup of parentVD.virtualDeviceGroups ?? []) {
            const group = virtualDeviceGroup.group;

            if (!group) {
                continue;
            }

            const groupAggregations = group.groupMetricsAttributeAggregations ?? [];

            if (groupAggregations.length == 0) {
                this.logger.debug(`GroupMetricAttrAggr not found`);
                continue;
            }

            const metricsAttributeAggregations = groupAggregations.map(
                groupMetricAggregation => groupMetricAggregation.metricsAttributeAggregation,
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
            metricAggregations.map(
                aggregation => aggregation.metricsAttributeId,
            ),
        );

        const latestTelemetry =
            await this.currentTelemetryPayloadService.findLatestTelemetry(
                childVirtualDeviceIds,
                metricsAttributeIds,
            );

        if (latestTelemetry.length == 0) {
            this.logger.debug(
                `No telemetry found for parent VD : ${parentVD.id}`,
            );
            return;
        }

        const aggregatedTelemetry: CreateCurrentTelemetryDto[] = [];

        for (const metricAggregation of metricAggregations) {
            const telemetryForMetric =
                latestTelemetry.filter(
                    telemetry =>
                        telemetry.metric.metricsAttributeId ===
                        metricAggregation.metricsAttributeId,
                );

            if (telemetryForMetric.length == 0) {
                this.logger.debug('TelemetryMetrics not found');
                continue;
            }

            const aggregatedMetric = this.calculateAggregation(
                telemetryForMetric,
                metricAggregation,
            );

            if (!aggregatedMetric) {
                continue;
            }

            aggregatedTelemetry.push({
                assetId: parentVD.assetId,
                virtualDeviceId: parentVD.id,
                deviceId: parentVD.deviceId!,
                metric: aggregatedMetric,
            });
        }

        // insert 
        if (aggregatedTelemetry.length) {
            console.log("here in create");
            await this.currentTelemetryPayloadService.createV2(
                aggregatedTelemetry,
            );
        }
    }


    private calculateAggregation(
        telemetryRecords: CurrentTelemetryPayload[],
        metricAggregation: MetricsAttributeAggregation,
    ) {
        const now = new Date();

        const recordsForAggregation =
            telemetryRecords.filter(record => {
                if (metricAggregation.aggStrategy === AggStrategy.last) {
                    return true;
                }

                if (metricAggregation.aggStrategy === AggStrategy.within20Mins) {
                    const telemetryTime = new Date(record.metric.txnCaptureTime).getTime();

                    const timeDifference = now.getTime() - telemetryTime;

                    return (timeDifference <= 20 * 60 * 1000);
                }

                return false;
            });


        if (recordsForAggregation.length == 0) {
            this.logger.debug('No records found for aggregation');
            return null;
        }

        const values = recordsForAggregation.map(
            record => Number(record.metric.measure),
        );

        let result: number;

        switch (metricAggregation.aggregation) {
            case 'sum':
                result = _.sum(values);
                break;

            case 'avg':
                result = _.sum(values) / values.length;
                break;

            default:
                throw new Error(
                    `Unsupported aggregation: ${metricAggregation.aggregation}`,
                );
        }

        // const latestRecord =
        //     recordsForAggregation.reduce(
        //         (latest, current) =>
        //             new Date(current.metric.txnCaptureTime)
        //                 >
        //                 new Date(latest.metric.txnCaptureTime)
        //                 ? current
        //                 : latest,
        //     );

        return new Metric({
            metricsAttributeId: metricAggregation.metricsAttributeId,
            measure: Number(result.toFixed(2)).toString(),
            frequency: recordsForAggregation[0].metric.frequency,
            txnCaptureTime: new Date(),
            txnCapturePeriod: new Date(),
            isCalculated: true,

            // frequency: latestRecord.metric.frequency,
            // txnCaptureTime: latestRecord.metric.txnCaptureTime,
            // txnCapturePeriod: latestRecord.metric.txnCapturePeriod,

        });
    }




    // async aggregateParent(parent: VirtualDevice) {
    //     const fName = this.aggregateParent.name;

    //     this.logger.debug(
    //         `${fName}: Start for parent ${parent.id}`,
    //     );

    //     const childIds =
    //         parent.children?.map(
    //             child  => child.id,
    //         ) ?? [];

    //     if (!childIds.length) {
    //         this.logger.debug(
    //             `${fName}: No children found for parent ${parent.id}`,
    //         );

    //         await this.virtualDeviceService.markAggregationCompleted(
    //             parent.id,
    //         );

    //         return;
    //     }

    //     const aggregationRules =
    //         parent.virtualDeviceGroups.flatMap(
    //             virtualDeviceGroup =>
    //                 virtualDeviceGroup.group
    //                     .groupMetricsAttributeAggregations,
    //         );

    //     if (!aggregationRules.length) {
    //         this.logger.debug(
    //             `${fName}: No aggregation rules found for parent ${parent.id}`,
    //         );

    //         await this.virtualDeviceService.markAggregationCompleted(
    //             parent.id,
    //         );

    //         return;
    //     }

    //     const metricIds = _.uniq(
    //         aggregationRules.map(
    //             groupMetricAggregation =>
    //                 groupMetricAggregation
    //                     .metricsAttributeAggregation
    //                     .metricsAttributeId,
    //         ),
    //     );

    //     const telemetryRecords =
    //         await this.currentTelemetryPayloadService
    //             .findLatestTelemetry(
    //                 childIds,
    //                 metricIds,
    //             );

    //     const aggregationInputRecords =
    //         aggregationRules.map(
    //             groupMetricAggregation => {
    //                 const aggregation =
    //                     groupMetricAggregation
    //                         .metricsAttributeAggregation;

    //                 const metricTelemetryRecords =
    //                     telemetryRecords.filter(
    //                         telemetry =>
    //                             telemetry.metric
    //                                 .metricsAttributeId ===
    //                             aggregation.metricsAttributeId,
    //                     );

    //                 return {
    //                     assetId: parent.assetId,
    //                     virtualDeviceId: parent.id,
    //                     metricId:
    //                         aggregation.metricsAttributeId,
    //                     aggregation:
    //                         aggregation.aggregation,
    //                     aggStrategy:
    //                         aggregation.aggStrategy,
    //                     telemetryRecords:
    //                         metricTelemetryRecords,
    //                 };
    //             },
    //         );

    //     const aggregatedTelemetry =
    //         await this.aggregatedRecords(
    //             aggregationInputRecords,
    //         );

    //     if (!aggregatedTelemetry.length) {
    //         this.logger.debug(
    //             `${fName}: No aggregated telemetry generated for parent ${parent.id}`,
    //         );

    //         await this.virtualDeviceService.markAggregationCompleted(
    //             parent.id,
    //         );

    //         return;
    //     }

    //     await this.currentTelemetryPayloadService
    //         .saveAggregatedTelemetry(
    //             aggregatedTelemetry,
    //         );

    //     await this.virtualDeviceService
    //         .markAggregationCompleted(
    //             parent.id,
    //         );

    //     this.logger.debug(
    //         `${fName}: Completed for parent ${parent.id}`,
    //     );
    // }

    // async aggregatedRecords(
    //     aggregationInputRecords: any[],
    // ) {

    //     const result: CreateTelemetryPayloadDto[] = [];

    //     for (const record of aggregationInputRecords) {
    //         const values =
    //             record.telemetryRecords.map(
    //                 (r: any) => Number(r.metric?.measure ?? 0),
    //             );

    //         if (values.length == 0) {
    //             continue;
    //         }
    //         // this.logger.debug("values", values);
    //         this.logger.debug(`values for ${record.virtualDeviceId}: asset ${record.assetId}`, values);

    //         let aggregatedValue = 0;

    //         this.logger.debug("aggregation strategy", record.aggregation);

    //         switch (record.aggregation) {
    //             case 'sum':
    //                 aggregatedValue = _.sum(values);
    //                 break;

    //             case 'avg':
    //                 aggregatedValue = _.sum(values) / values.length;
    //                 break;

    //             default:
    //                 break;
    //         }

    //         aggregatedValue = Number(
    //             aggregatedValue.toFixed(2),
    //         );

    //         result.push({
    //             assetId: record.assetId,
    //             virtualDeviceId: record.virtualDeviceId,
    //             metric: {
    //                 metricsAttributeId: record.metricId,
    //                 frequency: record.frequency,
    //                 txnCapturePeriod: record.txnCapturePeriod,
    //                 txnCaptureTime: new Date(),
    //                 measure: String(aggregatedValue),
    //             },
    //         } as CreateTelemetryPayloadDto);
    //     }
    //     return result;
    // }
}

