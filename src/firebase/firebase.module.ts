import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import { OrgModule } from 'src/org/org.module';

@Module({
    imports: [OrgModule],
    controllers: [FirebaseController],
    providers: [FirebaseService],
    exports: [FirebaseService],
})
export class FirebaseModule { }