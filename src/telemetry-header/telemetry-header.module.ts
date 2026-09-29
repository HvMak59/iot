import { Module } from "@nestjs/common";
import { TelemetryHeader } from "./entities/telemetry-header.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TelemetryHeaderController } from "./telemetry-header.controller";
import { TelemtryHeaderService } from "./telemtry-header.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TelemetryHeader
        ]),
    ],
    controllers: [TelemetryHeaderController],
    providers: [TelemtryHeaderService],
    exports: [TelemtryHeaderService],
})
export class TelemetryHeaderModule { }