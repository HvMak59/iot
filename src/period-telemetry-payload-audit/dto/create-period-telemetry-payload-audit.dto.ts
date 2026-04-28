import { PartialType } from '@nestjs/mapped-types';
import { PeriodTelemetryPayloadAudit } from '../entities/period-telemetry-payload-audit.entity';

export class CreatePeriodTelemetryPayloadAuditDto extends PartialType(
  PeriodTelemetryPayloadAudit,
) {}
