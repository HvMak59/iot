import { PartialType } from '@nestjs/mapped-types';
import { AlertMaster } from '../entities/alert-master.entity';

export class CreateAlertMasterDto extends PartialType(AlertMaster) {}
