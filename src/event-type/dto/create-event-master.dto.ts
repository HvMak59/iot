import { PartialType } from '@nestjs/mapped-types';
import { EventType } from '../entities/event-type.entity';

export class CreateEventTypeDto extends PartialType(EventType) {}
