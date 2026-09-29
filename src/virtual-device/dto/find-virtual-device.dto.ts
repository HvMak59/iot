import { PartialType } from '@nestjs/mapped-types';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';
import { FindOptionsWhere } from 'typeorm';

// export class FindVirtualDeviceDto extends PartialType(VirtualDevice) { }
export interface FindVirtualDeviceDto extends FindOptionsWhere<VirtualDevice> { }


