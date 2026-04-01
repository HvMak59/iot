import { PartialType } from '@nestjs/mapped-types';
import { CreateIotServerDto } from './create-iot-server.dto';

export class UpdateIotServerDto extends PartialType(CreateIotServerDto) {}
