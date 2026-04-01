import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceModelAlertDto } from './create-device-model-alert.dto';

export class UpdateDeviceModelAlertDto extends PartialType(
  CreateDeviceModelAlertDto,
) {}
