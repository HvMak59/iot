import { PartialType } from '@nestjs/mapped-types';
import { FindOptionsWhere } from 'typeorm';
import { Group } from '../entities/group.entity';

/* export class FindDeviceGroupDto extends PartialType(DeviceGroup) {} */
export interface FindGroupDto extends FindOptionsWhere<Group> {}
