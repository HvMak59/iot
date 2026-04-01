import { Module } from '@nestjs/common';
import { AuditDateTimeService } from './audit_attribute.service';
import { AuditDateTimeController } from './audit_attribute.controller';

@Module({
  controllers: [AuditDateTimeController],
  providers: [AuditDateTimeService],
})
export class AuditDateTimeModule {}
