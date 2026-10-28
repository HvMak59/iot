import { Module } from '@nestjs/common';
import { RtuCommandController } from './rtu-command.controller';
import { RtuCommandService } from './rtu-command.service';
import { RtuMqttService } from './mqtt/rtu-mqtt.service';
import { RtuCommunicationLogger } from './logger/rtu-communication.logger';
import { CurrentTelemetryPayloadModule } from 'src/current-telemetry-payload/current-telemetry-payload.module';
import { VirtualDeviceModule } from 'src/virtual-device/virtual.device.module';
import { RtuCommandGateway } from './websocket-gateway/rtu-command.gateway';
import { SseModule } from 'src/sse/sse.module';
import { DeviceTypeMetricsAttributeModule } from 'src/device-type-metrics-attribute/device-type-metrics-attribute.module';
import { DeviceModelRegisterModule } from 'src/device-model-register/device-model-register.module';

@Module({
    imports: [
        CurrentTelemetryPayloadModule,
        VirtualDeviceModule,
        DeviceTypeMetricsAttributeModule,
        DeviceModelRegisterModule,

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