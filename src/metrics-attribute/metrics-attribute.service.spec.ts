import { Test, TestingModule } from '@nestjs/testing';
import { MetricsAttributeService } from './metrics-attribute.service';

describe('MetricsAttributeService', () => {
  let service: MetricsAttributeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsAttributeService],
    }).compile();

    service = module.get<MetricsAttributeService>(MetricsAttributeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
