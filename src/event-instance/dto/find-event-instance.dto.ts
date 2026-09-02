import { FindOptionsWhere } from 'typeorm';
import { EventInstance } from '../entities/event-instance.entity';

export interface FindEventInstanceDto extends FindOptionsWhere<EventInstance> { }
