import { FindOptionsWhere } from 'typeorm';
import { OrgUser } from '../entities/org-user.entity';

export interface FindOrgUserDto extends FindOptionsWhere<OrgUser> { }
