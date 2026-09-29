import { Module } from '@nestjs/common';
import { AssetModule } from 'src/asset/asset.module';
import { CacheMappingModule } from 'src/cache-maps/cache-maps.module';
import { EmailModule } from 'src/email/email.module';
import { EventInstanceModule } from 'src/event-instance/event-instance.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AlertEventsListener } from 'src/listeners/alert-event-listener';
import { WhatsAppModule } from 'src/whatsapp/whatsapp.module';

@Module({
    imports: [AssetModule, FirebaseModule, EventInstanceModule, WhatsAppModule, CacheMappingModule, EmailModule],
    controllers: [],
    providers: [AlertEventsListener],
    exports: [AlertEventsListener],
})
export class ListenertModule { }
