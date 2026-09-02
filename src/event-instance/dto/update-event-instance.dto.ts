import { PartialType } from '@nestjs/mapped-types';
import { CreateEventInstanceDto } from './create-event-instance.dto';

export class UpdateEventInstanceDto extends PartialType(CreateEventInstanceDto) { }
