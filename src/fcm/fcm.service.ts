import {
    Injectable,
    Logger,
} from '@nestjs/common';

@Injectable()
export class FcmService {
    private readonly logger = new Logger(
        FcmService.name,
    );


    // for fcm use firebase or firebase/fcm folders 


    private readonly tokenToOrgMap = new Map<string, string>();
    private readonly orgToTokensMap = new Map<string, Set<string>>();

    async register(orgId: string, fcmToken: string) {
        if (!orgId) {
            throw new Error('orgId is required');
        }

        if (!fcmToken) {
            throw new Error('fcmToken is required',);
        }

        if (this.tokenToOrgMap.has(fcmToken)) {
            this.logger.error("Already having token");
            return {
                success: false,
                message: 'Token already registered',
            };
        }

        // token -> org
        this.tokenToOrgMap.set(fcmToken, orgId,);

        // org -> tokens
        if (this.orgToTokensMap.has(orgId) == false) {
            this.orgToTokensMap.set(orgId, new Set<string>());
        }

        this.orgToTokensMap.get(orgId)?.add(fcmToken);

        this.logger.log(`FCM token registered to orgId: ${orgId}`);
        console.log(`FCM token registered to orgId: ${orgId}`);

        return {
            success: true,
            message: 'FCM token registered successfully',
        };
    }

    disconnect(fcmToken: string) {
        if (!fcmToken) {
            throw new Error(
                'fcmToken is required',
            );
        }

        const orgId = this.tokenToOrgMap.get(fcmToken);

        if (!orgId) {
            this.logger.error('No Org found for token');
            return;
        }

        this.tokenToOrgMap.delete(fcmToken);

        const tokenSet = this.orgToTokensMap.get(orgId);

        if (tokenSet) {
            tokenSet.delete(fcmToken);

            if (tokenSet.size === 0) {
                this.orgToTokensMap.delete(orgId);
            }
        }

        this.logger.log(
            `FCM token disconnected | orgId=${orgId}`,
        );
    }

    getTokensByOrgId(orgId: string) {
        return Array.from(
            this.orgToTokensMap.get(
                orgId,
            ) || [],
        );
    }

    getOrgIdByToken(fcmToken: string) {
        return this.tokenToOrgMap.get(
            fcmToken,
        );
    }


    hasToken(fcmToken: string) {
        return this.tokenToOrgMap.has(
            fcmToken,
        );
    }
}