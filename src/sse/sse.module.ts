import { Module } from "@nestjs/common";
import { SseController } from "./sse.controller";
import { SseService } from "./sse.service";
import { TelemetryPayloadModule } from "src/telemetry-payload/telemetry-payload.module";
import { CurrentTelemetryPayloadModule } from "src/current-telemetry-payload/current-telemetry-payload.module";
import { TelemetryEventsListener } from "./sse-event.listener";
import { AssetCurrentPerformanceSourceModule } from "src/asset-current-performance-source/asset-current-performance-source.module";
import { DeviceTypeMetricsAttributeModule } from "src/device-type-metrics-attribute/device-type-metrics-attribute.module";


@Module({
    imports: [
        TelemetryPayloadModule,
        CurrentTelemetryPayloadModule,
        AssetCurrentPerformanceSourceModule,
        DeviceTypeMetricsAttributeModule
    ],
    controllers: [SseController],
    providers: [SseService, TelemetryEventsListener],
    exports: [SseService],
})
export class SseModule { }
