import { Module } from '@nestjs/common';
import { VirtualDevice } from './entities/virtual-device.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([VirtualDevice])],
    controllers: [],
    providers: [],
    exports: []
})
export class VirtualDeviceModule { }
