import { Module } from '@nestjs/common';
import { AlertGateway } from '../websocket/alert.gateway';
import { AlertEventsListener } from './alert-event.listener';
import { OrgModule } from 'src/org/org.module';
import { WhatsAppService } from './whatsapp.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [OrgModule, HttpModule],
    providers: [AlertGateway, AlertEventsListener, WhatsAppService],
    exports: [AlertGateway, WhatsAppService],
})
export class WebsocketModule { }
