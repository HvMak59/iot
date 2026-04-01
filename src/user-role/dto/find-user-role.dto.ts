import { PartialType } from '@nestjs/mapped-types';
import { FindOptionsWhere } from 'typeorm';
import { UserRole } from '../entities/user-role.entity';

export interface FindUserRoleDto extends FindOptionsWhere<UserRole> {}
