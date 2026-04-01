import { PartialType } from '@nestjs/mapped-types';
import { FindOptionsWhere } from 'typeorm';
import { MetricsAttributeFormula } from '../entities/metrics-attribute-formula.entity';

/* export class FindDeviceMetricsAttributeFormulaDto extends PartialType(
  DeviceMetricsAttributeFormula,
) {} */
export interface FindMetricsAttributeFormulaDto
  extends FindOptionsWhere<MetricsAttributeFormula> {}
