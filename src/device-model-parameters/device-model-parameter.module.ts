import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetricsAttributeAdaptor } from '../metrics-attribute-adaptor/entities/metrics-attribute-adaptor.entity';
import { DeviceModelParameterService } from './device-model-parameter.service';
import { DeviceModelParameter } from './entities/device-model-parameter.entity';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            DeviceModelParameter,
            MetricsAttributeAdaptor,
        ]),
    ],
    controllers: [

    ],
    providers: [
        DeviceModelParameterService,
    ],
    exports: [DeviceModelParameterService],
})
export class DeviceModelParameterModule { }