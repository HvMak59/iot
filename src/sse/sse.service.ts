// import { Injectable, OnModuleDestroy } from '@nestjs/common';
// import {
//     Subject,
//     filter,
//     map,
//     mergeMap,
//     from,
//     EMPTY,
//     concat,
//     Observable,
//     finalize,
// } from 'rxjs';
// import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
// import { TelemetryPayloadService } from 'src/telemetry-payload/telemetry-payload.service';
// import { TelemetryDevice } from 'src/telemetry-payload/dto/telemetry-device.dto';
// import { getMetricDTO } from 'src/utils/others';
// import { FindTelemetryPayloadForAPeriod } from 'src/telemetry-payload/dto/find-telemetry-payload-for-a-period.dto';
// import { TelemetryPayload } from 'src/telemetry-payload/entities/telemetry-payload.entity';
// import { KEY_SEPARATOR } from 'src/app_config/constants';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';


// @Injectable()
// export class SseService {

//     private readonly logger = winstonServerLogger(SseService.name);
//     private readonly streams = new Map<string, Subject<any>>();

//     constructor(
//         private readonly telemetryPayloadService: TelemetryPayloadService,
//     ) { }

//     async subscribe(
//         virtualDeviceId: string,
//         metricsAttributeId: string,
//         startTime?: number,
//         endTime?: number,
//     ) {
//         const key = virtualDeviceId + KEY_SEPARATOR + metricsAttributeId;
//         let stream = this.streams.get(key);

//         if (!stream) {
//             stream = new Subject<any>();
//             this.streams.set(key, stream);
//         }

//         const liveStream = new Observable(subscriber => {
//             const subscription = stream.subscribe(subscriber);
//             console.log('Subscribed');


//             return () => {
//                 subscription.unsubscribe();
//                 console.log('Cleanup executed');

//                 // Remove stream if nobody is subscribed anymore
//                 if (stream.observed === false) {
//                     this.streams.delete(key);
//                     console.log(`Removed stream: ${key}`);
//                 }
//             };
//         });

//         if (startTime !== undefined && endTime !== undefined) {

//             // const data = await this.fetchHistory(
//             //     virtualDeviceId,
//             //     metricsAttributeId,
//             //     startTime,
//             //     endTime,
//             // );

//             // if (data.length == 0) {
//             //     return liveStream;
//             // }

//             // const history = from([
//             //     this.toSseEvent(
//             //         'HISTORY',
//             //         metricsAttributeId,
//             //         data,
//             //     ),
//             // ]);

//             const history = from(
//                 this.fetchHistory(
//                     virtualDeviceId,
//                     metricsAttributeId,
//                     startTime,
//                     endTime,
//                 ),
//             ).pipe(
//                 filter(data => data.length > 0),
//                 map(data =>
//                     this.toSseEvent(
//                         'HISTORY',
//                         metricsAttributeId,
//                         data,
//                     ),
//                 ),
//             );

//             return concat(history, liveStream);
//         }

//         return liveStream;
//     }

//     publish(
//         virtualDeviceId: string,
//         payloads: CurrentTelemetryPayload[],
//     ) {

//         const groupedByMetric = new Map<string, CurrentTelemetryPayload[]>();

//         for (const payload of payloads) {

//             const metricsAttributeId = payload.metric?.metricsAttributeId;

//             if (!metricsAttributeId) {
//                 this.logger.error('No metric found');
//                 continue;
//             }

//             // if (!groupedByMetric.has(metricId)) {
//             //     groupedByMetric.set(metricId, []);
//             // }

//             // groupedByMetric.get(metricId)!.push(payload);

//             const group = groupedByMetric.get(metricsAttributeId);

//             if (group) {
//                 group.push(payload);
//             } else {
//                 groupedByMetric.set(metricsAttributeId, [payload]);
//             }
//         }

//         for (const [metricsAttributeId, metricPayloads] of groupedByMetric.entries()) {

//             const key = virtualDeviceId + KEY_SEPARATOR + metricsAttributeId;
//             const stream = this.streams.get(key);

//             if (!stream) {
//                 continue;
//             }

//             stream.next(
//                 this.toSseEvent(
//                     'LIVE',
//                     metricsAttributeId,
//                     metricPayloads,
//                 ),
//             );
//         }
//     }

//     private toSseEvent(
//         type: 'LIVE' | 'HISTORY',
//         metricsAttributeId: string,
//         payloads: TelemetryPayload[] | CurrentTelemetryPayload[],
//     ) {
//         const first = payloads[0];

//         const data = {
//             type,
//             data: {
//                 telemetryDevice: TelemetryDevice.createFromTelemetry(first),
//                 metrics: payloads.map(p => getMetricDTO(p.metric)),
//                 telemetryDisplayProperty: {
//                     metricsAttributeId,
//                     frequency: first.metric.frequency,
//                     displayName: metricsAttributeId,
//                     unit: first.metric.unit,
//                 },
//             },
//         };
//         return data;
//     }

//     private async fetchHistory(
//         virtualDeviceId: string,
//         metricsAttributeId: string,
//         startTime: number,
//         endTime: number,
//     ) {
//         const dto = new FindTelemetryPayloadForAPeriod({
//             virtualDeviceId,
//             metricsAttributeId,
//             startTime,
//             endTime,
//         });

//         return await this.telemetryPayloadService.findForATimePeriod(dto);
//     }
// }



import { Injectable, MessageEvent } from '@nestjs/common';
import _ from 'lodash';
import { Subject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { AssetCurrentPerformanceSourceService } from 'src/asset-current-performance-source/asset-current-performance-source.service';
import { AssetCurrentPerformanceSourceRepo } from 'src/asset-current-performance-source/entities/asset-current-performance-source-repo.entity';
import { AssetCurrentPerformanceSource } from 'src/asset-current-performance-source/entities/asset-current-performance-source.entity';
import { CurrentTelemetryPayloadService } from 'src/current-telemetry-payload/current-telemetry-payload.service';
import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
import { DeviceTypeMetricsAttributeService } from 'src/device-type-metrics-attribute/device-type-metrics-attribute.service';
import { DeviceTypeMetricsAttribute } from 'src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { TelemetryDevice } from 'src/iot-server/dto/telemetry-device.dto';
import { FindTelemetryPayloadForAPeriod } from 'src/telemetry-payload/dto/find-telemetry-payload-for-a-period.dto';
import { TelemetryPayloadService } from 'src/telemetry-payload/telemetry-payload.service';
import { getMetricDTO, getTPLV3DTO } from 'src/utils/others';

@Injectable()
export class SseService {

    private readonly logger = winstonServerLogger(SseService.name);
    private readonly streams = new Map<string, Subject<MessageEvent>>();

    constructor(
        private readonly telemetryPayloadService: TelemetryPayloadService,

        private readonly aCPSService: AssetCurrentPerformanceSourceService,
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
        private readonly deviceTypeMetricsAttributeService: DeviceTypeMetricsAttributeService,
    ) { }

    private sirDelivered = 4;
    // subscribe(assetId: string): Observable<MessageEvent> {

    //     let stream = this.streams.get(assetId);

    //     if (!stream) {
    //         stream = new Subject<MessageEvent>();
    //         this.streams.set(assetId, stream);
    //     }

    //     this.logger.debug(`Client subscribed: ${assetId}`);

    //     return stream.pipe(
    //         finalize(() => {

    //             this.logger.debug(`Client disconnected: ${assetId}`);

    //             if (!stream!.observed) {
    //                 this.streams.delete(assetId);
    //                 this.logger.debug(`Removed stream: ${assetId}`);
    //             }
    //         }),
    //     );
    //     // if (startTime !== undefined && endTime !== undefined) {
    //     //     const history = from(
    //     //         this.fetchHistory(
    //     //             virtualDeviceId,
    //     //             metricsAttributeId,
    //     //             startTime,
    //     //             endTime,
    //     //         ),
    //     //     ).pipe(
    //     //         filter(data => data.length > 0),
    //     //         map(data =>
    //     //             this.toSseEvent(
    //     //                 // 'HISTORY',
    //     //                 metricsAttributeId,
    //     //                 data,
    //     //             ),
    //     //         ),
    //     //     );
    //     //     return concat(history, liveStream);
    //     // }
    //     // return liveStream;
    // }

    subscribe(assetId: string, virtualDeviceId?: string): Observable<MessageEvent> {
        const key = this.buildKey(assetId, virtualDeviceId);

        let stream = this.streams.get(key);
        if (!stream) {
            stream = new Subject<MessageEvent>();
            this.streams.set(key, stream);
        }

        this.logger.debug(`Client subscribed: ${key}`);

        return stream.pipe(
            finalize(() => {
                this.logger.debug(`Client disconnected: ${key}`);
                if (!stream!.observed) {
                    this.streams.delete(key);
                    this.logger.debug(`Removed stream: ${key}`);
                }
            }),
        );
    }

    publish(assetId: string, message: MessageEvent, virtualDeviceId?: string) {
        // always try publishing to the specific assetId+vdId stream
        if (virtualDeviceId) {
            const specificKey = this.buildKey(assetId, virtualDeviceId);
            const specificStream = this.streams.get(specificKey);
            if (specificStream) {
                this.logger.debug(`Publishing to specific stream: ${specificKey}`);
                specificStream.next(message);
            }
            else {
                this.logger.error(`No stream found for this virtualDevice ${virtualDeviceId}`);
            }
        }


        // always try publishing to the broad assetId-only stream
        const broadKey = this.buildKey(assetId);
        const broadStream = this.streams.get(broadKey);
        if (broadStream) {
            this.logger.debug(`Publishing to broad stream: ${broadKey}`);
            broadStream.next(message);
        }

        if (!virtualDeviceId && !this.streams.get(broadKey)) {
            this.logger.error(`No stream found for assetId: ${assetId}`);
        }
    }

    private buildKey(assetId: string, virtualDeviceId?: string): string {
        return virtualDeviceId ? `${assetId}:${virtualDeviceId}` : assetId;
    }


    // publish(
    //     virtualDeviceId: string,
    //     payloads: CurrentTelemetryPayload[],
    // ) {

    //     const groupedByMetric = new Map<string, CurrentTelemetryPayload[]>();

    //     for (const payload of payloads) {

    //         const metricsAttributeId = payload.metric?.metricsAttributeId;

    //         if (!metricsAttributeId) {
    //             continue;
    //         }

    //         const group = groupedByMetric.get(metricsAttributeId);

    //         if (group) {
    //             group.push(payload);
    //         } else {
    //             groupedByMetric.set(metricsAttributeId, [payload]);
    //         }
    //     }

    //     for (const [metricsAttributeId, metricPayloads] of groupedByMetric.entries()) {

    //         const key = virtualDeviceId + KEY_SEPARATOR + metricsAttributeId;
    //         const stream = this.streams.get(key);

    //         if (!stream) {
    //             this.logger.error('There is not any stream');
    //             continue;
    //         }

    //         stream.next(
    //             this.toSseEvent(
    //                 'LIVE',
    //                 metricsAttributeId,
    //                 metricPayloads,
    //             ),
    //         );
    //     }
    // }

    // SSE service - now dead simple


    private SirDelivered = 4;
    // publish(assetId: string, message: MessageEvent) {
    //     const stream = this.streams.get(assetId);
    //     if (!stream) {
    //         this.logger.error(`No stream found for assetId: ${assetId}`);
    //         return;
    //     }
    //     stream.next(message);
    // }

    private idk = 4;
    // publish(
    //     assetId: string,
    //     payloads: CurrentTelemetryPayload[],
    //     aCPSByKey: Map<string, AssetCurrentPerformanceSource>,
    //     dTMAByKey: _.Dictionary<DeviceTypeMetricsAttribute[]>,
    // ) {
    //     const stream = this.streams.get(assetId);
    //     if (!stream) return;

    //     const message = this.buildDto(payloads, aCPSByKey, dTMAByKey);
    //     stream.next(message);
    // }

    private buildDto(
        payloads: CurrentTelemetryPayload[],
        aCPSByKey: Map<string, AssetCurrentPerformanceSource>,
        dTMAByKey: _.Dictionary<DeviceTypeMetricsAttribute[]>,
    ): MessageEvent {
        return {
            data: getTPLV3DTO(payloads, aCPSByKey, CurrentTelemetryPayload, dTMAByKey),
        };
    }

    // publish(virtualDeviceId: string, payloads: CurrentTelemetryPayload[]) {
    //     const stream = this.streams.get(virtualDeviceId);

    //     if (!stream) return;

    //     const message = this.buildDto(payloads)

    //     stream.next(message);
    // }

    // private buildDto(payloads: CurrentTelemetryPayload[]): MessageEvent {
    //     const first = payloads[0];

    //     return {
    //         data: {
    //             telemetryDevice: TelemetryDevice.createFromTelemetry(first),
    //             metrics: payloads.map(p => getMetricDTO(p.metric)),
    //         },
    //     };
    // }

    async handleTelemetryInserted(payloads: CurrentTelemetryPayload[]) {
        // async handleTelemetryInserted(assetId: string) {
        const fnName = this.handleTelemetryInserted.name;

        if (!payloads || payloads.length === 0) {
            this.logger.error(`Empty payloads`);
            return;
        }

        const assetIds = _.uniq(payloads.map(p => p.assetId).filter(Boolean));

        for (const assetId of assetIds) {
            const aCPSs = await this.aCPSService.findByAssetID(assetId!);
            // console.log('assets', aCPSs);

            if (_.isNil(aCPSs) || aCPSs.length === 0) {
                this.logger.warn(`${fnName} No ACPS found for asset ${assetId}, skipping`);
                continue;
            }
            else {
                this.logger.debug(`${fnName} Found ${aCPSs.length} ACPS for asset ${assetId}`);

                const aCPSByKey = new Map<string, AssetCurrentPerformanceSource>();
                const deviceTypeIDSet = new Set<string>();

                for (const aCPS of aCPSs) {
                    const aCPSObj = new AssetCurrentPerformanceSource(aCPS);
                    aCPSByKey.set(aCPSObj.getKey(), aCPSObj);

                    if (aCPSObj.virtualDevice?.deviceTypeId) {
                        deviceTypeIDSet.add(aCPSObj.virtualDevice.deviceTypeId);
                    }
                }
                console.log(deviceTypeIDSet.size);

                let dTMAByKey: { [key: string]: DeviceTypeMetricsAttribute[] } = {};
                if (deviceTypeIDSet.size > 0) {
                    dTMAByKey = await this.deviceTypeMetricsAttributeService.dTMAsByByKey(
                        { csvDeviceTypeIDs: [...deviceTypeIDSet].join(',') },
                        false,
                        true,
                    );
                }

                console.log("keys", dTMAByKey);

                const aCPSRepo = new AssetCurrentPerformanceSourceRepo(aCPSs);
                const findCTPLDTOs = aCPSRepo.getFindCTPLDTOs();
                const cTPLs = await this.currentTelemetryPayloadService.findByMultipleConditions(findCTPLDTOs);

                const message = {
                    data: getTPLV3DTO(cTPLs, aCPSByKey, CurrentTelemetryPayload, dTMAByKey),
                };

                this.publish(assetId!, message);
            }
        }
    }

}





// private fetchHistory(
//     virtualDeviceId: string,
//     metricsAttributeId: string,
//     startTime: number,
//     endTime: number,
// ) {

//     const dto = new FindTelemetryPayloadForAPeriod({
//         virtualDeviceId,
//         metricsAttributeId,
//         startTime,
//         endTime,
//     });

//     return this.telemetryPayloadService.findForATimePeriod(dto);
// }