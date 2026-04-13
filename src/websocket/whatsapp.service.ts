import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WhatsAppService {
    private accessToken = 'EAF3dzlLhJ2cBRIvZByl66Sea0vvvZAiyGbzw5FUerjedSAumhC14FTgRDEDCrWZAIhZBsIIgXSZAghHyat2kE7nUebBewViLXSqEs5oqSdIDbjOJNDXc8s2hoRxLVkYkCH7tDpfGBTMMHUwffjeZAHq2kXO8ZCNo98d8gKYtciEcdqlnu53w94x1bqLZBgYT643sapWJw2ceIZBdHUefTZAscCXHjuoZAxoctAh0Ql41jWPsYixn0U1FP1FjCHCtUHQcaanmKxZAXtAURaKaNZCn30W7NmQZDZD';
    private phoneNumberId = '1045396935323347';

    constructor(private httpService: HttpService) { }

    async sendMessage(to: string, message: string) {
        const url = `https://graph.facebook.com/v23.0/${this.phoneNumberId}/messages`;

        // const payload = {
        //     messaging_product: 'whatsapp',
        //     to,
        //     type: 'template',
        //     text: {
        //         body: message,
        //     },
        // };

        const payload = {
            messaging_product: 'whatsapp',
            to: '916353921545',
            type: 'template',
            template: {
                name: 'hello_world',
                language: {
                    code: 'en_US',
                },
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
            return response.data;
        }
        catch (error) {
            console.error('Error sending WhatsApp message:', error.response?.data || error.message);
            throw error;
        }
    }
}