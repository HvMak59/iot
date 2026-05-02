import { Module } from '@nestjs/common';
import { PeriodTelemetryPayloadAuditService } from './period-telemetry-payload-audit.service';
import { PeriodTelemetryPayloadAuditController } from './period-telemetry-payload-audit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodTelemetryPayloadAudit } from './entities/period-telemetry-payload-audit.entity';
import { TelemetryPayloadModule } from 'src/telemetry-payload/telemetry-payload.module';
import { GroupModule } from 'src/group/group.module';
import { MetricsAttributeModule } from 'src/metrics-attribute/metrics-attribute.module';
import { VirtualDeviceModule } from 'src/virtual-device/virtual.device.module';
import { MetricsAttributeAggregationModule } from 'src/metrics-attribute-aggregation/metrics-attribute-aggregation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PeriodTelemetryPayloadAudit]),
    TelemetryPayloadModule,
    GroupModule,
    MetricsAttributeModule,
    VirtualDeviceModule,
    MetricsAttributeAggregationModule
  ],
  controllers: [PeriodTelemetryPayloadAuditController],
  providers: [PeriodTelemetryPayloadAuditService],
  exports: [PeriodTelemetryPayloadAuditService],
})
export class PeriodTelemetryPayloadAuditModule { }
