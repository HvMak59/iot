// import { Injectable } from '@nestjs/common';
// import { OnEvent } from '@nestjs/event-emitter';
// import { Alert } from 'src/alert/entities/alert.entity';
// import { AssetService } from 'src/asset/asset.service';
// import { FirebaseService } from 'src/firebase/firebase.service';
// import { Message } from 'firebase-admin/messaging';
// import _ from 'lodash';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { CreatedAndClosedAlerts } from 'src/app_config/constants';
// import { getTryCatchErrorStr } from 'src/utils/others';
// import { EventInstanceService } from 'src/event-instance/event-instance.service';
// import { WhatsAppService } from 'src/whatsapp/whatsapp.service';

// @Injectable()
// export class AlertEventsListener {
//     constructor(
//         private readonly assetService: AssetService,
//         private readonly firebaseService: FirebaseService,
//         private readonly eventInstanceService: EventInstanceService,
//         private readonly whatsAppService: WhatsAppService
//     ) { }

//     private readonly logger = winstonServerLogger(AlertEventsListener.name);

//     private readonly orgIdByAssetId = new Map<string, string>();

//     @OnEvent(CreatedAndClosedAlerts)
//     async sendAlertNotificationToFirebase(
//         alertsInput: Alert[] /* ,
//     status: AlertStatus, */,
//     ) {
//         console.log("here")
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
//         const newOrgIdsByAssetIds = await this.assetService.findOrgIDsByCSVAssetIDs(
//             csvAssetIDsWithMissingOrgIDs,
//         );

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

//             const alertsForAnOrgId = alertsByOrgId.get(orgId) || [];
//             alertsForAnOrgId.push(...alerts);

//             alertsByOrgId.set(orgId, alertsForAnOrgId);
//         }

//         const messages: Message[] = [];
//         const whatsAppMessages: string[] = [];


//         for (const [orgId, alerts] of alertsByOrgId.entries()) {
//             const dataAlerts = [];
//             for (const alert of alerts) {
//                 const dataAlert = {
//                     id: alert.id,
//                     // orgId: alert.asset.orgId,
//                     orgId,
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

//                 whatsAppMessages.push(alertMsg);
//             }
//             console.log("dataalerts", dataAlerts);
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
//             const response = await this.firebaseService.sendNotificationToTopic(messages);
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

//             // this is for whatsapp 
//             await this.whatsAppService.sendMessageToWp(whatsAppMessages.join('\n'),
//             );

//         } catch (error) {
//             const errMsg = getTryCatchErrorStr(error);
//             this.logger.error('Notification sending failed', error);
//         }
//     }


//     // @OnEvent(CreatedAndClosedAlerts)
//     async createOrCloseEventInstance(alerts: Alert[]) {
//         await this.eventInstanceService.createOrCloseInstnceFromAlert(alerts)
//     }

//     /* @OnEvent('alert.created')
//     async handleCreated(alerts: Alert[]) {
//       this.logger.debug('in created listener');

//       await this.sendAlertNotificationToFirebase(alerts, AlertStatus.created);
//     }

//     @OnEvent('alert.incremented')
//     async handleIncremented(alerts: Alert[]) {
//       this.logger.debug('in incremented listener');

//       await this.sendAlertNotificationToFirebase(alerts, AlertStatus.incremented);
//     }

//     @OnEvent('alert.closed')
//     async handleClosed(alerts: Alert[]) {
//       this.logger.debug('in closed listener');

//       await this.sendAlertNotificationToFirebase(alerts, AlertStatus.closed);
//     } */
// }

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




import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as _ from 'lodash';

import { AssetService } from 'src/asset/asset.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { EmailService } from 'src/email/email.service';

import { Alert } from 'src/alert/entities/alert.entity';
import { Message } from 'firebase-admin/messaging';

import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { CacheMappingService } from 'src/cache-maps/cache-maps.service';
import { CreatedAndClosedAlerts } from 'src/app_config/constants';
import { getTryCatchErrorStr } from 'src/utils/others';

@Injectable()
export class AlertEventsListener {
    private readonly logger = winstonServerLogger(
        AlertEventsListener.name,
    );

    constructor(
        private readonly assetService: AssetService,
        private readonly firebaseService: FirebaseService,
        private readonly emailService: EmailService,
        private readonly cacheSrvcService: CacheMappingService,
    ) {}

    @OnEvent(CreatedAndClosedAlerts)
    async sendAlertNotificationToFirebase(
        alertsInput: Alert[],
    ): Promise<void> {
        const fnName =
            this.sendAlertNotificationToFirebase.name;

        this.logger.debug(`${fnName} : Start`);

        if (!alertsInput?.length) {
            this.logger.info(
                `${fnName} : No alerts received`,
            );

            return;
        }

        this.logger.info(
            `${fnName} : Received number of alerts : ${alertsInput.length}`,
        );

        const alertsByAssetId = _.groupBy(
            alertsInput,
            (alert) => alert.assetId,
        );

        const assetIds = Object.keys(alertsByAssetId);

        this.logger.info(
            `${fnName} : Number of affected assets : ${assetIds.length}`,
        );

        const orgIdsByAssetIds = await this.assetService.findOrgIDsByCSVAssetIDs(
                assetIds.join(','),
            );

        // fetch email 
        const emailsByAssetId = await this.assetService.findEmailsByAssetIDs(assetIds);
        
        const alertsByOrgId = new Map<string,Alert[]>();

        for (const [assetId, alerts] of Object.entries(alertsByAssetId)) {
            const orgId = orgIdsByAssetIds.get(assetId);

            if (!orgId) {
                this.logger.warn(
                    `${fnName} : Organization not found for asset : ${assetId}`,
                );
                continue;
            }

            const existingAlerts = alertsByOrgId.get(orgId) ?? [];

            existingAlerts.push(...alerts);

            alertsByOrgId.set(
                orgId,
                existingAlerts,
            );
        }

        const firebaseMessages: Message[] = [];
        const emailJobs = [];

        for (const [orgId, alerts] of alertsByOrgId.entries()) {
            const dataAlerts = [];

            const notificationMessages: string[] = [];

            for (const alert of alerts) {
      
                const dataAlert = {
                    id: alert.id,
                    asset: {
                        orgId,
                    },
                    assetId: alert.assetId,
                    deviceId: alert.deviceId,
                    virtualDeviceId: alert.virtualDeviceId,
                    alertId: alert.alertId,
                    message: alert.message,
                    openDateTime:  alert.openDateTime,
                    closeDateTime: alert.closeDateTime,
                };

                dataAlerts.push(dataAlert);
  
                const alertBodyStatus = alert.closeDateTime  ? 'closed': 'created';
                const alertMsgDesc = alert.message ?? alert.id;
                const alertMsg = `Alert ${alertMsgDesc} ${alertBodyStatus} on asset: ${alert.assetId}`;

                notificationMessages.push(alertMsg);

                firebaseMessages.push({
                    topic: orgId,
                    notification: {
                        body: alertMsg,
                    },
                });
            }

            firebaseMessages.push({
                topic: orgId,
                data: {
                    alerts: JSON.stringify(
                        dataAlerts,
                    ),
                },
            });

            const orgEmails = new Set<string>();

            for (const alert of alerts) {
                const emails = emailsByAssetId.get(alert.assetId) ?? [];

                for (const email of emails) {
                    orgEmails.add(email);
                }
            }

            if (orgEmails.size > 0) {
                const emailText = notificationMessages.join('\n');

                const emailHtml = this.buildAlertEmailHtml(
                        orgId,
                        alerts,
                    );
 
                emailJobs.push(
                    this.emailService.sendEmail({
                        to: Array.from(orgEmails),
                        subject:'Hermes IoT Alert Notification',
                        text: emailText,
                        // html: emailHtml,
                    }),
                );
                // 
        
                this.logger.info(
                    `${fnName} : Org id : ${orgId} : Email recipients : ${orgEmails.size}`,
                );
            } else {
                this.logger.info(
                    `${fnName} : Org id : ${orgId} : No email recipients found`,
                );
            }

            this.logger.info(
                `${fnName} : Org id : ${orgId} : Number of notification alerts : ${notificationMessages.length}`,
            );

            this.logger.info(
                `${fnName} : Org id : ${orgId} : Number of data alerts : ${dataAlerts.length}`,
            );
        }

        if (firebaseMessages.length > 0) {
            try {
                const response =
                    await this.firebaseService.sendNotificationToTopic(
                        firebaseMessages,
                    );

                this.logger.debug(
                    `${fnName} : Firebase response : ${JSON.stringify(response)}`,
                );

                if (
                    response.failureCount > 0
                ) {
                    this.logger.error(
                        `${fnName} : ${response.failureCount} Firebase notifications failed`,
                    );
                }

                this.logger.info(
                    `${fnName} : ${response.successCount} Firebase notifications sent successfully`,
                );
            } catch (error) {
                const errMsg =getTryCatchErrorStr(error);

                this.logger.error(
                    `${fnName} : Firebase notification sending failed : ${errMsg}`,
                );
            }
        }


        if (emailJobs.length > 0) {
            const emailResults = await Promise.allSettled(emailJobs);

            const successfulEmails = emailResults.filter(
                    (result) => result.status ==='fulfilled' && result.value === true,
                ).length;

            const failedEmails = emailResults.length - successfulEmails;

            this.logger.info(
                `${fnName} : Email notification result : ${successfulEmails} successful, ${failedEmails} failed`,
            );
        }

        this.logger.debug(
            `${fnName} : End`,
        );
    }

    private buildAlertEmailHtml(orgId: string,alerts: Alert[]): string {
        const alertRows = alerts.map((alert) => {
                const status = alert.closeDateTime ? 'Closed': 'Created';
                const message = alert.message ?? alert.id;
                return `
                    <tr>
                        <td>${this.escapeHtml(
                            alert.assetId,
                        )}</td>

                        <td>${this.escapeHtml(
                            message,
                        )}</td>

                        <td>${status}</td>

                        <td>${this.escapeHtml(
                            String(
                                alert.openDateTime ??
                                    '',
                            ),
                        )}</td>

                        <td>${this.escapeHtml(
                            String(
                                alert.closeDateTime ??
                                    '',
                            ),
                        )}</td>
                    </tr>
                `;
            }).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />

                <style>
                    body {
                        font-family: Arial, sans-serif;
                        color: #333;
                    }

                    h2 {
                        color: #222;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }

                    th,
                    td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }

                    th {
                        background-color: #f5f5f5;
                    }
                </style>
            </head>

            <body>
                <h2>Hermes IoT Alert Notification</h2>

                <p>
                    Organization:
                    <strong>${this.escapeHtml(
                        orgId,
                    )}</strong>
                </p>

                <p>
                    The following alert(s) were generated:
                </p>

                <table>
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Alert</th>
                            <th>Status</th>
                            <th>Open Date/Time</th>
                            <th>Close Date/Time</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${alertRows}
                    </tbody>
                </table>

                <p>
                    This is an automated notification from
                    Hermes IoT.
                </p>
            </body>
            </html>
        `;
    }

    private escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
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
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { CreatedAndClosedAlerts } from 'src/app_config/constants';
// import { CacheMappingService } from 'src/cache-maps/cache-maps.service';
// import { getTryCatchErrorStr } from 'src/utils/others';
// // import { CacheSrvcService } from 'src/cache-srvc/cache-srvc.service';

// @Injectable()
// export class AlertEventsListener {
//     constructor(
//         private readonly assetService: AssetService,
//         private readonly firebaseService: FirebaseService,
//         private readonly cacheSrvcService: CacheMappingService,
//     ) { }

//     private readonly logger = winstonServerLogger(AlertEventsListener.name);

//     //private readonly orgIdByAssetId = new Map<string, string>();

//     @OnEvent(CreatedAndClosedAlerts)
//     async sendAlertNotificationToFirebase(
//         alertsInput: Alert[] /* ,
//     status: AlertStatus, */,
//     ) {
//         const fnName = this.sendAlertNotificationToFirebase.name;
//         const groupedByAsset: Record<string, Alert[]> = {};
//         const assetIdsWithMissingOrgIds = new Set<string>();

//         this.logger.debug(`${fnName} : Start`);

//         this.logger.info(
//             `${fnName} Received number of alerts : ${alertsInput.length}`,
//         );

//         const alertsByAssetId = _.groupBy(alertsInput, (alert) => alert.assetId);

//         this.logger.info(
//             `${fnName} : alertsByAssetId size : ${Object.keys(alertsByAssetId).length}`,
//         );

//         const assetIds = Object.keys(alertsByAssetId);

//         const orgIdsByAssetIds = await this.assetService.findOrgIDsByCSVAssetIDs(
//             assetIds.join(','),
//         );

//         const alertsByOrgId: Map<string, Alert[]> = new Map();
//         for (const [assetId, alerts] of Object.entries(alertsByAssetId)) {
//             const orgId = orgIdsByAssetIds.get(assetId);
//             if (orgId) {
//                 const alertsForAnOrgId = alertsByOrgId.get(orgId) || [];
//                 alertsForAnOrgId.push(...alerts);
//                 alertsByOrgId.set(orgId, alertsForAnOrgId);
//             }
//         } // Assuming alertsByAssetId is already grouped by orgId for simplicity

//         const messages: Message[] = [];
//         let emailSubject;
//         let emailText;

//         for (const [orgId, alerts] of alertsByOrgId.entries()) {
//             const dataAlerts = [];
//             for (const alert of alerts) {
//                 const dataAlert = {
//                     id: alert.id,
//                     asset: {
//                         orgId: orgId,
//                     },
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
//             this.logger.info(
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
//             this.logger.info(
//                 `${fnName} : Org id : ${orgId} : No of Data Alerts to be sent : ${dataAlerts.length}`,
//             );
//         }

//         if (messages.length === 0) {
//             this.logger.info('No messages to send');
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
//             this.logger.info(
//                 `${response.successCount} notifications sent successfully`,
//             );
//         } catch (error) {
//             const errMsg = getTryCatchErrorStr(error);
//             this.logger.error('Notification sending failed', error);
//         }
//     }


//     /* @OnEvent('alert.created')
//     async handleCreated(alerts: Alert[]) {
//       this.logger.debug('in created listener');
  
//       await this.sendAlertNotificationToFirebase(alerts, AlertStatus.created);
//     }
  
//     @OnEvent('alert.incremented')
//     async handleIncremented(alerts: Alert[]) {
//       this.logger.debug('in incremented listener');
  
//       await this.sendAlertNotificationToFirebase(alerts, AlertStatus.incremented);
//     }
  
//     @OnEvent('alert.closed')
//     async handleClosed(alerts: Alert[]) {
//       this.logger.debug('in closed listener');
  
//       await this.sendAlertNotificationToFirebase(alerts, AlertStatus.closed);
//     } */
// }

//  async findAssetOrgIdMap(assetIds: string[]) {

//     const assets = await this.repo.find({
//         select: {
//             id: true,
//             orgId: true,
//         },
//         where: {
//             id: In(assetIds),
//         },
//     });

//     return new Map(
//         assets.map(asset => [asset.id, asset.orgId]),
//     );
// }
