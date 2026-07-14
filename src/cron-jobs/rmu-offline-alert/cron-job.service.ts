import { Injectable } from '@nestjs/common';
import { CurrentTelemetryPayloadService } from 'src/current-telemetry-payload/current-telemetry-payload.service';
import { InputAlert2Dto } from 'src/alert/dto/input-alert2.dto';
import { IotServerService } from 'src/iot-server/iot-server.service';
import { RMU_OFFLINE, RMU_OFFLINE_THRESHOLD } from 'src/app_config/constants';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronJobsService {
    constructor(
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
        private readonly iotServerService: IotServerService,
    ) { }


    // */2   *   *   *   *
    // │     │   │   │   │
    // │     │   │   │   └─ Day of week
    // │     │   │   └──── Month
    // │     │   └──────── Day of month
    // │     └──────────── Hour
    // └────────────────── Minute

    // @Cron('*/20 * * * *')  // every 20 minutes
    async createRmuOfflineAlert() {
        const rmus = await this.currentTelemetryPayloadService.findLatestRmuForOfflineCheck();

        const cutoffTime = new Date(Date.now() - RMU_OFFLINE_THRESHOLD);

        const byAsset = new Map<string, {
            csvVirtualDeviceIDs: string[];
            arrivedAlerts2: InputAlert2Dto[];
        }>();

        for (const rmu of rmus) {
            if (!rmu.assetId || !rmu.virtualDeviceId) continue;

            let group = byAsset.get(rmu.assetId);

            if (!group) {
                group = {
                    csvVirtualDeviceIDs: [],
                    arrivedAlerts2: [],
                };
                byAsset.set(rmu.assetId, group);
            }

            // add all RMUs, offline + online
            group.csvVirtualDeviceIDs.push(rmu.virtualDeviceId);

            const lastTime = new Date(rmu.metric?.txnCaptureTime);

            const isOffline = lastTime < cutoffTime;

            if (isOffline) {
                group.arrivedAlerts2.push(
                    new InputAlert2Dto({
                        alertId: RMU_OFFLINE,   // export const RMU_OFFLINE = 'rmuOffline';
                        assetId: rmu.assetId,
                        deviceId: rmu.deviceId,
                        virtualDeviceId: rmu.virtualDeviceId,
                        deviceModelId: rmu.device?.deviceModelId,
                        openDateTime: Date.now(),
                    } as any),
                );
            }
        }

        const results = [];

        for (const [assetId, group] of byAsset.entries()) {
            const result = await this.iotServerService.manageAlerts2(
                '',
                assetId,
                group.csvVirtualDeviceIDs.join(','),
                group.arrivedAlerts2,
                Date.now(),
                RMU_OFFLINE, // we have added one optional field in managealert input, because 
                // wihout this, it was closing other alerts for same asset if rmu comes online  
            );
            results.push({ assetId, ...result });
        }

        return results;
    }


}