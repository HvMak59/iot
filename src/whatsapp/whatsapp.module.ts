import { Module } from '@nestjs/common';
import { AlertGateway } from '../websocket/alert.gateway';
import { OrgModule } from 'src/org/org.module';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppController } from '../whatsapp/whatsapp.controller';
import { AssetModule } from 'src/asset/asset.module';
import { WebhookController } from './webhook.controller';

@Module({
    imports: [AssetModule, HttpModule],
    controllers: [WhatsAppController, WebhookController],
    providers: [WhatsAppService],
    exports: [WhatsAppService],
})
export class WhatsAppModule { }
