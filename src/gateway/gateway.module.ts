import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayGateway } from './gateway.gateway';
import { HttpModule } from '@nestjs/axios';
import { TelemetryPayloadModule } from 'src/telemetry-payload/telemetry-payload.module';
import { CurrentTelemetryPayloadModule } from 'src/current-telemetry-payload/current-telemetry-payload.module';
// import { AssetCurrentPerformanceSourceModule } from 'src/asset-current-performance-source/asset-current-performance-source.module';
import { AssetModule } from 'src/asset/asset.module';
import { AssetCurrentPerformanceSourceModule } from 'src/asset-current-performance-source/asset-current-performance-source.module';
import { DeviceTypeMetricsAttributeModule } from 'src/device-type-metrics-attribute/device-type-metrics-attribute.module';
// import { DeviceTypeMetricsAttributeModule } from 'src/Asset Current Performance Source/device-type-metrics-attribute/device-type-metrics-attribute.module';
// import { DeviceTypeMetricsAttributeModule } from 'src/device-type-metrics-attribute/device-type-metrics-attribute.module';

@Module({
  providers: [GatewayGateway, GatewayService],
  imports: [
    HttpModule,
    TelemetryPayloadModule,
    CurrentTelemetryPayloadModule,
    AssetCurrentPerformanceSourceModule,
    AssetModule,
    DeviceTypeMetricsAttributeModule,
  ],
})
export class GatewayModule { }
