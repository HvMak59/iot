import { FindOptionsWhere } from 'typeorm';
import { EventType } from '../entities/event-type.entity';

export interface FindEventTypeDto extends FindOptionsWhere<EventType> {}
