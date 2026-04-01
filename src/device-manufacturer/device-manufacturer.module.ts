import { Module } from '@nestjs/common';
import { DeviceManufacturerService } from './device-manufacturer.service';
import { DeviceManufacturerController } from './device-manufacturer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceManufacturer } from './entities/device-manufacturer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceManufacturer])],
  controllers: [DeviceManufacturerController],
  providers: [DeviceManufacturerService]
})
export class DeviceManufacturerModule {}
