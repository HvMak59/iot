// import { Injectable } from "@nestjs/common";
// import { AssetService } from "src/asset/asset.service";

// @Injectable()
// export class CacheMapsService {
//     private readonly assetOrgMap = new Map<string, string>();

//     constructor(
//         private readonly assetService: AssetService,
//     ) { }

//     async getOrgIds(assetIds: string[]): Promise<Map<string, string>> {
//         const result = new Map<string, string>();
//         const missingAssetIds: string[] = [];

//         // Check memory first
//         for (const assetId of assetIds) {
//             const orgId = this.assetOrgMap.get(assetId);

//             if (orgId !== undefined) {
//                 result.set(assetId, orgId);
//             } else {
//                 missingAssetIds.push(assetId);
//             }
//         }

//         // Everything was already cached
//         if (missingAssetIds.length === 0) {
//             return result;
//         }

//         // Fetch all missing assets in ONE DB query
//         const dbMap = await this.assetService.findAssetOrgIdMap(
//             missingAssetIds,
//         );

//         // Store DB results in memory
//         for (const [assetId, orgId] of dbMap) {
//             this.assetOrgMap.set(assetId, orgId);
//             result.set(assetId, orgId);
//         }

//         return result;
//     }

//     getOrgId(assetId: string): string | undefined {
//         return this.assetOrgMap.get(assetId);
//     }

//     setOrgId(assetId: string, orgId: string) {
//         this.assetOrgMap.set(assetId, orgId);
//     }

//     delete(assetId: string) {
//         this.assetOrgMap.delete(assetId);
//     }

//     clear() {
//         this.assetOrgMap.clear();
//     }
// }


import { Injectable } from '@nestjs/common';
import { AssetService } from 'src/asset/asset.service';

@Injectable()
export class CacheMappingService {

    private readonly assetOrgMap = new Map<string, string>();
    private topicSubscribersMap = new Map<String, String>();

    constructor(
        private readonly assetService: AssetService,
    ) { }

    async getOrgIds(assetIds: string[]) {

        const result = new Map<string, string>();
        const missingAssetIds: string[] = [];

        for (const assetId of assetIds) {

            const orgId = this.assetOrgMap.get(assetId);

            if (orgId) {
                result.set(assetId, orgId);
            }
            else {
                missingAssetIds.push(assetId);
            }
        }
        if (missingAssetIds.length === 0) {
            return result;
        }
        else {
            const missingAssetOrgMap = await this.assetService.findAssetOrgIdMap(missingAssetIds);

            for (const [assetId, orgId] of missingAssetOrgMap) {
                this.assetOrgMap.set(assetId, orgId);
                result.set(assetId, orgId);
            }
            return result;
        }
    }

    getOrgId(assetId: string) {
        return this.assetOrgMap.get(assetId);
    }

    setOrgId(assetId: string, orgId: string) {
        this.assetOrgMap.set(assetId, orgId);
    }

    deleteOrg(assetId: string) {
        this.assetOrgMap.delete(assetId);
    }




    setSubscriberToTopic(token: string, topic: string) {
        this.topicSubscribersMap.set(topic, token);
    }

    getSubscriberForTopic(topic: string) {
        return this.topicSubscribersMap.get(topic);
    }

    deleteSubscriberForTopic(topic: string) {
        return this.topicSubscribersMap.delete(topic);
    }

    hasSubscriberToTopic(topic: string) {
        return this.topicSubscribersMap.has(topic);
    }





    // async getVirtualDeviceIds(assetIds: string[]): Promise<Map<string, string>> {

    //     const result = new Map<string, string>();
    //     const missingAssetIds: string[] = [];

    //     for (const assetId of assetIds) {

    //         const virtualDeviceId =
    //             this.assetVirtualDeviceMap.get(assetId);

    //         if (virtualDeviceId !== undefined) {

    //             result.set(
    //                 assetId,
    //                 virtualDeviceId,
    //             );

    //         } else {
    //             missingAssetIds.push(assetId);
    //         }
    //     }

    //     if (missingAssetIds.length === 0) {
    //         return result;
    //     }

    //     const missingAssetVdMap = await this.assetService.findAssetVirtualDeviceIdMap(
    //         missingAssetIds,
    //     );

    //     for (const [assetId, virtualDeviceId] of missingAssetVdMap) {

    //         this.assetVirtualDeviceMap.set(assetId, virtualDeviceId);

    //         result.set(assetId, virtualDeviceId);
    //     }

    //     return result;
    // }

    // getVirtualDeviceId(assetId: string) {
    //     return this.assetVirtualDeviceMap.get(
    //         assetId,
    //     );
    // }

    // setVirtualDeviceId(assetId: string, virtualDeviceId: string) {
    //     this.assetVirtualDeviceMap.set(
    //         assetId,
    //         virtualDeviceId,
    //     );
    // }

    // deleteVirtualDevice(assetId: string) {
    //     this.assetVirtualDeviceMap.delete(
    //         assetId,
    //     );
    // }
}