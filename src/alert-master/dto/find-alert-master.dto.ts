import { FindOptionsWhere } from 'typeorm';
import { AlertMaster } from '../entities/alert-master.entity';

export interface FindAlertMasterDto extends FindOptionsWhere<AlertMaster> {}
