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
import { Subject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
import { TelemetryDevice } from 'src/iot-server/dto/telemetry-device.dto';
import { FindTelemetryPayloadForAPeriod } from 'src/telemetry-payload/dto/find-telemetry-payload-for-a-period.dto';
import { TelemetryPayloadService } from 'src/telemetry-payload/telemetry-payload.service';
import { getMetricDTO } from 'src/utils/others';

@Injectable()
export class SseService {

    private readonly logger = winstonServerLogger(SseService.name);
    private readonly streams = new Map<string, Subject<MessageEvent>>();

    constructor(
        private readonly telemetryPayloadService: TelemetryPayloadService,
    ) { }

    subscribe(virtualDeviceId: string): Observable<MessageEvent> {

        let stream = this.streams.get(virtualDeviceId);

        if (!stream) {
            stream = new Subject<MessageEvent>();
            this.streams.set(virtualDeviceId, stream);
        }

        this.logger.debug(`Client subscribed: ${virtualDeviceId}`);

        // const liveStream = stream.pipe(
        return stream.pipe(
            finalize(() => {

                this.logger.debug(`Client disconnected: ${virtualDeviceId}`);

                if (!stream!.observed) {
                    this.streams.delete(virtualDeviceId);
                    this.logger.debug(`Removed stream: ${virtualDeviceId}`);
                }
            }),
        );
        // if (startTime !== undefined && endTime !== undefined) {
        //     const history = from(
        //         this.fetchHistory(
        //             virtualDeviceId,
        //             metricsAttributeId,
        //             startTime,
        //             endTime,
        //         ),
        //     ).pipe(
        //         filter(data => data.length > 0),
        //         map(data =>
        //             this.toSseEvent(
        //                 // 'HISTORY',
        //                 metricsAttributeId,
        //                 data,
        //             ),
        //         ),
        //     );
        //     return concat(history, liveStream);
        // }
        // return liveStream;
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

    publish(virtualDeviceId: string, payloads: CurrentTelemetryPayload[]) {
        const stream = this.streams.get(virtualDeviceId);

        if (!stream) return;

        const message = this.buildDto(payloads)

        stream.next(message);
    }

    private buildDto(payloads: CurrentTelemetryPayload[]): MessageEvent {
        const first = payloads[0];

        return {
            data: {
                telemetryDevice: TelemetryDevice.createFromTelemetry(first),
                metrics: payloads.map(p => getMetricDTO(p.metric)),
            },
        };
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