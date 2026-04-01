import { PartialType } from '@nestjs/mapped-types';
import { CreateAuditDateTimeDto } from './create-audit_date_time.dto';

export class UpdateAuditDateTimeDto extends PartialType(
  CreateAuditDateTimeDto,
) {}
