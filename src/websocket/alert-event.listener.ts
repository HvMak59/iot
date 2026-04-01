import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AlertGateway } from '../websocket/alert.gateway';
import { AlertStatus } from 'src/utils/enums';
import { Alert } from 'src/alert/entities/alert.entity';

@Injectable()
export class AlertEventsListener {
    constructor(private readonly alertGateway: AlertGateway) { }

    @OnEvent('alert.created')
    handleCreated(payload: { assetId: string; alerts: Alert[] }) {
        // handleCreated(payload: { orgId: string; alerts: Alert[] }) {
        console.log("in create listener");
        this.alertGateway.sendAlerts(
            payload.assetId,
            // payload.orgId,
            AlertStatus.CREATED,
            payload.alerts,
        );
    }

    @OnEvent('alert.closed')
    handleClosed(payload: { assetId: string; alerts: Alert[] }) {
        console.log("in closed listener");
        this.alertGateway.sendAlerts(
            payload.assetId,
            AlertStatus.CLOSED,
            payload.alerts,
        );
    }
    // 

    @OnEvent('alert.incremented')
    handleIncremented(payload: { assetId: string; alerts: Alert[] }) {
        // handleIncremented(payload: { orgId: string; alerts: Alert[] }) {
        console.log("in incremented listener");
        this.alertGateway.sendAlerts(
            payload.assetId,
            // payload.orgId,
            AlertStatus.INCREMENTED,
            payload.alerts,
        );
    }
}
