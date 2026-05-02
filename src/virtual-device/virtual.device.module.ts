import { Module } from '@nestjs/common';
import { VirtualDevice } from './entities/virtual-device.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualDeviceController } from './virtual-device.controller';
import { VirtualDeviceService } from './virtual-device.service';
import { DeviceModule } from 'src/device/device.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [TypeOrmModule.forFeature([VirtualDevice]), HttpModule, DeviceModule],
    controllers: [VirtualDeviceController],
    providers: [VirtualDeviceService],
    exports: [VirtualDeviceService]
})
export class VirtualDeviceModule { }
