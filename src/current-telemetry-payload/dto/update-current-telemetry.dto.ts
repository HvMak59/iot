import { PartialType } from '@nestjs/mapped-types';
import { CreateCurrentTelemetryDto } from './create-current-telemetry.dto';

export class UpdateCurrentTelemetryDto extends PartialType(CreateCurrentTelemetryDto) {}
