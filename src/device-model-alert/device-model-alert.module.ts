import { Module } from '@nestjs/common';
import { DeviceModelAlertService } from './device-model-alert.service';
import { DeviceModelAlertController } from './device-model-alert.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceModelAlert } from './entities/device-model-alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceModelAlert])],
  controllers: [DeviceModelAlertController],
  providers: [DeviceModelAlertService],
  exports: [DeviceModelAlertService],
})
export class DeviceModelAlertModule {}
