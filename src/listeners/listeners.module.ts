import { Module } from '@nestjs/common';
import { AssetModule } from 'src/asset/asset.module';
import { EventInstanceModule } from 'src/event-instance/event-instance.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AlertEventsListener } from 'src/listeners/alert-event-listener';

@Module({
    imports: [AssetModule, FirebaseModule, EventInstanceModule],
    controllers: [],
    providers: [AlertEventsListener],
    exports: [AlertEventsListener],
})
export class ListenertModule { }
