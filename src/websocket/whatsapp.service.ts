import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WhatsAppService {
    private readonly logger = new Logger(WhatsAppService.name);

    private readonly phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    private readonly accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    private readonly graphVersion = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';

    constructor(private readonly httpService: HttpService) { }

    async sendTextMessage(to: string, body: string) {
        const url = `https://graph.facebook.com/${this.graphVersion}/${this.phoneNumberId}/messages`;

        const payload = {
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: {
                body,
            },
        };

        try {
            const response = await firstValueFrom(
                this.httpService.post(url, payload, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }),
            );

            this.logger.log(`WhatsApp sent successfully to ${to}`);
            return response.data;
        } catch (error) {
            this.logger.error(
                `Failed to send WhatsApp to ${to}`,
                error?.response?.data || error.message,
            );
            throw error;
        }
    }

    async sendTemplateMessage(to: string, templateName: string, bodyParams: string[]) {
        const url = `https://graph.facebook.com/${this.graphVersion}/${this.phoneNumberId}/messages`;

        const payload = {
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
                name: templateName,
                language: {
                    code: 'en',
                },
                components: [
                    {
                        type: 'body',
                        parameters: bodyParams.map((value) => ({
                            type: 'text',
                            text: value,
                        })),
                    },
                ],
            },
        };

        const response = await firstValueFrom(
            this.httpService.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            }),
        );

        return response.data;
    }
}