import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Alert } from 'src/alert/entities/alert.entity';
import { AssetService } from 'src/asset/asset.service';
import { AlertStatus, AlertType } from 'src/utils/enums';

@Injectable()
export class WhatsAppService {
    private accessToken = 'EAF3dzlLhJ2cBRAwKy6cHNQIP2YqtgR5ujbyXe3hcAKJeqExlhgiR1ZBJmD2nOtaKVhy4eHYMjCk1bNSaaQZAqX4zoPAOWkYap77BbzsoiLDIks7yEMSxYQlQsWZAA2QTeKHGzhXFd5mZCCkFesanxFCmRuyV0TqnvAZCsIm5UxyOZBJTtqWdwAZA0XYmphwRAZDZD';
    private phoneNumberId = '1045396935323347';

    constructor(
        private httpService: HttpService,
        private assetService: AssetService,
    ) { }

    private buildAlertsText(alerts: Alert[]): string {
        if (!alerts || alerts.length === 0) {
            return 'No alerts';
        }
        // 
        return alerts
            .map((alert, index) => {
                const alertId = alert.alertId;
                const sourceAttribute = alert.sourceAttribute;
                const assetId = alert.assetId;
                const alertMsg = alert.message;
                // 
                // return `${index + 1}. ${alertId} - ${sourceAttribute} (${assetId})`;
                return `${index + 1}. ${alertId} - ${alertMsg}`;
            })
            .join(', ')
            .slice(0, 1024);
    }

    async sendMessage(to: string, status: AlertStatus, alerts: Alert[]) {
        const url = `https://graph.facebook.com/v23.0/${this.phoneNumberId}/messages`;

        // const payload = {
        //     messaging_product: 'whatsapp',
        //     to,
        //     type: 'template',
        //     text: {
        //         body: message,
        //     },
        // };

        // Convert alerts array -> single string for WhatsApp template
        const alertsText = this.buildAlertsText(alerts);

        const phoneNumber = await this.assetService.findPhoneNumber('asset2');

        const payload = {
            messaging_product: 'whatsapp',
            // to: '916353921545',
            to: phoneNumber,
            type: 'template',
            template: {
                name: 'alert_triggered',
                language: {
                    code: 'en',
                },
                components: [
                    {
                        type: 'body',
                        parameters: [
                            {
                                type: 'text',
                                parameter_name: 'alerts',
                                text: alertsText,
                            },
                            {
                                type: 'text',
                                parameter_name: 'status',
                                text: status,
                            },
                        ],
                    },
                ],
            },
        };

        // for first demo msg 
        // const payload = {
        //     messaging_product: 'whatsapp',
        //     to: '916353921545',
        //     type: 'template',
        //     template: {
        //         name: 'hello_world',
        //         language: {
        //             code: 'en_US',
        //         },
        //     },
        // };

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