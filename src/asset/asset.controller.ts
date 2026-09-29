import { Body, Controller, Get, Patch, Query } from "@nestjs/common";
import { winstonServerLogger } from "src/app_config/serverWinston.config";
import { AssetService } from "./asset.service";
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from "src/app_config/constants";
import { UserId } from "src/utils/req-user-id.decorator";
import { UpdateAssetDto } from "./dto/update-asset.dto";

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

    @Patch()
    update(
        @UserId() userId: string,
        @Query('id') id: string,
        @Body() updateAssetDto: UpdateAssetDto
    ) {
        const fnName = this.update.name;
        const input = `Input : Id : ${id}, updateAssetDto: ${JSON.stringify(updateAssetDto)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        if (userId == null) {
            this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
            throw new Error(USER_NOT_IN_REQUEST_HEADER);
        }
        else {
            updateAssetDto.updatedBy = userId;
            this.logger.debug(`${fnName}: Calling update service`)
            return this.assetService.update(id, updateAssetDto);
        }
    }

    @Get('id')
    async findOneById(@Query('id') id: string) {
        return this.assetService.findOneById(id)
    }

    @Patch('changeOrg')
    changeOrg(
        @Query('assetId') assetId: string,
        @Query('orgId') orgId: string,
    ) {
        return this.assetService.linkAssetWthNewOrg(assetId, orgId);
    }
}



