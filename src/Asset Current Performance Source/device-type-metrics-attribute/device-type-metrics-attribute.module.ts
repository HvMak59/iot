import { Module } from '@nestjs/common';
import { DeviceTypeMetricsAttributeService } from './device-type-metrics-attribute.service';
import { DeviceTypeMetricsAttributeController } from './device-type-metrics-attribute.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceTypeMetricsAttribute } from './entities/device-type-metrics-attribute.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceTypeMetricsAttribute])],
  controllers: [DeviceTypeMetricsAttributeController],
  providers: [DeviceTypeMetricsAttributeService],
  exports: [DeviceTypeMetricsAttributeService],
})
export class DeviceTypeMetricsAttributeModule {}
