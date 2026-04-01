import { PartialType } from "@nestjs/mapped-types"
import { DeviceManufacturer } from "src/device-manufacturer/entities/device-manufacturer.entity"

export class UpdateDeviceManufacturerDto extends PartialType(DeviceManufacturer) {}
