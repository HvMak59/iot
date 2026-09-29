import { PartialType } from "@nestjs/mapped-types"
import { TelemetryHeader } from "../entities/telemetry-header.entity"

export class CreateTelemetryHeaderDto extends PartialType(TelemetryHeader) { }

