import { Module } from '@nestjs/common';
import { CurrentOpenAlertService } from './current-open-alert.service';
import { CurrentOpenAlertController } from './current-open-alert.controller';
import { CurrentOpenAlert } from './entities/current-open-alert.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CurrentOpenAlert])],
  controllers: [CurrentOpenAlertController],
  providers: [CurrentOpenAlertService],
  exports: [CurrentOpenAlertService],
})
export class CurrentOpenAlertModule {}
