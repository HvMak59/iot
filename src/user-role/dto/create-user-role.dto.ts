import { PartialType } from '@nestjs/mapped-types';
import { UserRole } from '../entities/user-role.entity';

export class CreateUserRoleDto extends PartialType(UserRole) {}
