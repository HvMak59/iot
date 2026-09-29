import { Module } from '@nestjs/common';
import { RtuCommandController } from './rtu-command.controller';
import { RtuCommandService } from './rtu-command.service';
import { RtuMqttService } from './mqtt/rtu-mqtt.service';
import { RtuCommunicationLogger } from './logger/rtu-communication.logger';
import { AssetModule } from 'src/asset/asset.module';
import { DeviceModule } from 'src/device/device.module';
import { CurrentOpenAlertModule } from 'src/current-open-alert/current-open-alert.module';
import { CurrentTelemetryPayloadModule } from 'src/current-telemetry-payload/current-telemetry-payload.module';
import { RtuCommandMasterService } from './rtu-command-master.service';
import { VirtualDeviceModule } from 'src/virtual-device/virtual.device.module';
// import { RtuCommandMasterService } from './rtu-command-master.service';

@Module({
    imports: [
        // TypeOrmModule.forFeature([
        //     Asset,
        //     Device,
        //     CurrentTelemetryPayload,
        // ]),
        AssetModule,
        DeviceModule,
        CurrentTelemetryPayloadModule,
        VirtualDeviceModule
    ],

    controllers: [
        RtuCommandController,
    ],

    providers: [
        RtuMqttService,
        RtuCommandService,
        RtuCommunicationLogger,
        RtuCommandMasterService
    ],

    exports: [
        RtuCommandService,
        RtuCommandMasterService
    ],
})
export class RtuCommandModule { }