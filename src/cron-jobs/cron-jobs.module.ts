import { Module } from '@nestjs/common';
import { CronJobsController } from './cron-jobs.controller';
import { CronJobsService } from './cron-jobs.service';
import { CurrentOpenAlertModule } from 'src/current-open-alert/current-open-alert.module';
import { IotServerModule } from 'src/iot-server/iot-server.module';
import { CurrentTelemetryPayloadModule } from 'src/current-telemetry-payload/current-telemetry-payload.module';
import { AlertMasterModule } from 'src/alert-master/alert-master.module';
import { VirtualDeviceModule } from 'src/virtual-device/virtual.device.module';

@Module({
    imports: [
        CurrentTelemetryPayloadModule,
        IotServerModule,
        AlertMasterModule,
        VirtualDeviceModule
    ],
    controllers: [CronJobsController],
    providers: [CronJobsService],
    exports: [CronJobsService],
})
export class CronJobsModule { }
