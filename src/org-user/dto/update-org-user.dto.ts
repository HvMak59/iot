import { PartialType } from '@nestjs/mapped-types';
import { OrgUser } from '../entities/org-user.entity';

export class UpdateOrgUserDto extends PartialType(OrgUser) { }
