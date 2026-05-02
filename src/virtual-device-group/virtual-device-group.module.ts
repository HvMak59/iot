import { Module } from '@nestjs/common';
import { VirtualDeviceGroupService } from './virtual-device-group.service';
import { VirtualDeviceGroupController } from './virtual-device-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualDeviceGroup } from './entities/virtual-device-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VirtualDeviceGroup])],
  controllers: [VirtualDeviceGroupController],
  providers: [VirtualDeviceGroupService],
  exports: [TypeOrmModule.forFeature([VirtualDeviceGroup])],
})
export class VirtualDeviceGroupModule {}
