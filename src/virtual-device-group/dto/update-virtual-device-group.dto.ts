// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/mapped-types';
import { CreateVirtualDeviceGroupDto } from './create-virtual-device-group.dto';

export class UpdateVirtualDeviceGroupDto extends PartialType(CreateVirtualDeviceGroupDto) { }
