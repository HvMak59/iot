import { Body, Controller, Post, Query } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";

@Controller('firebase')
export class FirebaseController {

    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    @Post('subscribe')
    async subscribe(
        @Body() body: {
            token: string;
            topic: string;
        },
    ) {

        return this.firebaseService.subscribeTokenToTopic(
            body.token,
            body.topic,
        );
    }
}
