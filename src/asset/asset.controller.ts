import { Controller, Get, Query } from "@nestjs/common";
import { winstonServerLogger } from "src/app_config/serverWinston.config";
import { AssetService } from "./asset.service";

@Controller('asset')
export class AssetController {
    private readonly logger = winstonServerLogger(AssetController.name);

    constructor(private readonly assetService: AssetService) { }

    @Get('phoneNumber')
    async getPhoneNumber(
        @Query('id') id: string
    ) {
        return this.assetService.findPhoneNumber(id);
    }
}
