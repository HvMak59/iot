import { PartialType } from '@nestjs/mapped-types';
import { Org } from '../entities/org.entity';
// import { Org } from '../../../src/org/entities/org.entity';

export class UpdateOrgDto extends PartialType(Org) { }
