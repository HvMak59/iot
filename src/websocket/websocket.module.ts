import { Module } from '@nestjs/common';
import { AlertGateway } from '../websocket/alert.gateway';
// import { AlertEventsListener } from './alert-event.listener';
import { OrgModule } from 'src/org/org.module';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppController } from '../whatsapp/whatsapp.controller';
import { AssetService } from 'src/asset/asset.service';
import { AssetModule } from 'src/asset/asset.module';
import { WhatsAppModule } from 'src/whatsapp/whatsapp.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { FcmModule } from 'src/fcm/fcm.module';
import { AlertEventsListener } from 'src/listeners/alert-event-listener';
// import { AlertEventsListener } from 'src/firebase/fcm/alert-event-listener';

@Module({
    imports: [OrgModule, HttpModule, AssetModule, WhatsAppModule, FirebaseModule, FcmModule],
    controllers: [WhatsAppController],
    providers: [AlertGateway],
    exports: [AlertGateway],
})
export class WebsocketModule { }
