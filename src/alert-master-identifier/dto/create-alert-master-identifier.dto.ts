import { PartialType } from '@nestjs/mapped-types';
import { AlertMasterIdentifier } from '../entities/alert-master-identifier.entity';

export class CreateAlertMasterIdentifierDto extends PartialType(
  AlertMasterIdentifier,
) {}
