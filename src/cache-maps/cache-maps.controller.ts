import { Controller, Get } from "@nestjs/common";
import { winstonServerLogger } from "src/app_config/serverWinston.config";
import { CacheMappingService } from "./cache-maps.service";

@Controller('cache-maps')
export class CacheMappingController {
    private readonly logger = winstonServerLogger(CacheMappingController.name);
    constructor(
        private readonly cacheMappingService: CacheMappingService,
    ) { }


    @Get('orgIds')
    async getOrgIds() {
        const r = await this.cacheMappingService.getOrgIds([
            'asset1', 'asset2', 'ChitraFilterPlant', 'compressor', 'FlowMeter', 'Lift', 'TestAsset'
        ]);
        console.log(r);
        return Object.fromEntries(r);
        // return await this.cacheMappingService.getOrgIds(['asset2']);
        // return await this.cacheMappingService.getOrgIds(['ChitraFilterPlant']);
        // return await this.cacheMappingService.getOrgIds(['compressor']);
        // return await this.cacheMappingService.getOrgIds(['FlowMeter']);
        // return await this.cacheMappingService.getOrgIds(['Lift']);
        // return await this.cacheMappingService.getOrgIds(['TestAsset']);
    }

}
