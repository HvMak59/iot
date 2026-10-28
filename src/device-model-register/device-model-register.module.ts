import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetricsAttributeAdaptor } from '../metrics-attribute-adaptor/entities/metrics-attribute-adaptor.entity';
import { DeviceModelRegister } from './entities/device-model-register.entity';
import { DeviceModelRegisterController } from './device-model-register.controller';
import { DeviceModelRegisterService } from './device-model-register.service';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            DeviceModelRegister,
            MetricsAttributeAdaptor,
        ]),
    ],
    controllers: [DeviceModelRegisterController],
    providers: [DeviceModelRegisterService],
    exports: [DeviceModelRegisterService],
})
export class DeviceModelRegisterModule { }