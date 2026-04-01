import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsAttributeAdaptor } from './entities/metrics-attribute-adaptor.entity';
import { MetricsAttributeAdaptorService } from './metrics-attribute-adaptor.service';
import { MetricsAttributeAdaptorController } from './metrics-attribute-adaptor.controller';

@Module({
    imports: [TypeOrmModule.forFeature([MetricsAttributeAdaptor])],
    exports: [MetricsAttributeAdaptorService],
    controllers: [MetricsAttributeAdaptorController],
    providers: [MetricsAttributeAdaptorService],
})
export class MetricsAttributeAdaptorModule { }
