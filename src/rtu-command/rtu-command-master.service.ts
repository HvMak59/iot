import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { AssetService } from '../asset/asset.service';
import { DeviceService } from '../device/device.service';
import {
    CurrentTelemetryPayloadService,
} from '../current-telemetry-payload/current-telemetry-payload.service';

import { RtuCommandService } from './rtu-command.service';

import { ReadRtuCommandDto } from './dto/read-rtu-command.dto';
import { WriteRtuCommandDto } from './dto/write-rtu-command.dto';
import { FindDeviceDto } from 'src/device/dto/find-device.dto';
import { VirtualDeviceService } from 'src/virtual-device/virtual-device.service';
import { FindVirtualDeviceDto } from 'src/virtual-device/dto/find-virtual-device.dto';

@Injectable()
export class RtuCommandMasterService {
    constructor(
        private readonly assetService: AssetService,
        private readonly deviceService: DeviceService,
        private readonly virtualDeviceService: VirtualDeviceService,
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
        private readonly rtuCommandService: RtuCommandService,
    ) { }


    async getVDevices(assetId: string) {
        return this.virtualDeviceService.findAll(assetId as FindVirtualDeviceDto);
        // return this.deviceService.findAll(assetId as FindDeviceDto);
    }

    async getSlaveId(assetId: string, deviceId: string) {
        const searchCriteria = {
            assetId, deviceId
        }
        const currTeleMPylds = await this.currentTelemetryPayloadService.findAll(searchCriteria);

        let slaveIds: (string | undefined)[] = []
        if (currTeleMPylds) {
            slaveIds = currTeleMPylds.map((pyld) => pyld.slaveId);
        }
        console.log("slaveIds", slaveIds);
        return slaveIds;
    }

    private working = 4;
    // async sendRtuCommand(assetId: string, rmuDeviceId: string, param: string, addr: number) {
    //     console.log("master-send");
    //     const dto: ReadRtuCommandDto = { assetId, rmuDeviceId, param, addr }
    //     const r = await this.rtuCommandService.read(dto);
    //     // console.log(r);
    //     return r;
    // }

    async getRtuTarget(
        assetId: string,
        virtualDeviceId: string,
    ) {
        const virtualDevice = await this.virtualDeviceService.findOne({
            id: virtualDeviceId,
            assetId,
        });

        if (!virtualDevice) {
            throw new NotFoundException(
                'Virtual device not found for this asset',
            );
        }

        if (!virtualDevice.deviceId) {
            return {
                virtualDeviceId,
                deviceId: undefined,
                slaveId: undefined,
                rmuId: undefined,
            };
        }

        const payloads = await this.currentTelemetryPayloadService.findAll({
            assetId,
            virtualDeviceId,
        });

        const payload = payloads?.find(
            (item) =>
                !!item.slaveId &&
                !!item.telemetryHeader?.rmuId,
        );

        return {
            virtualDeviceId,
            deviceId: virtualDevice.deviceId,
            slaveId: payload?.slaveId,
            rmuId: payload?.telemetryHeader?.rmuId,
        };
    }

    async sendRtuCommand(
        assetId: string,
        deviceId: string,
        param: string,
        addr: number,
        slaveId?: string,
    ) {
        const target =
            await this.getRtuTarget(
                assetId,
                deviceId,
            );

        const finalSlaveId = slaveId ?? target.slaveId;

        if (!finalSlaveId) {
            throw new Error(
                'Slave ID is not available. Please provide slave ID manually.',
            );
        }

        if (!target.rmuId) {
            throw new Error(
                'RMU ID could not be determined for the selected device.',
            );
        }

        const dto: ReadRtuCommandDto = {
            assetId,
            rmuDeviceId: target.rmuId,
            slaveId: finalSlaveId,
            param,
            addr,
        };

        return this.rtuCommandService.read(dto);
    }




    // /**
    //  * Get devices available for an asset.
    //  */
    // async getDevices(assetId: string) {
    //     const asset =
    //         await this.assetService.findOneById(
    //             assetId,
    //         );

    //     if (!asset) {
    //         throw new NotFoundException(
    //             `Asset ${assetId} not found`,
    //         );
    //     }

    //     /**
    //      * IMPORTANT:
    //      *
    //      * Use your existing DeviceService method
    //      * for asset/device relationship here.
    //      *
    //      * Replace this call with your actual
    //      * DeviceService method if its name differs.
    //      */
    //     return this.deviceService.findAll(assetId as FindDeviceDto);
    // }

    // /**
    //  * Resolve the RTU target.
    //  *
    //  * Flow:
    //  *
    //  * asset
    //  *   ↓
    //  * device
    //  *   ↓
    //  * current telemetry
    //  *   ↓
    //  * slaveId
    //  *
    //  * If slaveId is manually provided, use it.
    //  */
    // async resolveTarget(input: {
    //     assetId: string;
    //     deviceId: string;
    //     slaveId?: string;
    // }) {
    //     const asset =
    //         await this.assetService.findOneById(
    //             input.assetId,
    //         );

    //     if (!asset) {
    //         throw new NotFoundException(
    //             `Asset ${input.assetId} not found`,
    //         );
    //     }

    //     const device =
    //         await this.deviceService.findOne({
    //             id: input.deviceId,
    //         });

    //     if (!device) {
    //         throw new NotFoundException(
    //             `Device ${input.deviceId} not found`,
    //         );
    //     }

    //     /**
    //      * Validate device belongs to selected asset.
    //      *
    //      * Keep this check according to your actual
    //      * Asset/Device relationship.
    //      */
    //     await this.validateDeviceBelongsToAsset(
    //         input.assetId,
    //         device,
    //     );

    //     /**
    //      * User manually supplied slaveId.
    //      *
    //      * In this case we don't need telemetry to
    //      * determine the slave ID.
    //      */
    //     if (
    //         input.slaveId !== undefined &&
    //         input.slaveId !== null &&
    //         input.slaveId.trim() !== ''
    //     ) {
    //         return {
    //             assetId: input.assetId,
    //             deviceId: device.id,
    //             clientDeviceId:
    //                 device.clientDeviceId,
    //             slaveId: input.slaveId.trim(),
    //         };
    //     }

    //     /**
    //      * No slaveId supplied.
    //      *
    //      * Find current telemetry for:
    //      *
    //      * assetId + deviceId
    //      */
    //     const telemetry =
    //         await this.currentTelemetryPayloadService.findOne(
    //             {
    //                 assetId: input.assetId,
    //                 deviceId: device.id,
    //             },
    //         );

    //     if (!telemetry) {
    //         throw new Error(
    //             `Slave ID not found for device ${device.id}. Please provide slaveId manually.`,
    //         );
    //     }

    //     if (
    //         telemetry.slaveId === undefined ||
    //         telemetry.slaveId === null ||
    //         String(telemetry.slaveId).trim() === ''
    //     ) {
    //         throw new Error(
    //             `Slave ID is not available for device ${device.id}. Please provide slaveId manually.`,
    //         );
    //     }

    //     return {
    //         assetId: input.assetId,
    //         deviceId: device.id,
    //         clientDeviceId:
    //             device.clientDeviceId,
    //         slaveId: String(
    //             telemetry.slaveId,
    //         ),
    //     };
    // }

    // /**
    //  * Execute READ workflow.
    //  */
    // async read(dto: ReadRtuCommandDto) {
    //     const target =
    //         await this.resolveTarget({
    //             assetId: dto.assetId,
    //             deviceId: dto.deviceId,
    //             slaveId: dto.slaveId,
    //         });

    //     return this.rtuCommandService.read(
    //         {
    //             clientDeviceId:
    //                 target.clientDeviceId,
    //             slaveId: target.slaveId,
    //         },
    //         dto,
    //     );
    // }

    // /**
    //  * Execute WRITE workflow.
    //  */
    // async write(dto: WriteRtuCommandDto) {
    //     const target =
    //         await this.resolveTarget({
    //             assetId: dto.assetId,
    //             deviceId: dto.deviceId,
    //             slaveId: dto.slaveId,
    //         });

    //     return this.rtuCommandService.write(
    //         {
    //             clientDeviceId:
    //                 target.clientDeviceId,
    //             slaveId: target.slaveId,
    //         },
    //         dto,
    //     );
    // }

    // /**
    //  * Keep asset/device relationship validation
    //  * isolated so it can match your actual
    //  * DeviceService implementation.
    //  */
    // private async validateDeviceBelongsToAsset(
    //     assetId: string,
    //     device: any,
    // ): Promise<void> {
    //     /**
    //      * Implement according to your existing
    //      * Device entity/service relationship.
    //      *
    //      * Example:
    //      *
    //      * if (device.assetId !== assetId) {
    //      *     throw new Error(
    //      *         'Selected device does not belong to selected asset',
    //      *     );
    //      * }
    //      */
    // }
}