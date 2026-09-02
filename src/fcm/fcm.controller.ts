import { Controller, Get, Post, Query } from "@nestjs/common";
import { FcmService } from "./fcm.service";

@Controller('fcm')
export class FcmController {

    // for fcm use firebase or firebase/fcm folders


    constructor(
        private readonly fcmService: FcmService,
    ) { }

    @Post('register')
    async register(
        @Query('orgId') orgId: string,
        @Query('fcmToken') fcmToken: string,

    ) {
        return await this.fcmService.register(orgId, fcmToken);
    }

    @Get('token')
    async getTokenFromOrgId(
        @Query('orgId') orgId: string
    ) {
        return await this.fcmService.getTokensByOrgId(orgId);
    }
}