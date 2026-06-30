// import { Injectable } from '@nestjs/common';

// import { initializeApp, cert, } from 'firebase-admin/app';

// import {
//     getMessaging,
//     MulticastMessage,
// } from 'firebase-admin/messaging';
// import path from 'path';

// import { winstonServerLogger } from 'src/app_config/serverWinston.config';

// @Injectable()
// export class FirebaseService {
//     private readonly logger = winstonServerLogger(FirebaseService.name);

//     constructor() {

//         const serviceAccountPath =
//             path.join(
//                 process.cwd(),
//                 'src',
//                 'firebase',
//                 'firebase-admin-sdk.json',
//             );

//         initializeApp({
//             credential: cert(
//                 require(serviceAccountPath),
//             ),
//         });

//         // initializeApp({
//         //     credential: applicationDefault(),
//         //     projectId: 'notify-demo-3be73',
//         // });

//         this.logger.debug('Firebase initialized');

//     }

//     async sendNotification(
//         tokens: string[],
//         title: string,
//         body: string,
//         data: Record<string, string> = {},
//     ) {

//         if (tokens.length == 0) {

//             return {
//                 success: false,
//                 error: 'No token provided',
//             };
//         }

//         const message: MulticastMessage = {
//             tokens,
//             notification: {
//                 title,
//                 body,
//             },
//             data,
//         };

//         try {
//             const response = await getMessaging().sendEachForMulticast(message);

//             this.logger.debug(`Notification sent: ${response}`);

//             return {
//                 success: true,
//                 response,
//             };
//         } catch (error) {

//             this.logger.error(error);

//             return {
//                 success: false,
//                 error,
//             };
//         }
//     }
// }


import { Injectable } from '@nestjs/common';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { OrgService } from 'src/org/org.service';

@Injectable()
export class FirebaseService {

    private readonly logger = winstonServerLogger(FirebaseService.name);

    // constructor() {
    //     const serviceAccountPath = path.join(
    //         process.cwd(),
    //         'src',
    //         'firebase',
    //         'firebase-admin-sdk.json',
    //     );

    //     initializeApp({
    //         credential: cert(
    //             require(serviceAccountPath),
    //         ),
    //     });

    //     this.logger.debug('Firebase initialized');
    // }

    constructor(
        private readonly orgService: OrgService,
    ) {
        try {
            initializeApp({
                credential: applicationDefault(),
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


    async sendTopicNotification(
        topic: string,
        title: string,
        body: string,
        data: Record<string, string> = {},
    ) {
        if (!topic) {
            return {
                success: false,
                error: 'No topic provided',
            };
        }

        const message: Message = {
            notification: {
                title,
                body,
            },
            data,
            topic,
        };

        try {
            const response = await getMessaging().send(message);
            this.logger.debug(`Topic notification sent: ${response}`);

            return {
                success: true,
                response,
            };
        } catch (error) {
            this.logger.error('Error sending notification', error);

            return {
                success: false,
                error,
            };
        }
    }
}


