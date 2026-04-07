import { Module } from '@nestjs/common';
import { AlertGateway } from '../websocket/alert.gateway';
import { AlertEventsListener } from './alert-event.listener';
import { OrgModule } from 'src/org/org.module';
import { WhatsAppService } from './whatsapp.service';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppController } from './whatsapp.controller';

@Module({
    imports: [OrgModule, HttpModule],
    controllers: [WhatsAppController],
    providers: [AlertGateway, AlertEventsListener, WhatsAppService, WhatsAppController],
    exports: [AlertGateway, WhatsAppService],
})
export class WebsocketModule { }
