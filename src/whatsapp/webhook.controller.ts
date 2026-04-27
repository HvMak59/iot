import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    Post,
    Query,
    Res,
} from '@nestjs/common';
import { Response } from 'express';

@Controller('webhook')
export class WebhookController {
    @Get()
    verifyWebhook(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
        @Res() res: Response,
    ) {
        // const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
        const verifyToken = 'secretforwhatsapp';

        if (mode === 'subscribe' && token === verifyToken) {
            return res.status(200).send(challenge);
        }

        return res.sendStatus(403);
    }

    @Post()
    @HttpCode(200)
    receiveWebhook(@Body() body: any, @Res() res: Response) {
        try {
            const entry = body?.entry?.[0];
            const change = entry?.changes?.[0];
            const value = change?.value;

            if (value?.statuses) {
                for (const status of value.statuses) {
                    console.log('Message status event:', {
                        messageId: status.id,
                        recipient: status.recipient_id,
                        status: status.status,
                        timestamp: status.timestamp,
                        errors: status.errors || [],
                    });

                    // save to DB here
                }
            }

            if (value?.messages) {
                for (const message of value.messages) {
                    console.log('Incoming user message:', {
                        from: message.from,
                        type: message.type,
                        text: message.text?.body,
                        timestamp: message.timestamp,
                    });

                    // save reply to DB here
                }
            }

            return res.send('EVENT_RECEIVED');
        } catch (error) {
            console.error('Webhook parsing error:', error);
            return res.send('EVENT_RECEIVED');
        }
    }
}