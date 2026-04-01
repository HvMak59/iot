import { PartialType } from '@nestjs/mapped-types';
import { DeviceModelMetricsAttributeFormula } from '../entities/device-model-metrics-attribute-formula.entity';

export class CreateDeviceModelMetricsAttributeFormulaDto extends PartialType(
  DeviceModelMetricsAttributeFormula,
) {}
