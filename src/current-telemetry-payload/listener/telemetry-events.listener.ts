import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CurrentTelemetryPayload } from '../entities/current-telemetry-payload.entity';
// import { TelemetryGateway } from 'src/websockets/old_telemetry.gateway';
import { CurrentTelemetryPayloadService } from '../current-telemetry-payload.service';

@Injectable()
export class TelemetryEventsListener {
    constructor(
        // private readonly telemetryGateway: TelemetryGateway,
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
    ) { }

    private first = 4
    // @OnEvent('telemetry.inserted')
    // async handleTelemetryInserted(payload: CurrentTelemetryPayload) {
    //     console.log("In Listener")
    //     const virtualDeviceId = payload.virtualDeviceId;

    //     if (!virtualDeviceId) return;

    //     const r = await this.currentTelemetryPayloadService.findById(payload.id);
    //     this.telemetryGateway.sendToWebSocket(
    //         virtualDeviceId,
    //         // [payload],
    //         r,
    //     );
    //     // 
    // }

    private second = 4;
    @OnEvent('telemetry.inserted')
    async handleTelemetryInserted(
        payloads: CurrentTelemetryPayload[],
    ) {
        console.log('In Listener');

        if (!payloads || payloads.length === 0) return;

        const currentTeleMPylds = await this.currentTelemetryPayloadService.findByIds(payloads.map(s => s.id))

        // Group by virtualDeviceId
        const groupedByVD = new Map<string, CurrentTelemetryPayload[]>();

        for (const payload of currentTeleMPylds) {
            if (!payload.virtualDeviceId) continue;

            if (!groupedByVD.has(payload.virtualDeviceId)) {
                groupedByVD.set(payload.virtualDeviceId, []);
            }

            groupedByVD.get(payload.virtualDeviceId)!.push(payload);
        }

        for (const [virtualDeviceId, devicePayloads] of groupedByVD.entries()) {
            // this.telemetryGateway.sendToWebSocket(
            //     virtualDeviceId,
            //     devicePayloads,
            // );
        }
    }

}
