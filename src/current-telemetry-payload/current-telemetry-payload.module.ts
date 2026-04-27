import { Module } from '@nestjs/common';
import { CurrentTelemetryPayloadService } from './current-telemetry-payload.service';
import { CurrentTelemetryPayloadController } from './current-telemetry-payload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrentTelemetryPayload } from './entities/current-telemetry-payload.entity';
import { IotServerModule } from 'src/iot-server/iot-server.module';

@Module({
  imports: [TypeOrmModule.forFeature([CurrentTelemetryPayload])],
  controllers: [CurrentTelemetryPayloadController],
  providers: [CurrentTelemetryPayloadService],
  exports: [CurrentTelemetryPayloadService]
})
export class CurrentTelemetryPayloadModule { }
