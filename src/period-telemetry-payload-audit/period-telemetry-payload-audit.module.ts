import { Module } from '@nestjs/common';
import { PeriodTelemetryPayloadAuditService } from './period-telemetry-payload-audit.service';
import { PeriodTelemetryPayloadAuditController } from './period-telemetry-payload-audit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodTelemetryPayloadAudit } from './entities/period-telemetry-payload-audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PeriodTelemetryPayloadAudit])],
  controllers: [PeriodTelemetryPayloadAuditController],
  providers: [PeriodTelemetryPayloadAuditService],
  exports: [PeriodTelemetryPayloadAuditService],
})
export class PeriodTelemetryPayloadAuditModule {}
