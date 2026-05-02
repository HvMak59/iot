import { Test, TestingModule } from '@nestjs/testing';
import { GroupMetricsAttributeAggregationService } from './group-metrics-attribute-aggregation.service';

describe('GroupMetricsAttributeAggregationService', () => {
  let service: GroupMetricsAttributeAggregationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupMetricsAttributeAggregationService],
    }).compile();

    service = module.get<GroupMetricsAttributeAggregationService>(GroupMetricsAttributeAggregationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
