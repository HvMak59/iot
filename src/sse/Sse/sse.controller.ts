import { Controller, Post, Query, Sse } from '@nestjs/common';
import { SseService } from '../sse.service';

@Controller('sse')
export class SseController {
    constructor(private readonly sseService: SseService) { }

    @Sse('stream')
    stream(@Query('assetId') assetId: string) {

        return this.sseService.subscribe(assetId);
    }

}