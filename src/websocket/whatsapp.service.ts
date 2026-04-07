// import { Injectable, Logger } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { firstValueFrom } from 'rxjs';

// @Injectable()
// export class WhatsAppService {
//     private readonly logger = new Logger(WhatsAppService.name);

//     private readonly phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
//     private readonly accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
//     private readonly graphVersion = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';

//     constructor(private readonly httpService: HttpService) { }

//     async sendTextMessage(to: string, body: string) {
//         const url = `https://graph.facebook.com/${this.graphVersion}/${this.phoneNumberId}/messages`;

//         const payload = {
//             messaging_product: 'whatsapp',
//             to,
//             type: 'text',
//             text: {
//                 body,
//             },
//         };

//         try {
//             const response = await firstValueFrom(
//                 this.httpService.post(url, payload, {
//                     headers: {
//                         Authorization: `Bearer ${this.accessToken}`,
//                         'Content-Type': 'application/json',
//                     },
//                 }),
//             );

//             this.logger.log(`WhatsApp sent successfully to ${to}`);
//             return response.data;
//         } catch (error) {
//             this.logger.error(
//                 `Failed to send WhatsApp to ${to}`,
//                 error?.response?.data || error.message,
//             );
//             throw error;
//         }
//     }

//     // async sendTemplateMessage(to: string, templateName: string, bodyParams: string[]) {
//     //     // const url = `https://graph.facebook.com/${this.graphVersion}/${this.phoneNumberId}/messages`;
//     //     const url = `https://graph.facebook.com/v22.0/1019720401233622/messages`;

//     //     const payload = {
//     //         messaging_product: 'whatsapp',
//     //         to,
//     //         type: 'template',
//     //         template: {
//     //             name: templateName,
//     //             language: {
//     //                 code: 'en',
//     //             },
//     //             components: [
//     //                 {
//     //                     type: 'body',
//     //                     parameters: bodyParams.map((value) => ({
//     //                         type: 'text',
//     //                         text: value,
//     //                     })),
//     //                 },
//     //             ],
//     //         },
//     //     };

//     //     const response = await firstValueFrom(
//     //         this.httpService.post(url, payload, {
//     //             headers: {
//     //                 Authorization: `Bearer ${this.accessToken}`,
//     //                 'Content-Type': 'application/json',
//     //             },
//     //         }),
//     //     );

//     //     return response.data;
//     // }

//     async sendTemplateMessage(
//         to: string,
//         templateName: string,
//         bodyParams: string[] = [],
//     ) {
//         const url = `https://graph.facebook.com/v22.0/1019720401233622/messages`;

//         const components = bodyParams.length
//             ? [
//                 {
//                     type: 'body',
//                     parameters: bodyParams.map((value) => ({
//                         type: 'text',
//                         text: value,
//                     })),
//                 },
//             ]
//             : [];

//         const payload = {
//             messaging_product: 'whatsapp',
//             to,
//             type: 'template',
//             template: {
//                 name: templateName,
//                 language: {
//                     code: 'en',
//                 },
//                 ...(components.length ? { components } : {}),
//             },
//         };

//         try {
//             const response = await firstValueFrom(
//                 this.httpService.post(url, payload, {
//                     headers: {
//                         Authorization: `Bearer ${this.accessToken}`,
//                         'Content-Type': 'application/json',
//                     },
//                 }),
//             );

//             return response.data;
//         } catch (error: any) {
//             console.log('Meta error response:', error?.response?.data);
//             console.log('Meta error status:', error?.response?.status);
//             throw error;
//         }
//     }
// }



import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WhatsAppService {
    private readonly accessToken: string;
    private readonly phoneNumberId: string;
    private readonly graphVersion: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN')!;
        this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID')!;
        this.graphVersion = this.configService.get<string>('WHATSAPP_GRAPH_VERSION') || 'v22.0';
    }

    async sendTemplateMessage(
        to: string,
        templateName: string,
        languageCode = 'en_US',
    ) {
        const url = `https://graph.facebook.com/${this.graphVersion}/${this.phoneNumberId}/messages`;

        const payload = {
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
                name: templateName,
                language: {
                    code: languageCode,
                },
            },
        };

        try {
            const response = await firstValueFrom(
                this.httpService.post(url, payload, {
                    headers: {
                        // Authorization: `Bearer ${this.accessToken}`,
                        Authorization: `Bearer EAARbrlR0pXIBRDxADrRxCMVybzhYJqkV2oYOItVGplINuyLRw3PGd1T601C9L8QPrymXzwj33uXEcNeCVaJZCDDnYc55QHwyW2PuHtkhTt6V1ybz7pzFA7985v3RD3U1WT3I53EjSSojofhdduI8dfvb5QobNSU4VODd8V6KZCQHVCtIFT1CtnPICPJtCDwpJNncDXhnBOXmfrq9xb1BafQflo0NzQrkTZC20WtH5639daLJn7pxoFZCt9sNSU12Nw8ZAuQXwvTZAZBg5DiJCQVYZCJGEh43E3DgLQZDZD`,
                        'Content-Type': 'application/json',
                    },
                }),
            );

            return response.data;
        } catch (error: any) {
            console.log('Meta error status:', error?.response?.status);
            console.log(
                'Meta error response:',
                JSON.stringify(error?.response?.data, null, 2),
            );
            throw error;
        }
    }
}