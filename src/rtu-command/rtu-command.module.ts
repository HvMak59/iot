import { Module } from '@nestjs/common';
import { RtuCommandController } from './rtu-command.controller';
import { RtuCommandService } from './rtu-command.service';
import { RtuMqttService } from './mqtt/rtu-mqtt.service';
import { RtuCommunicationLogger } from './logger/rtu-communication.logger';
import { CurrentTelemetryPayloadModule } from 'src/current-telemetry-payload/current-telemetry-payload.module';
import { VirtualDeviceModule } from 'src/virtual-device/virtual.device.module';
import { RtuCommandGateway } from './websocket-gateway/rtu-command.gateway';
import { SseModule } from 'src/sse/sse.module';

@Module({
    imports: [
        CurrentTelemetryPayloadModule,
        VirtualDeviceModule,

        SseModule
    ],
    controllers: [RtuCommandController],
    providers: [
        RtuMqttService,
        RtuCommandService,
        RtuCommunicationLogger,
        // RtuCommandMasterService,
        RtuCommandGateway
    ]
})
export class RtuCommandModule { }