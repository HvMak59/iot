// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/mapped-types';
import { CreatePeriodTelemetryPayloadAuditDto } from './create-period-telemetry-payload-audit.dto';

export class UpdatePeriodTelemetryPayloadAuditDto extends PartialType(CreatePeriodTelemetryPayloadAuditDto) { }
