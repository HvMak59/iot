import { Module } from '@nestjs/common';
import { DeviceModelMetricsAttributeFormulaService } from './device-model-metrics-attribute-formula.service';
import { DeviceModelMetricsAttributeFormulaController } from './device-model-metrics-attribute-formula.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceModelMetricsAttributeFormula } from './entities/device-model-metrics-attribute-formula.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceModelMetricsAttributeFormula])],
  controllers: [DeviceModelMetricsAttributeFormulaController],
  providers: [DeviceModelMetricsAttributeFormulaService],
})
export class DeviceModelMetricsAttributeFormulaModule {}
