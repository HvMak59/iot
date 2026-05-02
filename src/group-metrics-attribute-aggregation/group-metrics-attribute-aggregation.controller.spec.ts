import { Test, TestingModule } from '@nestjs/testing';
import { GroupMetricsAttributeAggregationController } from './group-metrics-attribute-aggregation.controller';
import { GroupMetricsAttributeAggregationService } from './group-metrics-attribute-aggregation.service';

describe('GroupMetricsAttributeAggregationController', () => {
  let controller: GroupMetricsAttributeAggregationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupMetricsAttributeAggregationController],
      providers: [GroupMetricsAttributeAggregationService],
    }).compile();

    controller = module.get<GroupMetricsAttributeAggregationController>(GroupMetricsAttributeAggregationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
