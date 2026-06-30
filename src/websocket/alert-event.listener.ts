import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AlertGateway } from '../websocket/alert.gateway';
import { AlertStatus } from 'src/utils/enums';
import { Alert } from 'src/alert/entities/alert.entity';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { AssetService } from 'src/asset/asset.service';
import _ from 'lodash';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class AlertEventsListener {
    constructor(
        private readonly assetService: AssetService,
        private readonly firebaseService: FirebaseService,
    ) { }

    private readonly logger = winstonServerLogger(AlertEventsListener.name);

    private readonly assetOrgMap = new Map<string, string>();

    private async sendAlertNotificationToFirebase(
        alertsInput: Alert[],
        status: AlertStatus,
    ) {

        const groupedByAsset = _.groupBy(
            alertsInput,
            alert => alert.assetId,
        );

        const assetIds = Object.keys(groupedByAsset);
        const missingAssetIds = [];

        for (const assetId of assetIds) {

            const cachedOrgId = this.assetOrgMap.get(assetId);

            if (cachedOrgId == undefined) {
                missingAssetIds.push(assetId);
            }
        }

        // parentOrg will be handled in that hierarchy function
        const assetOrgIdMap = await this.assetService.findAssetOrgIdMap(missingAssetIds);

        const orgAlertsMap = new Map<string, Alert[]>();

        for (const [assetId, alerts] of Object.entries(groupedByAsset)) {

            const orgId = this.assetOrgMap.get(assetId) ?? assetOrgIdMap.get(assetId);

            if (orgId == undefined) {
                this.logger.error(`No org found for asset ${assetId}`);
                continue;
            }

            this.assetOrgMap.set(assetId, orgId);

            const existingAlertsInMap = orgAlertsMap.get(orgId) || [];
            existingAlertsInMap.push(...alerts);

            orgAlertsMap.set(orgId, existingAlertsInMap);
        }

        const messages = [];

        for (const [orgId, alerts] of orgAlertsMap.entries()) {

            const body = alerts
                .map(alert => `${alert.message} on asset: ${alert.assetId}`)
                .join(', ');

            messages.push({
                topic: orgId,

                notification: {
                    title: status,
                    body,
                },

                data: {
                    status,
                    alerts: JSON.stringify(
                        alerts.map(alert => ({
                            assetId: alert.assetId,
                            deviceId: alert.deviceId,
                            virtualDeviceId: alert.virtualDeviceId,
                            alertId: alert.alertId,
                            message: alert.message,
                            openDateTime: alert.openDateTime,
                            closeDateTime: alert.closeDateTime,
                        })),
                    ),
                },
            });
        }

        if (messages.length === 0) {
            this.logger.debug('No messages to send');
            return;
        }

        try {
            console.log("messages", messages);
            const response = await this.firebaseService.sendNotificationToTopic(messages);

            this.logger.debug(`${response.successCount} notifications sent successfully`);
        }
        catch (error) {
            this.logger.debug('Notification sending failed', error);
        }
    }


    @OnEvent('alert.created')
    async handleCreated(alerts: Alert[]) {
        this.logger.debug('in created listener');

        await this.sendAlertNotificationToFirebase(
            alerts,
            AlertStatus.created,
        );
    }

    @OnEvent('alert.incremented')
    async handleIncremented(alerts: Alert[]) {
        this.logger.debug('in incremented listener');

        await this.sendAlertNotificationToFirebase(
            alerts,
            AlertStatus.incremented,
        );
    }

    @OnEvent('alert.closed')
    async handleClosed(alerts: Alert[]) {
        this.logger.debug('in closed listener');

        await this.sendAlertNotificationToFirebase(
            alerts,
            AlertStatus.closed,
        );
    }





    private working = 4;
    // @OnEvent('alert.created')
    // async handleCreated(createdAlerts: Alert[]) {
    //     this.logger.debug("in created listener");

    //     const groupedByAsset = _.groupBy(
    //         createdAlerts,
    //         alert => alert.assetId,
    //     );

    //     const orgAlertsMap = new Map<string, Alert[]>();

    //     for (const [assetId, alerts] of Object.entries(groupedByAsset)) {

    //         const orgId = await this.assetService.findOrgId(assetId);

    //         if (orgId == undefined) {
    //             this.logger.debug(`No orgId found for asset ${assetId}`);
    //             continue;
    //         }

    //         const existingAlerts = orgAlertsMap.get(orgId) || [];
    //         existingAlerts.push(...alerts);
    //         orgAlertsMap.set(orgId, existingAlerts);

    //     }

    //     const messages = [];

    //     for (const [orgId, alerts] of orgAlertsMap.entries()) {

    //         const body = alerts.map(
    //             alert => `${alert.message} on asset ${alert.assetId}`,
    //         ).join(', ');

    //         messages.push({
    //             topic: orgId,

    //             notification: {
    //                 title: AlertStatus.created,
    //                 body,
    //             },

    //             data: {
    //                 status: AlertStatus.created,
    //                 alerts: JSON.stringify(
    //                     alerts.map(alert => ({
    //                         assetId: alert.assetId,
    //                         deviceId: alert.deviceId,
    //                         alertId: alert.alertId,
    //                         message: alert.message,
    //                         openDateTime: alert.openDateTime,
    //                         closeDateTime: alert.closeDateTime
    //                     })),
    //                 ),
    //             },
    //         });
    //     }

    //     if (messages.length === 0) {
    //         return;
    //     }

    //     try {

    //         const response = await this.firebaseService.sendToTopic(messages);

    //         this.logger.debug(
    //             `${response.successCount} notifications sent successfully`,
    //         );

    //     } catch (error) {

    //         this.logger.debug(
    //             'Bulk firebase notification sending failed',
    //             error,
    //         );
    //     }
    // }

    // @OnEvent('alert.incremented')
    // async handleIncremented(incrementdAlerts: Alert[]) {

    //     this.logger.debug('in incremented listener');

    //     const groupedByAsset = _.groupBy(
    //         incrementdAlerts,
    //         alert => alert.assetId,
    //     );

    //     const orgAlertsMap = new Map<string, Alert[]>();

    //     for (const [assetId, alerts] of Object.entries(groupedByAsset)) {

    //         const orgId = await this.assetService.findOrgId(assetId);

    //         if (orgId == undefined) {
    //             this.logger.debug(`No orgId found for asset ${assetId}`);
    //             continue;
    //         }

    //         const existingAlerts = orgAlertsMap.get(orgId) || [];

    //         existingAlerts.push(...alerts);

    //         orgAlertsMap.set(orgId, existingAlerts);

    //     }

    //     const messages = [];

    //     for (const [orgId, alerts] of orgAlertsMap.entries()) {

    //         const body = alerts.map(
    //             alert => `${alert.message} on asset ${alert.assetId}`,
    //         ).join(', ');

    //         messages.push({
    //             topic: orgId,

    //             notification: {
    //                 title: AlertStatus.INCREMENTED,
    //                 body,
    //             },

    //             data: {
    //                 status: AlertStatus.INCREMENTED,
    //                 alerts: JSON.stringify(
    //                     alerts.map(alert => ({
    //                         assetId: alert.assetId,
    //                         deviceId: alert.deviceId,
    //                         alertId: alert.alertId,
    //                         message: alert.message,
    //                         openDateTime: alert.openDateTime,
    //                         closeDateTime: alert.closeDateTime
    //                     })),
    //                 ),
    //             },
    //         });
    //     }

    //     if (messages.length === 0) {
    //         return;
    //     }

    //     try {
    //         const response = await this.firebaseService.sendToTopic(messages);

    //         this.logger.debug(
    //             `${response.successCount} notifications sent successfully`,
    //         );

    //     } catch (error) {

    //         this.logger.debug(
    //             'Bulk firebase notification sending failed',
    //             error,
    //         );
    //     }
    // }

    // @OnEvent('alert.closed')
    // async handleClosed(closedAlerts: Alert[]) {
    //     this.logger.debug('in closed listener');

    //     const groupedByAsset = _.groupBy(
    //         closedAlerts,
    //         alert => alert.assetId,
    //     );

    //     const orgAlertsMap = new Map<string, Alert[]>();

    //     for (const [assetId, alerts] of Object.entries(groupedByAsset)) {

    //         const orgId = await this.assetService.findOrgId(assetId);

    //         if (orgId == undefined) {
    //             this.logger.debug(`No orgId found for asset ${assetId}`);
    //             continue;
    //         }

    //         const existingAlerts = orgAlertsMap.get(orgId) || [];

    //         existingAlerts.push(...alerts);

    //         orgAlertsMap.set(orgId, existingAlerts);

    //     }

    //     const messages = [];

    //     for (const [orgId, alerts] of orgAlertsMap.entries()) {

    //         const body = alerts.map(
    //             alert => `${alert.message} on asset ${alert.assetId}`,
    //         ).join(', ');

    //         messages.push({
    //             topic: orgId,

    //             notification: {
    //                 title: AlertStatus.CLOSED,
    //                 body,
    //             },

    //             data: {
    //                 status: AlertStatus.CLOSED,
    //                 alerts: JSON.stringify(
    //                     alerts.map(alert => ({
    //                         assetId: alert.assetId,
    //                         deviceId: alert.deviceId,
    //                         alertId: alert.alertId,
    //                         message: alert.message,
    //                         openDateTime: alert.openDateTime,
    //                         closeDateTime: alert.closeDateTime
    //                     })),
    //                 ),
    //             },
    //         });
    //     }

    //     if (messages.length === 0) {
    //         return;
    //     }

    //     try {
    //         const response = await this.firebaseService.sendToTopic(messages);

    //         this.logger.debug(
    //             `${response.successCount} notifications sent successfully`,
    //         );

    //     } catch (error) {

    //         this.logger.debug(
    //             'Bulk firebase notification sending failed',
    //             error,
    //         );
    //     }
    // }


    private old = 4;
    // for phoneNumbers 
    // @OnEvent('alert.closed')
    // async handleClosed(payload: { assetId: string; alerts: Alert[] }) {
    //     this.logger.debug("in closed listener");
    //     this.alertGateway.sendAlerts(
    //         payload.assetId,
    //         AlertStatus.CLOSED,
    //         payload.alerts,
    //     );

    //     this.logger.debug("assetId", payload.assetId);
    //     const phoneNumber = await this.assetService.findPhoneNumber(payload.assetId);

    //     // uncomment this this is correct ....commented just for test
    //     // await this.whatsAppService.sendMessage(phoneNumber!, AlertStatus.CLOSED, payload.alerts);
    // }


    // @OnEvent('alert.incremented')
    // async handleIncremented(payload: { assetId: string; alerts: Alert[] }) {
    //     this.logger.debug("in incremented listener");
    //     // this.alertGateway.sendAlerts(
    //     //     payload.assetId,
    //     //     // payload.orgId,
    //     //     AlertStatus.INCREMENTED,
    //     //     payload.alerts,
    //     // );

    //     // this.logger.debug("assetId", payload.assetId);
    //     // const phoneNumber = await this.assetService.findPhoneNumber(payload.assetId);

    //     // uncomment this this is correct ....commented just for test
    //     // await this.whatsAppService.sendMessage(phoneNumber!, AlertStatus.INCREMENTED, payload.alerts);


    //     const orgId = await this.assetService.findOrgId(payload.assetId);
    //     this.logger.debug(orgId);
    //     const alerts = payload.alerts;

    //     // let body = '';

    //     // if (alerts.length <= 3) {
    //     //     body = alerts.map(a => a.message).join(', ');
    //     // } else {
    //     //     body = `${alerts.length} alerts created`;
    //     // }

    //     const bodyMessage = alerts.map(alert => ({
    //         assetId: alert.assetId,
    //         message: alert.message
    //     }))

    //     const body = JSON.stringify(bodyMessage);
    //     this.logger.debug(body);

    //     const message = alerts.map(alert => ({
    //         alertId: alert.alertId,
    //         virtualDeviceId: alert.virtualDeviceId,
    //         message: alert.message,
    //         level: alert.alertLevel,
    //         alertCount: alert.alertCount,
    //         openDateTime: alert.openDateTime,
    //     }));

    //     const data = JSON.stringify(message)

    //     await this.firebaseService.sendTopicNotification(
    //         orgId!,
    //         AlertStatus.INCREMENTED,
    //         body,
    //         {
    //             alerts: data
    //         }
    //     );

    //     // this is for firebase 
    //     // const orgId = await this.assetService.findOrgId(payload.assetId);
    //     // this.logger.debug(orgId);
    //     // const tokens = this.fcmService.getTokensByOrgId(orgId!);
    //     // this.logger.debug(tokens);
    //     // this.firebaseService.sendNotification(tokens, AlertStatus.INCREMENTED, 'Alert incremented', {});
    //     // this.firebaseService.sendTopicNotification(
    //     //     'alert',
    //     //     'alertCreated',
    //     //     'Needs attentions',
    //     //     {
    //     //         temp: '45',
    //     //     },
    //     // );
    // }


    // @OnEvent('alert.incremented')
    // async handleIncremented(incrementdAlerts: Alert[]) {

    //     this.logger.debug("in incremented listener");

    //     const orgMap = new Map<string, string>();

    //     for (const alert of incrementdAlerts) {

    //         try {
    //             let orgId = orgMap.get(alert.assetId);

    //             if (orgId == undefined) {
    //                 orgId = await this.assetService.findOrgId(alert.assetId);
    //                 orgMap.set(alert.assetId, orgId!);
    //             }

    //             const body = `${alert.message} alert incrementd on asset: ${alert.assetId}`;

    //             const data = JSON.stringify({
    //                 assetId: alert.assetId,
    //                 deviceId: alert.deviceId,
    //                 alertId: alert.alertId,
    //                 message: alert.message,
    //                 openDateTime: alert.openDateTime,
    //                 closeDateTime: alert.closeDateTime,
    //             });

    //             await this.firebaseService.sendTopicNotification(
    //                 orgId!,
    //                 AlertStatus.INCREMENTED,
    //                 body,
    //                 {
    //                     alerts: data,
    //                 },
    //             );

    //         } catch (error) {

    //             this.logger.debug(
    //                 `Failed to send incremented alert notification for asset ${alert.assetId}`,
    //                 error,
    //             );

    //         }
    //     }
    // }



}


//  Alert {
//     alertId: 'rmuOffline',
//     alertLevel: null,
//     assetId: 'Lift',
//     deviceId: 'mfg1:dt1:dm1:sr2',
//     virtualDeviceId: 'Lift:vd',
//     message: 'Rmu is offline',
//     proposedSolution: 'Restart rmu',
//     possibleCause: 'Rmu is not getting power',
//     openDateTime: 1779775188866,
//     id: 'Lift:Lift:vd::rmuOffline:',
//     searchTerm: 'rmuOffline:Lift:mfg1:dt1:dm1:sr2:Lift:vd:Rmu is offline:Restart rmu:Rmu is not getting power',
//     alertType: null,
//     sourceAttribute: null,
//     closeDateTime: null,
//     updatedBy: null,
//     deletedBy: null,
//     auditDateTime: AuditDateTime {
//       updatedAt: 1779775189147,
//       createdAt: 1779775189147,
//       deletedAt: null
//     },
//     alertCount: 1,
//     createdBy: 'System'
//  }

const f = 5;

//  {
//     id: 'Lift:Lift:vd::rmuOffline:Mon May 25 2026 11:04:45 GMT+0530 (India Standard Time)',
//     alertId: 'rmuOffline',
//     alertType: null,
//     alertLevel: null,
//     assetId: 'Lift',
//     deviceId: 'mfg1:dt1:dm1:sr2',
//     virtualDeviceId: 'Lift:vd',
//     sourceAttribute: null,
//     message: 'Rmu is offline',
//     proposedSolution: 'Restart rmu',
//     possibleCause: 'Rmu is not getting power',
//     openDateTime: 1779687285605,
//     closeDateTime: undefined,
//     alertCount: 10,
//     searchTerm: 'rmuOffline:Lift:mfg1:dt1:dm1:sr2:Lift:vd:Rmu is offline:Restart rmu:Rmu is not getting power',
//     createdBy: 'System',
//     updatedBy: null,
//     deletedBy: null,
//     auditDateTime: AuditDateTime {
//       createdAt: 1779687285963,
//       updatedAt: 1779687285963,
//       deletedAt: null
//     }
//   }

