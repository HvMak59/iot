import { PartialType } from "@nestjs/mapped-types"
import { DeviceType } from "src/device-type/entities/device-type.entity"

export class UpdateDeviceTypeDto extends PartialType(DeviceType) {}
