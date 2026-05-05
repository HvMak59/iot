import { Module } from '@nestjs/common';
import { GroupMetricsAttributeAggregationService } from './group-metrics-attribute-aggregation.service';
import { GroupMetricsAttributeAggregationController } from './group-metrics-attribute-aggregation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMetricsAttributeAggregation } from './entities/group-metrics-attribute-aggregation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupMetricsAttributeAggregation])],
  controllers: [GroupMetricsAttributeAggregationController],
  providers: [GroupMetricsAttributeAggregationService],
  exports: [GroupMetricsAttributeAggregationService],
})
export class GroupMetricsAttributeAggregationModule { }
