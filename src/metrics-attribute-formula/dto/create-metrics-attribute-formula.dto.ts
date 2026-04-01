import { PartialType } from '@nestjs/mapped-types';
import { MetricsAttributeFormula } from '../entities/metrics-attribute-formula.entity';

export class CreateMetricsAttributeFormulaDto extends PartialType(
  MetricsAttributeFormula,
) {}
