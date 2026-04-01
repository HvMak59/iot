import { PartialType } from '@nestjs/mapped-types';
import { CreateCurrentOpenAlertDto } from './create-current-open-alert.dto';

export class UpdateCurrentOpenAlertDto extends PartialType(
  CreateCurrentOpenAlertDto,
) {}
