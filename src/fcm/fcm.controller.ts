import { Controller, Post, Query } from "@nestjs/common";
import { FcmService } from "./fcm.service";

@Controller('fcm')
export class FcmController {

    constructor(
        private readonly fcmService: FcmService,
    ) { }

    @Post('register')
    async register(
        @Query('orgId') orgId: string,
        @Query('fcmToken') fcmToken: string,
    ) {
        await this.fcmService.register(orgId, fcmToken);
    }
}