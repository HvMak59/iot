import { Module } from '@nestjs/common';
import { AlertGateway } from '../websocket/alert.gateway';
import { AlertEventsListener } from './alert-event.listener';
import { OrgModule } from 'src/org/org.module';

@Module({
    imports: [OrgModule],
    providers: [AlertGateway, AlertEventsListener],
    exports: [AlertGateway],
})
export class WebsocketModule { }


// 