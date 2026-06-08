import { Module } from "@nestjs/common";
import { SseController } from "./sse.controller";
import { SseService } from "./sse.service";
import { TelemetryPayloadModule } from "src/telemetry-payload/telemetry-payload.module";
import { CurrentTelemetryPayloadModule } from "src/current-telemetry-payload/current-telemetry-payload.module";
import { TelemetryEventsListener } from "./sse-event.listener";


@Module({
    imports: [TelemetryPayloadModule, CurrentTelemetryPayloadModule],
    controllers: [SseController],
    providers: [SseService, TelemetryEventsListener],
    exports: [SseService],
})
export class SseModule { }
