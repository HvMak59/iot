import { Module } from '@nestjs/common';
import { DeviceModelService } from './device-model.service';
import { DeviceModelController } from './device-model.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceModel } from './entities/device-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceModel])],
  controllers: [DeviceModelController],
  providers: [DeviceModelService],
  exports: [DeviceModelService],
})
export class DeviceModelModule {}
