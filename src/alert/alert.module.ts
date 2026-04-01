import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { Alert } from './entities/alert.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsocketModule } from 'src/websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), WebsocketModule],
  controllers: [AlertController],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule { }
