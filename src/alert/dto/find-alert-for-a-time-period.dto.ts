import { PartialType } from '@nestjs/mapped-types';
import { Alert } from '../entities/alert.entity';

export class FindAlertForAPeriod extends PartialType(Alert) {
  startTime: number;
  endTime: number;

  constructor(findAlert: Partial<FindAlertForAPeriod>) {
    super();
    Object.assign(this, findAlert);
  }
}
