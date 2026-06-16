// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/mapped-types';
import { CreateAlertMasterDto } from './create-alert-master.dto';

export class UpdateAlertMasterDto extends PartialType(CreateAlertMasterDto) { }
