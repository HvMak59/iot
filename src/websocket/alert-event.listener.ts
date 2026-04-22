import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AlertGateway } from '../websocket/alert.gateway';
import { AlertStatus } from 'src/utils/enums';
import { Alert } from 'src/alert/entities/alert.entity';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { AssetService } from 'src/asset/asset.service';

@Injectable()
export class AlertEventsListener {
    constructor(
        private readonly alertGateway: AlertGateway,
        private readonly whatsAppService: WhatsAppService,
        private readonly assetService: AssetService,
    ) { }

    @OnEvent('alert.created')
    async handleCreated(payload: { assetId: string; alerts: Alert[] }) {
        // handleCreated(payload: { orgId: string; alerts: Alert[] }) {
        console.log("in create listener");
        this.alertGateway.sendAlerts(
            payload.assetId,
            // payload.orgId,
            AlertStatus.CREATED,
            payload.alerts,
        );
        const phoneNumber = await this.assetService.findPhoneNumber(payload.assetId);

        await this.whatsAppService.sendMessage(phoneNumber!, AlertStatus.CREATED, payload.alerts);
    }

    @OnEvent('alert.closed')
    async handleClosed(payload: { assetId: string; alerts: Alert[] }) {
        console.log("in closed listener");
        this.alertGateway.sendAlerts(
            payload.assetId,
            AlertStatus.CLOSED,
            payload.alerts,
        );
        const phoneNumber = await this.assetService.findPhoneNumber(payload.assetId);

        await this.whatsAppService.sendMessage(phoneNumber!, AlertStatus.CLOSED, payload.alerts);
    }
    // 

    @OnEvent('alert.incremented')
    async handleIncremented(payload: { assetId: string; alerts: Alert[] }) {
        // handleIncremented(payload: { orgId: string; alerts: Alert[] }) {
        console.log("in incremented listener");
        this.alertGateway.sendAlerts(
            payload.assetId,
            // payload.orgId,
            AlertStatus.INCREMENTED,
            payload.alerts,
        );
        const phoneNumber = await this.assetService.findPhoneNumber(payload.assetId);

        await this.whatsAppService.sendMessage(phoneNumber!, AlertStatus.INCREMENTED, payload.alerts);
    }


    private async sendWhatsAppForAlerts(
        assetId: string,
        status: AlertStatus,
        alerts: Alert[],
    ) {
        try {
            const recipient = '917698779298'; // fetch from assetid

            // const message = this.buildMessage(assetId, status, alerts);

            // await this.whatsAppService.sendTemplateMessage(  // need to test this 
            //     recipient,
            //     'alert_created_template',
            //     // [assetId, String(alerts.length), status],
            // );
        } catch (error) {
            console.log(
                `Failed sending WhatsApp for assetId=${assetId}`,
                error?.message || error,
            );
        }
    }


    private buildMessage(
        assetId: string,
        status: AlertStatus,
        alerts: Alert[],
    ) {
        const lines = alerts.slice(0, 5).map((alert, index) => {
            return `${index + 1}. Alert ID: ${alert.id}`;
        });

        return [
            `*Alert Update*`,
            `Asset ID: ${assetId}`,
            `Status: ${status}`,
            `Count: ${alerts.length}`,
            ...lines,
        ].join('\n');
    }
}


