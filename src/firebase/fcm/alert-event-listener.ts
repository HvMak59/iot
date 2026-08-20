import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AlertStatus } from 'src/utils/enums';
import { Alert } from 'src/alert/entities/alert.entity';
import { AssetService } from 'src/asset/asset.service';
import _ from 'lodash';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CacheMappingService } from 'src/cache-maps/cache-maps.service';

@Injectable()
export class AlertEventsListener {
    constructor(
        private readonly assetService: AssetService,
        private readonly firebaseService: FirebaseService,
        private readonly cacheMappingService: CacheMappingService,
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
        const assetOrgMap = this.cacheMappingService.getOrgIds(assetIds);
        console.log("new", assetOrgMap);

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
}





// this is assetservice

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