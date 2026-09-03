import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AlertStatus } from 'src/utils/enums';
import { Alert } from 'src/alert/entities/alert.entity';
import { AssetService } from 'src/asset/asset.service';
import _ from 'lodash';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CacheMappingService } from 'src/cache-maps/cache-maps.service';
import { EventInstanceService } from 'src/event-instance/event-instance.service';

@Injectable()
export class AlertEventsListener {
    constructor(
        private readonly assetService: AssetService,
        private readonly firebaseService: FirebaseService,
        private readonly cacheMappingService: CacheMappingService,
        private readonly eventInstanceService: EventInstanceService,
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
        // this service is available at the end of this code(commented code) 

        console.log("old", assetOrgIdMap);
        // const assetOrgMap = this.cacheMappingService.getOrgIds(assetIds);
        // console.log("new", assetOrgMap);

        const orgAlertsMap = new Map<string, Alert[]>();

        for (const [assetId, alerts] of Object.entries(groupedByAsset)) {

            const orgId = this.assetOrgMap.get(assetId) ?? assetOrgIdMap.get(assetId);

            if (orgId == undefined) {
                this.logger.error(`No org found for asset ${assetId}`);
                continue;
            }

            this.assetOrgMap.set(assetId, orgId);

            // we should inject that subsciber checking here 
            const hasSubscriber = this.cacheMappingService.hasSubscriberToTopic(orgId);

            if (hasSubscriber == false) {
                this.logger.error(`No subscriber found for the topic: ${orgId}`);
                continue;
            }

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
}



// import { Injectable } from '@nestjs/common';
// import { OnEvent } from '@nestjs/event-emitter';
// import { Alert } from 'src/alert/entities/alert.entity';
// import { AssetService } from 'src/asset/asset.service';
// import { FirebaseService } from 'src/firebase/firebase.service';
// // import { winstonServerLogger } from 'app_config/serverWinston.config';
// // import { CreatedAndClosedAlerts } from 'app_config/constants';
// // import { getTryCatchErrorStr } from 'utils/others';
// import { Message } from 'firebase-admin/messaging';
// import _ from 'lodash';
// import { CacheMappingService } from 'src/cache-maps/cache-maps.service';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { getTryCatchErrorStr } from 'src/utils/others';

// @Injectable()
// export class AlertEventsListener {
//     constructor(
//         private readonly assetService: AssetService,
//         private readonly firebaseService: FirebaseService,
//         private readonly cacheMappingService: CacheMappingService
//     ) { }

//     private readonly logger = winstonServerLogger(AlertEventsListener.name);

//     private readonly orgIdByAssetId = new Map<string, string>();

//     // @OnEvent(CreatedAndClosedAlerts)
//     async sendAlertNotificationToFirebase(
//         alertsInput: Alert[] /* ,
//     status: AlertStatus, */,
//     ) {
//         const fnName = this.sendAlertNotificationToFirebase.name;
//         const groupedByAsset: Record<string, Alert[]> = {};
//         const assetIdsWithMissingOrgIds = new Set<string>();

//         this.logger.debug(`${fnName} : Start`);

//         this.logger.debug(
//             `${fnName} Received number of alerts : ${alertsInput.length}`,
//         );

//         for (const alert of alertsInput) {
//             this.logger.debug(`${fnName} : Processing alert ID : ${alert.alertId}`);
//             const assetId = alert.assetId;
//             if (_.isEmpty(groupedByAsset[assetId])) {
//                 this.logger.debug(
//                     `${fnName} : Grouped by asset for asset id ${assetId} is empty`,
//                 );
//                 groupedByAsset[assetId] = [];
//             }
//             groupedByAsset[assetId].push(alert);
//             this.logger.debug(
//                 `${fnName} : Grouped by asset for asset id ${assetId} length : ${groupedByAsset[assetId].length}`,
//             );

//             const cachedOrgId = this.orgIdByAssetId.get(assetId);

//             if (_.isNil(cachedOrgId)) {
//                 assetIdsWithMissingOrgIds.add(assetId);
//             }
//         }

//         const csvAssetIDsWithMissingOrgIDs = Array.from(
//             assetIdsWithMissingOrgIds,
//         ).join(',');
//         this.logger.debug(
//             `${fnName} : csvAssetIDsWithMissingOrgIDs : ${csvAssetIDsWithMissingOrgIDs}`,
//         );
//         // parentOrg will be handled in that hierarchy function
//         // const newOrgIdsByAssetIds = await this.assetService.findOrgIDsByCSVAssetIDs(
//         //     csvAssetIDsWithMissingOrgIDs,
//         // );

//         this.logger.debug(
//             `${fnName} : New org id length : ${newOrgIdsByAssetIds.size}`,
//         );
//         // this service is available at the end of this code(commented code)

//         const alertsByOrgId = new Map<string, Alert[]>();

//         for (const [assetId, alerts] of Object.entries(groupedByAsset)) {
//             const orgId =
//                 this.orgIdByAssetId.get(assetId) ?? newOrgIdsByAssetIds.get(assetId);

//             this.logger.debug(`Org id for asset ${assetId} : ${orgId}`);

//             if (orgId == undefined) {
//                 this.logger.error(`No org found for asset ${assetId}`);
//                 continue;
//             }
//             this.orgIdByAssetId.set(assetId, orgId);


//             // we have to add here
//             // check subcribers
//             const hasSubscriber = this.cacheMappingService.hasSubscriberToTopic(orgId);

//             if (hasSubscriber == false) {
//                 this.logger.error(`No subscriber found for the topic: ${orgId}`)
//                 continue;
//             }



//             const alertsForAnOrgId = alertsByOrgId.get(orgId) || [];
//             alertsForAnOrgId.push(...alerts);

//             alertsByOrgId.set(orgId, alertsForAnOrgId);
//         }

//         const messages: Message[] = [];

//         for (const [orgId, alerts] of alertsByOrgId.entries()) {
//             const dataAlerts = [];
//             for (const alert of alerts) {
//                 const dataAlert = {
//                     id: alert.id,
//                     assetId: alert.assetId,
//                     deviceId: alert.deviceId,
//                     virtualDeviceId: alert.virtualDeviceId,
//                     alertId: alert.alertId,
//                     message: alert.message,
//                     openDateTime: alert.openDateTime,
//                     closeDateTime: alert.closeDateTime,
//                 };
//                 dataAlerts.push(dataAlert);
//                 const alertBodyStatus = alert.closeDateTime ? 'closed' : 'created';
//                 const alertMsgDesc = alert.message ?? alert.id;
//                 const alertMsg = `Alert ${alertMsgDesc} ${alertBodyStatus} on asset: ${alert.assetId}`;
//                 messages.push({
//                     topic: orgId,
//                     notification: {
//                         //title: status,
//                         body: alertMsg,
//                     },
//                 });
//             }
//             this.logger.debug(
//                 `${fnName} : Org id : ${orgId} : No of Notification Alerts to be sent : ${messages.length}`,
//             );
//             messages.push({
//                 topic: orgId,
//                 data: {
//                     //status,
//                     alerts: JSON.stringify([...dataAlerts]),
//                 },
//             });
//             this.logger.debug(
//                 `${fnName} : Org id : ${orgId} : Data alerts are : ${JSON.stringify([
//                     ...dataAlerts,
//                 ])}`,
//             );
//             this.logger.debug(
//                 `${fnName} : Org id : ${orgId} : No of Data Alerts to be sent : ${dataAlerts.length}`,
//             );
//         }

//         if (messages.length === 0) {
//             this.logger.debug('No messages to send');
//             return;
//         }

//         try {
//             const response =
//                 await this.firebaseService.sendNotificationToTopic(messages);
//             this.logger.debug(
//                 `${fnName} : Firebase response : ${JSON.stringify(response)}`,
//             );
//             if (response.failureCount > 0) {
//                 this.logger.error(
//                     `${response.failureCount} notifications failed to send`,
//                 );
//             }
//             this.logger.debug(
//                 `${response.successCount} notifications sent successfully`,
//             );
//         } catch (error) {
//             const errMsg = getTryCatchErrorStr(error);
//             this.logger.error('Notification sending failed', error);
//         }
//     }
// }




// // this is assetservice

// //  async findAssetOrgIdMap(assetIds: string[]) {

// //     const assets = await this.repo.find({
// //         select: {
// //             id: true,
// //             orgId: true,
// //         },
// //         where: {
// //             id: In(assetIds),
// //         },
// //     });

// //     return new Map(
// //         assets.map(asset => [asset.id, asset.orgId]),
// //     );
// // }