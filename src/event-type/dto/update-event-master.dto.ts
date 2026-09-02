// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventTypeDto } from './create-event-master.dto';

export class UpdateEventTypeDto extends PartialType(CreateEventTypeDto) { }
