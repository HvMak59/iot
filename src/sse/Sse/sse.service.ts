import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';

@Injectable()
export class SseService {

    private readonly logger = winstonServerLogger(SseService.name);
    private readonly streams = new Map<string, Subject<MessageEvent>>();

    constructor() { }

    subscribe(assetId: string): Observable<MessageEvent> {

        let stream = this.streams.get(assetId);

        if (!stream) {
            stream = new Subject<MessageEvent>();
            this.streams.set(assetId, stream);
        }

        this.logger.debug(`Client subscribed: ${assetId}`);

        return stream.pipe(
            finalize(() => {

                this.logger.debug(`Client disconnected: ${assetId}`);

                if (!stream!.observed) {
                    this.streams.delete(assetId);
                    this.logger.debug(`Removed stream: ${assetId}`);
                }
            }),
        );
    }

    publish(assetId: string, message: MessageEvent) {
        const stream = this.streams.get(assetId);
        if (!stream) {
            this.logger.error('No stream found for assetId:', assetId);
            return;
        }
        stream.next(message);
    }
}

