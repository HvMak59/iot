import { Module } from '@nestjs/common';
import { VirtualDevice } from './entities/virtual-device.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualDeviceController } from './virtual-device.controller';
import { VirtualDeviceService } from './virtual-device.service';
import { DeviceModule } from 'src/device/device.module';
import { HttpModule } from '@nestjs/axios';
import { MetricsAttributeAggregationModule } from 'src/metrics-attribute-aggregation/metrics-attribute-aggregation.module';
import { VirtualDeviceGroupModule } from 'src/virtual-device-group/virtual-device-group.module';
import { GroupMetricsAttributeAggregationModule } from 'src/group-metrics-attribute-aggregation/group-metrics-attribute-aggregation.module';

@Module({
    imports: [TypeOrmModule.forFeature([VirtualDevice]), HttpModule, DeviceModule, MetricsAttributeAggregationModule, GroupMetricsAttributeAggregationModule, VirtualDeviceGroupModule],
    controllers: [VirtualDeviceController],
    providers: [VirtualDeviceService],
    exports: [VirtualDeviceService]
})
export class VirtualDeviceModule { }
