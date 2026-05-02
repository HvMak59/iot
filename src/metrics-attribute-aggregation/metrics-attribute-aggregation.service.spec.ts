import { Test, TestingModule } from '@nestjs/testing';
import { MetricsAttributeAggregationService } from './metrics-attribute-aggregation.service';

describe('MetricsAttributeAggregationService', () => {
  let service: MetricsAttributeAggregationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsAttributeAggregationService],
    }).compile();

    service = module.get<MetricsAttributeAggregationService>(
      MetricsAttributeAggregationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
