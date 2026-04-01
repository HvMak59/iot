import { FindOptionsWhere } from 'typeorm';
import { AlertMasterIdentifier } from '../entities/alert-master-identifier.entity';

export interface FindAlertMasterIdentifierDto
  extends FindOptionsWhere<AlertMasterIdentifier> {}
