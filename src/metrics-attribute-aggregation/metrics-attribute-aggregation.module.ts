import { Module } from '@nestjs/common';
import { MetricsAttributeAggregationService } from './metrics-attribute-aggregation.service';
import { MetricsAttributeAggregationController } from './metrics-attribute-aggregation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsAttributeAggregation } from './entities/metrics-attribute-aggregation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MetricsAttributeAggregation])],
  controllers: [MetricsAttributeAggregationController],
  providers: [MetricsAttributeAggregationService],
  exports: [MetricsAttributeAggregationService],
})
export class MetricsAttributeAggregationModule { }
