import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { winstonServerLogger } from "src/app_config/serverWinston.config";
import { Asset } from "./entities/asset.entity";
import { In, Repository } from "typeorm";
import { KEY_SEPARATOR } from "src/app_config/constants";

@Injectable()
export class AssetService {

    private readonly logger = winstonServerLogger(AssetService.name);
    constructor(
        @InjectRepository(Asset)
        private readonly repo: Repository<Asset>,
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
                            phoneNumber: true
                        }
                    }
                }
            },
            where: { id },
            relations: ['org', 'org.orgUsers', 'org.orgUsers.user'],
        })

        const phoneNumber = asset?.org.orgUsers[0].user.phoneNumber;

        console.log(phoneNumber);
        return phoneNumber;
    }


    async findOrgId(id: string) {
        const asset = await this.repo.findOne({
            select: {
                id: true,
                orgId: true
            },
            where: { id }
        })

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

}