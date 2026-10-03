import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { winstonServerLogger } from "src/app_config/serverWinston.config";
import { Asset } from "./entities/asset.entity";
import { In, Repository } from "typeorm";
import { KEY_SEPARATOR, NO_RECORD } from "src/app_config/constants";
import { OrgService } from "src/org/org.service";
import { UpdateAssetDto } from "./dto/update-asset.dto";

@Injectable()
export class AssetService {

    private readonly logger = winstonServerLogger(AssetService.name);
    constructor(
        @InjectRepository(Asset)
        private readonly repo: Repository<Asset>,
        private readonly orgService: OrgService
    ) { }

    async findPhoneNumber(id: string) {
        const fnName = this.findPhoneNumber.name;
        const input = `Input: Find phoneNumber of user of the asset : ${id}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const asset = await this.repo.findOne({
            select: {
                id: true,
                org: {
                    id: true,
                    orgUsers: {
                        orgId: true,
                        user: {
                            id: true,
                            phoneNo: true
                        }
                    }
                }
            },
            where: { id },
            relations: ['org', 'org.orgUsers', 'org.orgUsers.user'],
        })

        const phoneNumber = asset?.org.orgUsers[0].user.phoneNo;

        console.log(phoneNumber);
        return phoneNumber;
    }

    async findEmailsByAssetIDs(assetIds: string[]) {
        const fnName = this.findEmailsByAssetIDs.name;

        this.logger.debug(
            `${fnName} : Finding email IDs for asset IDs : ${assetIds.join(',')}`,
        );


        const result = new Map<string, string[]>();

        if (!assetIds?.length) {
            return result;
        }

        const assets = await this.repo.find({
            select: {
                id: true,
                org: {
                    id: true,
                    orgUsers: {
                        orgId: true,
                        user: {
                            id: true,
                            email: true,
                        },
                    },
                },
            },
            where: {
                id: In(assetIds),
            },
            relations: [
                'org',
                'org.orgUsers',
                'org.orgUsers.user',
            ],
        });

        for (const asset of assets) {
            // const emails =
            //     asset.org?.orgUsers
            //         ?.map((orgUser) => orgUser.user?.email)
            //         .filter(
            //             (email): email is string =>
            //                 !!email && email.trim().length > 0,
            //         )
            //         .map((email) => email.trim().toLowerCase()) ?? [];

            // result.set(asset.id, [...new Set(emails)]);

            const emails = asset.org?.orgUsers?.map(
                (orgUser) => orgUser.user.email!,
            ) ?? [];

            result.set(asset.id, emails);
        }
        // this service is for email finiding 
        this.logger.debug(
            `${fnName} : Email mapping created for ${result.size} assets`,
        );

        return result;
    }



    findAll() {
        return this.repo.find();
    }
    async findOrgId(id: string) {
        const asset = await this.repo.findOne({
            select: {
                id: true,
                orgId: true
            },
            where: { id }
        });

        return asset?.orgId;
    }

    async findAssetOrgIdMap(assetIds: string[]) {
        const assets = await this.repo.find({
            select: {
                id: true,
                orgId: true,
            },
            where: {
                id: In(assetIds),
            },
        });

        return new Map(
            assets.map(asset => [asset.id, asset.orgId]),
        );
    }



    async findOrgIDsByCSVAssetIDs(assetIds: string) {
        const assets = await this.repo.find({
            select: {
                id: true,
                orgId: true,
            },
            where: {
                id: In(assetIds.split(',')),
            },
        });

        return new Map(
            assets.map(asset => [asset.id, asset.orgId]),
        );
    }

    async findAssetVirtualDeviceIdMap(assetIds: string[]) {
        const assets = await this.repo.find({
            select: {
                id: true,
                virtualDevices: {
                    id: true,
                },
            },
            where: {
                id: In(assetIds),
            },
            relations: {
                virtualDevices: true,
            },
        });

        return new Map(
            assets.map(asset => [
                asset.id,
                asset.virtualDevices?.map(
                    virtualDevice => virtualDevice.id,
                ) ?? [],
            ]),
        );
    }


    async updateAssetOrg(
        assetId: string,
        orgId: string,
    ) {
        const asset = await this.repo.findOne({
            where: { id: assetId },
        });

        if (!asset) {
            throw new Error(`Asset ${assetId} not found`);
        }

        // const org = await this.orgRepository.findOne({
        //     where: { id: orgId },
        // });


        const org = await this.orgService.findOneById(orgId);

        if (!org) {
            throw new Error(`Org ${orgId} not found`);
        }

        asset.orgId = orgId;
        asset.org = org;

        return this.repo.save(asset);
    }


    async linkAssetWthNewOrgg(
        assetId: string,
        orgId: string,
    ) {
        const result = await this.repo.update(
            { id: assetId },
            { orgId: orgId },
        );

        if (result.affected === 0) {
            throw new Error(
                `Asset with id ${assetId} not found`,
            );
        }
    }


    findOneById(assetId: string) {
        return this.repo.findOne({
            where: { id: assetId },
            relations: ['org']
        })
    }

    async update(id: string, updateAssetDto: UpdateAssetDto) {
        const fnName = this.update.name;
        const input = `Input : Id : ${id}, updateAssetDto : ${JSON.stringify(updateAssetDto)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        if (updateAssetDto.id == null) {
            this.logger.debug(`${fnName} : Asset Id not found in updateAssetDto`);
            updateAssetDto.id = id;
        }
        else if (updateAssetDto.id != id) {
            this.logger.error(`${fnName}: Asset Id and Update Asset Object Id do not match`);
            throw new Error('Asset Id and Update Asset Object Id do not match');
        }

        const mergedAsset = await this.repo.preload(updateAssetDto);

        if (mergedAsset == null) {
            this.logger.error(`${fnName}: ${NO_RECORD} : Asset id : ${id} not found`);
            throw new Error(`${NO_RECORD} : Asset id : ${id} not found`);
        }
        else {
            this.logger.debug(
                `${fnName} : Merged Asset is : ${JSON.stringify(mergedAsset)}`,
            );

            const savedAsset = await this.repo.save(mergedAsset);
            this.logger.debug(
                `${fnName} : Saved Asset is : ${JSON.stringify(mergedAsset)}`,
            );
            return savedAsset;
        }
    }

    async linkAssetWthNewOrg(
        assetId: string,
        orgId: string,
    ) {
        console.log('in change service');
        const mergedAsset = await this.repo.preload({
            id: assetId,
            orgId: orgId,
        });

        return await this.repo.save(mergedAsset!);
    }
}





