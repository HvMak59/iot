import { Injectable } from '@nestjs/common';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { OrgService } from 'src/org/org.service';

@Injectable()
export class FirebaseService {

    private readonly logger = winstonServerLogger(FirebaseService.name);

    constructor(
        private readonly orgService: OrgService,
    ) {
        try {
            initializeApp({
                credential: applicationDefault(),
                // we have to set env variable named : 
                // GOOGLE_APPLICATION_CREDENTIALS=E:/.../firebase-admin-sdk.json (path to admin sdk)
                projectId: 'notify-demo-3be73',
            });


            this.logger.debug('Firebase initialized');

        } catch (error) {
            this.logger.error('Firebase initialitation failed', error);
        }
    }


    async subscribeTokenToTopic(token: string, orgId: string) {

        const orgIds = await this.orgService.getChildrenHierarchy(orgId);

        await Promise.all(
            orgIds.map(orgId => this.subscribeToOrgHierarchy(token, orgId))
        );
    }

    async subscribeToOrgHierarchy(
        token: string,
        topic: string,
    ) {
        try {
            await getMessaging().subscribeToTopic(token, topic);
            this.logger.debug(`Subscribed token to ${topic}`);
        }
        catch (error) {
            this.logger.error(`Error subscribing to topic : ${topic}`, error);
        }
    }

    async sendNotificationToTopic(messages: Message[]) {
        return await getMessaging().sendEach(messages);
    }
}



