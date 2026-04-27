import { Injectable, Logger } from '@nestjs/common';
import { CurrentTelemetryPayloadService } from 'src/current-telemetry-payload/current-telemetry-payload.service';
import { InputAlert2Dto } from 'src/alert/dto/input-alert2.dto';
import { IotServerService } from 'src/iot-server/iot-server.service';
import { RMU_OFFLINE, RMU_OFFLINE_THRESHOLD } from 'src/app_config/constants';

@Injectable()
export class CronJobsService {
    private readonly logger = new Logger(CronJobsService.name);

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

    // @Cron('*/2 * * * *')  // every 2 minutes
    async createRmuOfflineAlert() {
        const rmus = await this.currentTelemetryPayloadService.findLatestRmuForOfflineCheck();

        console.log("rmus", rmus.length);
        const cutoffTime = new Date(Date.now() - RMU_OFFLINE_THRESHOLD);

        const byAsset = new Map<string, {
            csvVirtualDeviceIDs: Set<string>;
            arrivedAlerts2: InputAlert2Dto[];
        }>();

        for (const rmu of rmus) {
            if (!rmu.assetId || !rmu.virtualDeviceId) continue;

            let group = byAsset.get(rmu.assetId);

            if (!group) {
                group = {
                    csvVirtualDeviceIDs: new Set<string>(),
                    arrivedAlerts2: [],
                };
                byAsset.set(rmu.assetId, group);
            }

            // add all RMUs, offline + online
            group.csvVirtualDeviceIDs.add(rmu.virtualDeviceId);
            // 
            const lastTime = new Date(rmu.metric?.txnCaptureTime);

            const isOffline = lastTime < cutoffTime;

            if (isOffline) {
                group.arrivedAlerts2.push(
                    new InputAlert2Dto({
                        alertId: RMU_OFFLINE,
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

        console.log(byAsset.values());

        for (const [assetId, group] of byAsset.entries()) {
            const result = await this.iotServerService.manageAlerts2(
                '',
                assetId,
                Array.from(group.csvVirtualDeviceIDs).join(','),
                group.arrivedAlerts2,
                Date.now(),
                RMU_OFFLINE,
                // we have added one optional field in managealert input, because 
                // wihout this it is closing other alerts for same asset if rmu comes online  
            );

            results.push({ assetId, ...result });
        }
        // 
        // console.log(results);
        return results;
    }
}