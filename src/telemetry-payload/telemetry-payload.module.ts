import { Module } from '@nestjs/common';
import { TelemetryPayloadService } from './telemetry-payload.service';
import { TelemetryPayloadController } from './telemetry-payload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryPayload } from './entities/telemetry-payload.entity';
import { CurrentTelemetryPayloadModule } from 'src/current-telemetry-payload/current-telemetry-payload.module';
// import { AssetModule } from 'src/asset/asset.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TelemetryPayload]),
    CurrentTelemetryPayloadModule,
    // AssetModule,
  ],
  controllers: [TelemetryPayloadController],
  providers: [TelemetryPayloadService],
  exports: [TelemetryPayloadService, TypeOrmModule],
})
export class TelemetryPayloadModule { }
