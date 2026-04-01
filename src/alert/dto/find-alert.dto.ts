import { PartialType } from '@nestjs/mapped-types';
import { FindOptionsWhere } from 'typeorm';
import { Alert } from '../entities/alert.entity';

export interface FindAlertDto extends FindOptionsWhere<Alert> {}
