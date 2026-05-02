import { FindOptionsWhere } from 'typeorm';
import { VirtualDeviceGroup } from '../entities/virtual-device-group.entity';

export interface FindVirtualDeviceGroupDto
  extends FindOptionsWhere<VirtualDeviceGroup> {}
