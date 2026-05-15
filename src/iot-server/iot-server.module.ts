import { Module } from '@nestjs/common';
import { IotServerService } from './iot-server.service';
import { IotServerController } from './iot-server.controller';
import { HttpModule } from '@nestjs/axios';
import { CurrentOpenAlertModule } from 'src/current-open-alert/current-open-alert.module';
import { AlertModule } from 'src/alert/alert.module';
import { OrgModule } from 'src/org/org.module';
import { DeviceModule } from 'src/device/device.module';
import { CurrentTelemetryPayloadModule } from 'src/current-telemetry-payload/current-telemetry-payload.module';
import { TelemetryPayloadModule } from 'src/telemetry-payload/telemetry-payload.module';
import { PeriodTelemetryPayloadAuditModule } from 'src/period-telemetry-payload-audit/period-telemetry-payload-audit.module';
import { VirtualDeviceModule } from 'src/virtual-device/virtual.device.module';
// import { AssetCurrentPerformanceSourceModule } from 'src/asset-current-performance-source/asset-current-performance-source.module';
// import { CurrentTelemetryPayloadModule } from 'src/current-telemetry-payload/current-telemetry-payload.module';
// import { TelemetryPayloadModule } from 'src/telemetry-payload/telemetry-payload.module';
// import { HttpModule } from '@nestjs/axios';
// import { OrgModule } from 'src/org/org.module';
// import { AssetTypeCurrentPerformanceSourceModule } from 'src/asset-type-current-performance-source/asset-type-current-performance-source.module';
// import { AssetModule } from 'src/asset/asset.module';
// import { CurrentOpenAlertModule } from 'src/current-open-alert/current-open-alert.module';
// import { UserModule } from 'src/user/user.module';
// import { PeriodTelemetryPayloadAuditModule } from 'src/period-telemetry-payload-audit/period-telemetry-payload-audit.module';
// import { DeviceModelModule } from 'src/device-model/device-model.module';
// import { DeviceModel } from 'src/device-model/entities/device-model.entity';
// import { DeviceModule } from 'src/device/device.module';
// import { AlertModule } from 'src/alert/alert.module';
// import { DeviceTypeMetricsAttributeModule } from 'src/device-type-metrics-attribute/device-type-metrics-attribute.module';
// import { DeviceModelAlertModule } from 'src/device-model-alert/device-model-alert.module';
// import { TodayTelemetryPayloadModule } from 'src/today-telemetry-payload/today-telemetry-payload.module';

@Module({
  imports: [
    // AssetCurrentPerformanceSourceModule,
    // AssetTypeCurrentPerformanceSourceModule,
    CurrentTelemetryPayloadModule,
    TelemetryPayloadModule,
    HttpModule,
    OrgModule,
    // AssetModule,
    CurrentOpenAlertModule,
    // UserModule,
    // PeriodTelemetryPayloadAuditModule,
    // DeviceModelModule,
    DeviceModule,
    AlertModule,
    // DeviceTypeMetricsAttributeModule,
    // DeviceModelAlertModule,
    // TodayTelemetryPayloadModule,
    PeriodTelemetryPayloadAuditModule,
    VirtualDeviceModule
  ],
  exports: [IotServerService],
  controllers: [IotServerController],
  providers: [IotServerService],
})
export class IotServerModule { }

//  