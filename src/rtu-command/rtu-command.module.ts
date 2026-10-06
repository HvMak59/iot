import { Module } from '@nestjs/common';
import { RtuCommandController } from './rtu-command.controller';
import { RtuCommandService } from './rtu-command.service';
import { RtuMqttService } from './mqtt/rtu-mqtt.service';
import { RtuCommunicationLogger } from './logger/rtu-communication.logger';
import { CurrentTelemetryPayloadModule } from 'src/current-telemetry-payload/current-telemetry-payload.module';
import { VirtualDeviceModule } from 'src/virtual-device/virtual.device.module';

@Module({
    imports: [
        CurrentTelemetryPayloadModule,
        VirtualDeviceModule
    ],
    controllers: [RtuCommandController],
    providers: [
        RtuMqttService,
        RtuCommandService,
        RtuCommunicationLogger,
        // RtuCommandMasterService
    ]
})
export class RtuCommandModule { }