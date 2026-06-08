// telemetry-sse.controller.ts
import { Controller, Post, Query, Sse } from '@nestjs/common';
import { SseService } from './sse.service';

@Controller('sse')
export class SseController {
    constructor(private readonly sseService: SseService) { }

    @Sse('stream')
    stream(
        @Query('virtualDeviceId') virtualDeviceId: string,
        @Query('metricsAttributeId') metricsAttributeId: string,
        @Query('startTime') startTime?: string,
        @Query('endTime') endTime?: string,
    ) {
        console.log('sse controller');
        console.log(
            virtualDeviceId,
            metricsAttributeId,
            startTime,
            endTime,
        );

        return this.sseService.subscribe(
            virtualDeviceId,
            metricsAttributeId,
            startTime ? Number(startTime) : undefined,
            endTime ? Number(endTime) : undefined,
        );
    }

    @Post('publish')
    publish() {
        this.sseService.publish("Lift:vd", []);
    }
}