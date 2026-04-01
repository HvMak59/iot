import { PartialType } from '@nestjs/mapped-types';
import { CreateAlertDto } from './create-alert.dto';

export class UpdateAlertDto extends PartialType(CreateAlertDto) {
  constructor(updateAlertDto: UpdateAlertDto) {
    super(updateAlertDto);
    Object.assign(this, updateAlertDto);
  }
}
