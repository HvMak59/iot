import { PartialType } from '@nestjs/mapped-types';
import { VirtualDeviceGroup } from '../entities/virtual-device-group.entity';

export class CreateVirtualDeviceGroupDto extends PartialType(
  VirtualDeviceGroup,
) {}
