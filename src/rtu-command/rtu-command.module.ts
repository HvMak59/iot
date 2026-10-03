import { Module } from '@nestjs/common';
import { RtuCommandController } from './rtu-command.controller';
import { RtuCommandService } from './rtu-command.service';
import { RtuMqttService } from './mqtt/rtu-mqtt.service';
import { RtuCommunicationLogger } from './logger/rtu-communication.logger';
import { CurrentTelemetryPayloadModule } from 'src/current-telemetry-payload/current-telemetry-payload.module';
// import { RtuCommandMasterService } from './rtu-command-master.service';
import { VirtualDeviceModule } from 'src/virtual-device/virtual.device.module';

@Module({
    imports: [
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
        // RtuCommandMasterService
    ],

    exports: [
        RtuCommandService,
        // RtuCommandMasterService
    ],
})
export class RtuCommandModule { }