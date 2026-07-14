import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

// import { AggregationCron } from './aggregation.cron';
// import { AggregationService } from './aggregation.service';
// import { AggregationContext } from './aggregation.context';

// import { VirtualDeviceModule } from '../virtual-device/virtual-device.module';
import { CurrentTelemetryPayloadModule } from '../current-telemetry-payload/current-telemetry-payload.module';
import { VirtualDeviceGroupModule } from '../virtual-device-group/virtual-device-group.module';
import { GroupMetricsAttributeAggregationModule } from '../group-metrics-attribute-aggregation/group-metrics-attribute-aggregation.module';
import { VirtualDeviceModule } from 'src/virtual-device/virtual.device.module';
import { AggregationService } from './aggregation.service';
import { AggregationCron } from './aggregation.cron';
import { AggregationContext } from './aggregation.context';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        VirtualDeviceModule,
        CurrentTelemetryPayloadModule,
        VirtualDeviceGroupModule,
        GroupMetricsAttributeAggregationModule,
    ],

    providers: [
        AggregationCron,
        AggregationService,
        AggregationContext,
    ],

    exports: [AggregationService],
})
export class AggregationModule { }