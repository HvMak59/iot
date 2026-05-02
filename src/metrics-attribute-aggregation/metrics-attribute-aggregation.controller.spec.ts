import { Test, TestingModule } from '@nestjs/testing';
import { MetricsAttributeAggregationController } from './metrics-attribute-aggregation.controller';
import { MetricsAttributeAggregationService } from './metrics-attribute-aggregation.service';

describe('MetricsAttributeAggregationController', () => {
  let controller: MetricsAttributeAggregationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsAttributeAggregationController],
      providers: [MetricsAttributeAggregationService],
    }).compile();

    controller = module.get<MetricsAttributeAggregationController>(
      MetricsAttributeAggregationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
