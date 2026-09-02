import { PartialType } from '@nestjs/mapped-types';
import { EventInstance } from '../entities/event-instance.entity';

export class CreateEventInstanceDto extends PartialType(EventInstance) {}
