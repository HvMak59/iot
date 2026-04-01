import { PartialType } from '@nestjs/mapped-types';
import { VirtualDevice } from 'src/virtual-device/entities/virtual-device.entity';

export class FindVirtualDeviceDto extends PartialType(VirtualDevice) { }
