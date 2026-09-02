import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import { OrgModule } from 'src/org/org.module';
import { CacheMappingModule } from 'src/cache-maps/cache-maps.module';

@Module({
    imports: [OrgModule, CacheMappingModule],
    controllers: [FirebaseController],
    providers: [FirebaseService],
    exports: [FirebaseService],
})
export class FirebaseModule { }