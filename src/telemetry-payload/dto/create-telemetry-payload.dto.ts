import { PartialType } from "@nestjs/mapped-types"
import { TelemetryPayload } from "../entities/telemetry-payload.entity"

export class CreateTelemetryPayloadDto extends PartialType(TelemetryPayload) {}

