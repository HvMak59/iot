import { Body, Controller, Post, Query } from "@nestjs/common";
import { winstonServerLogger } from "src/app_config/serverWinston.config";
import { TelemtryHeaderService } from "./telemtry-header.service";
import { CreateTelemetryHeaderDto } from "./dto/create-telemtry-header.dto";

@Controller('telemetry-header')
export class TelemetryHeaderController {
    private readonly logger = winstonServerLogger(TelemetryHeaderController.name);
    constructor(private readonly telemtryHeaderService: TelemtryHeaderService) { }

    @Post()
    create(@Body() createTelemetryHeaderDto: CreateTelemetryHeaderDto) {
        return this.telemtryHeaderService.create(createTelemetryHeaderDto);
    }

}
