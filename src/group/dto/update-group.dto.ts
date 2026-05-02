import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupDto } from './create-group.dto';

// So far, we used Partial type of entire entity in update. Let's try with Partial of create.
// Create is a partial type of entitre entity.
export class UpdateGroupDto extends PartialType(CreateGroupDto) {}
