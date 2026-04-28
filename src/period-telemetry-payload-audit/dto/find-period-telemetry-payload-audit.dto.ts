import { PartialType } from '@nestjs/mapped-types';
import { FindOptionsWhere } from 'typeorm';
import { PeriodTelemetryPayloadAudit } from '../entities/period-telemetry-payload-audit.entity';

export interface FindPeriodTelemetryPayloadAuditDto
  extends FindOptionsWhere<PeriodTelemetryPayloadAudit> {
  periodDate?: number;
}
