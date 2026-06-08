import { Body, Controller, Post, Query } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";

@Controller('firebase')
export class FirebaseController {

    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    @Post('send-message')
    async sendMessage(
        @Query('topic') topic: string,
        @Query('title') title: string,
        @Query('body') body: string,
        @Query('data') data: Record<string, string>,
    ) {
        // return await this.firebaseService.sendNotification(token, title, body, data);
        return await this.firebaseService.sendTopicNotification(topic, title, body, data);
    }

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
