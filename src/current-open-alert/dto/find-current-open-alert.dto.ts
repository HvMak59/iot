import { FindOptionsWhere } from 'typeorm';
import { CurrentOpenAlert } from '../entities/current-open-alert.entity';

export interface FindCurrentOpenAlertDto /* extends PartialType(CurrentOpenAlert) */
  extends FindOptionsWhere<CurrentOpenAlert> {}
