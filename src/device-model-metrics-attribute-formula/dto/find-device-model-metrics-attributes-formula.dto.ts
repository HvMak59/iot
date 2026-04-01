import { PartialType } from '@nestjs/mapped-types';
import { FindOptionsWhere } from 'typeorm';
import { DeviceModelMetricsAttributeFormula } from '../entities/device-model-metrics-attribute-formula.entity';

export interface FindDeviceModelMetricsAttributeFormulaDto
  extends FindOptionsWhere<DeviceModelMetricsAttributeFormula> {}
