import { Controller, Get, Query } from "@nestjs/common";
import { winstonServerLogger } from "src/app_config/serverWinston.config";
import { AssetService } from "./asset.service";
import { KEY_SEPARATOR } from "src/app_config/constants";

@Controller('asset')
export class AssetController {
    private readonly logger = winstonServerLogger(AssetController.name);

    constructor(private readonly assetService: AssetService) { }

    @Get('phoneNumber')
    async getPhoneNumber(
        @Query('id') id: string
    ) {
        const fnName = this.getPhoneNumber.name;
        const input = `Input: Find user's phone number for this asset.`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);
        this.logger.debug("Calling findPhoneNumber service");
        // 
        return this.assetService.findPhoneNumber(id);
    }
}



