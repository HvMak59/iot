import { Module } from '@nestjs/common';
import { EventInstanceService } from './event-instance.service';
import { EventInstanceController } from './event-instance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventInstance } from './entities/event-instance.entity';
import { EventTypeModule } from 'src/event-type/event-type.module';
import { AlertModule } from 'src/alert/alert.module';

@Module({
  imports: [TypeOrmModule.forFeature([EventInstance]), EventTypeModule, AlertModule],
  controllers: [EventInstanceController],
  providers: [EventInstanceService],
})
export class EventInstanceModule { }
