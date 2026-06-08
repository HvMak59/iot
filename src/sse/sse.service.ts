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



import {
    Injectable,
    MessageEvent,
} from '@nestjs/common';

import {
    Subject,
    Observable,
    from,
    concat,
} from 'rxjs';

import {
    filter,
    map,
    finalize,
} from 'rxjs/operators';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
import { TelemetryDevice } from 'src/iot-server/dto/telemetry-device.dto';
import { FindTelemetryPayloadForAPeriod } from 'src/telemetry-payload/dto/find-telemetry-payload-for-a-period.dto';
import { TelemetryPayload } from 'src/telemetry-payload/entities/telemetry-payload.entity';
import { TelemetryPayloadService } from 'src/telemetry-payload/telemetry-payload.service';
import { getMetricDTO } from 'src/utils/others';

@Injectable()
export class SseService {

    private readonly logger = winstonServerLogger(SseService.name);

    private readonly streams = new Map<string, Subject<MessageEvent>>();

    constructor(
        private readonly telemetryPayloadService: TelemetryPayloadService,
    ) { }

    subscribe(
        virtualDeviceId: string,
        metricsAttributeId: string,
        startTime?: number,
        endTime?: number,
    ): Observable<MessageEvent> {

        const key = virtualDeviceId + KEY_SEPARATOR + metricsAttributeId;

        let stream = this.streams.get(key);

        if (!stream) {
            stream = new Subject<MessageEvent>();
            this.streams.set(key, stream);
        }

        const liveStream = stream.pipe(
            finalize(() => {

                this.logger.debug(`Client disconnected: ${key}`);

                if (!stream!.observed) {
                    this.streams.delete(key);

                    this.logger.debug(`Removed stream: ${key}`);
                }
            }),
        );

        if (startTime !== undefined && endTime !== undefined) {
            const history = from(
                this.fetchHistory(
                    virtualDeviceId,
                    metricsAttributeId,
                    startTime,
                    endTime,
                ),
            ).pipe(
                filter(data => data.length > 0),
                map(data =>
                    this.toSseEvent(
                        'HISTORY',
                        metricsAttributeId,
                        data,
                    ),
                ),
            );
            return concat(history, liveStream);
        }
        return liveStream;
        // 
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

    publish(key: string, payloads: CurrentTelemetryPayload[]) {
        const stream = this.streams.get(key);

        if (!stream) return;

        stream.next(
            this.toSseEvent(
                'LIVE',
                payloads[0].metric!.metricsAttributeId,
                payloads,
            ),
        );
    }
    // 
    private toSseEvent(
        type: 'LIVE' | 'HISTORY',
        metricsAttributeId: string,
        payloads: TelemetryPayload[] | CurrentTelemetryPayload[],
    ): MessageEvent {

        const first = payloads[0];

        return {
            type,
            data: {
                telemetryDevice: TelemetryDevice.createFromTelemetry(first),

                metrics: payloads.map(p => getMetricDTO(p.metric)),

                telemetryDisplayProperty: {
                    metricsAttributeId,
                    frequency: first.metric.frequency,
                    displayName: metricsAttributeId,
                    unit: first.metric.unit,
                },
            },
        };
    }

    private async fetchHistory(
        virtualDeviceId: string,
        metricsAttributeId: string,
        startTime: number,
        endTime: number,
    ) {

        const dto = new FindTelemetryPayloadForAPeriod({
            virtualDeviceId,
            metricsAttributeId,
            startTime,
            endTime,
        });

        return this.telemetryPayloadService.findForATimePeriod(dto);
    }
}



const idk = 8;
// publish(virtualDeviceId: string, payloads: CurrentTelemetryPayload[]) {
//     console.log("in publish");
//     const groupedByMetric = new Map<string, CurrentTelemetryPayload[]>();

//     for (const payload of payloads) {
//         const metricId = payload.metric?.metricsAttributeId;
//         if (!metricId) continue;

//         if (!groupedByMetric.has(metricId)) {
//             groupedByMetric.set(metricId, []);
//         }
//         groupedByMetric.get(metricId)!.push(payload);
//     }

//     for (const [metricsAttributeId, metricPayloads] of groupedByMetric.entries()) {
//         // console.log('publishing', virtualDeviceId, metricsAttributeId, payloads);
//         this.eventBus.next({ virtualDeviceId, metricsAttributeId, payloads: metricPayloads });
//     }
// }

// subscribe(
//     virtualDeviceId: string,
//     metricsAttributeId: string,
//     startTime?: number,
//     endTime?: number,
// ) {
//     console.log('sse service');
//     const liveStream = this.eventBus.pipe(
//         filter(e =>
//             e.virtualDeviceId === virtualDeviceId &&
//             e.metricsAttributeId === metricsAttributeId
//         ),
//         map(e => this.toSseEvent('LIVE', metricsAttributeId, e.payloads)),
//     );

//     if (startTime !== undefined && endTime !== undefined) {
//         const history = from(
//             this.fetchHistory(virtualDeviceId, metricsAttributeId, startTime, endTime)
//         ).pipe(
//             mergeMap(history => {
//                 if (!history.length) return EMPTY;
//                 return [this.toSseEvent('HISTORY', metricsAttributeId, history)];
//             })
//         )
//         // concat instead of manual nested subscribe — emits history fully, then live
//         return concat(history, liveStream);
//     }

//     return liveStream;
// }

const withMergeMap = 4;
// const history = from(
// this.fetchHistory(
//     virtualDeviceId,
//     metricsAttributeId,
//     startTime,
//     endTime,
// ),
// ).pipe(
//     mergeMap(history => {

//         if (!history.length) {
//             return EMPTY;
//         }

//         return [
//             this.toSseEvent(
//                 'HISTORY',
//                 metricsAttributeId,
//                 history,
//             ),
//         ];
//     }),
// );

const withMap = 3;
// const history = from(
// this.fetchHistory(
//     virtualDeviceId,
//     metricsAttributeId,
//     startTime,
//     endTime,
// ),
// ).pipe(
//     // filter(history => history.length > 0),
//     map(history =>
//         this.toSseEvent(
//             'HISTORY',
//             metricsAttributeId,
//             history,
//         ),
//     ),
// );




