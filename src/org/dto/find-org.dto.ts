// import { Org } from '../../../src/org/entities/org.entity';
import { FindOptionsWhere } from 'typeorm';
import { Org } from '../entities/org.entity';

export interface FindOrgDto extends FindOptionsWhere<Org> { }
