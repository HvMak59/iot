import { Module } from '@nestjs/common';
import { DeviceTypeService } from './device-type.service';
import { DeviceTypeController } from './device-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceType } from './entities/device-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceType])],
  controllers: [DeviceTypeController],
  providers: [DeviceTypeService],
})
export class DeviceTypeModule {}
