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

        console.log("assetId", payload.assetId);
        const phoneNumber = await this.assetService.findPhoneNumber(payload.assetId);

        // uncomment this this is correct ....commented just for test
        // await this.whatsAppService.sendMessage(phoneNumber!, AlertStatus.CREATED, payload.alerts);
    }

    @OnEvent('alert.closed')
    async handleClosed(payload: { assetId: string; alerts: Alert[] }) {
        console.log("in closed listener");
        this.alertGateway.sendAlerts(
            payload.assetId,
            AlertStatus.CLOSED,
            payload.alerts,
        );

        console.log("assetId", payload.assetId);
        const phoneNumber = await this.assetService.findPhoneNumber(payload.assetId);

        // uncomment this this is correct ....commented just for test
        // await this.whatsAppService.sendMessage(phoneNumber!, AlertStatus.CLOSED, payload.alerts);
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

        console.log("assetId", payload.assetId);
        const phoneNumber = await this.assetService.findPhoneNumber(payload.assetId);

        // uncomment this this is correct ....commented just for test
        // await this.whatsAppService.sendMessage(phoneNumber!, AlertStatus.INCREMENTED, payload.alerts);
    }
}


