// import { PartialType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceModelMetricsAttributeFormulaDto } from './create-device-model-metrics-attributes-formula.dto';

export class UpdateDeviceModelMetricsAttributeFormulaDto extends PartialType(
  CreateDeviceModelMetricsAttributeFormulaDto,
) { }
