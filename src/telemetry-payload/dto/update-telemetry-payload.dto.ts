import { PartialType } from '@nestjs/mapped-types';
import { CreateTelemetryPayloadDto } from './create-telemetry-payload.dto';

export class UpdateTelemetryPayloadDto extends PartialType(CreateTelemetryPayloadDto) {}
