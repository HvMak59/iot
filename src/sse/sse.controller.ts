// telemetry-sse.controller.ts
import { Controller, Post, Query, Sse } from '@nestjs/common';
import { SseService } from './sse.service';

@Controller('sse')
export class SseController {
    constructor(private readonly sseService: SseService) { }

    @Sse('stream')
    stream(
        // @Query('virtualDeviceId') virtualDeviceId: string,
        @Query('assetId') assetId: string,
        // @Query('metricsAttributeId') metricsAttributeId: string,
        // @Query('startTime') startTime?: string,
        // @Query('endTime') endTime?: string,
    ) {
        console.log('sse controller');

        return this.sseService.subscribe(
            assetId,
            // metricsAttributeId,
            // startTime ? Number(startTime) : undefined,
            // endTime ? Number(endTime) : undefined,
        );
    }

    @Post('publish')
    publish() {
        // this.sseService.publish("Lift:vd", []);
    }

    @Post('handle')
    handleEvent(@Query('assetId') assetId: string) {
        // return this.sseService.handleTelemetryInserted(assetId);
    }
}