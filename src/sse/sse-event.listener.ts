import { SseService } from "src/sse/sse.service";
import { CurrentTelemetryPayloadService } from "../current-telemetry-payload/current-telemetry-payload.service";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CurrentTelemetryPayload } from "../current-telemetry-payload/entities/current-telemetry-payload.entity";
import { KEY_SEPARATOR } from "src/app_config/constants";
import { winstonServerLogger } from "src/app_config/serverWinston.config";

@Injectable()
export class TelemetryEventsListener {

    private readonly logger = winstonServerLogger(TelemetryEventsListener.name);

    constructor(
        private readonly telemetrySseService: SseService,  // ← swapped
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
    ) { }

    @OnEvent('telemetry.inserted')
    async handleTelemetryInserted(payloads: CurrentTelemetryPayload[]) {
        console.log("listener");
        if (!payloads || payloads.length === 0) return;

        const currentTeleMPylds = await this.currentTelemetryPayloadService.findByIds(payloads.map(s => s.id));

        const groupedByVdAndMtrcId = new Map<string, CurrentTelemetryPayload[]>();

        for (const payload of currentTeleMPylds) {
            const vd = payload.virtualDeviceId;
            const metricId = payload.metric?.metricsAttributeId;

            if (!vd && !metricId) {
                this.logger.error(`virtualDevice or metricId missing`);
                continue;
            }
            const key = vd + KEY_SEPARATOR + metricId;

            if (!groupedByVdAndMtrcId.has(key)) {
                groupedByVdAndMtrcId.set(key, []);
            }

            groupedByVdAndMtrcId.get(key)!.push(payload);
        }

        for (const [key, devicePayloads] of groupedByVdAndMtrcId.entries()) {
            console.log("Calling sse");
            this.telemetrySseService.publish(key, devicePayloads);
        }
    }
}