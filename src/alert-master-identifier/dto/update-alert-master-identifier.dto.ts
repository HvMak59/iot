// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/mapped-types';
import { CreateAlertMasterIdentifierDto } from './create-alert-master-identifier.dto';

export class UpdateAlertMasterIdentifierDto extends PartialType(CreateAlertMasterIdentifierDto) { }
