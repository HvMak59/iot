import { PartialType } from "@nestjs/mapped-types"
import { CurrentTelemetryPayload } from "../entities/current-telemetry-payload.entity"

export class CreateCurrentTelemetryDto extends PartialType(CurrentTelemetryPayload) {}

