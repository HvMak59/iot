import { Test, TestingModule } from '@nestjs/testing';
import { MetricsAttributeFormulaService } from './metrics-attribute-formula.service';

describe('MetricsAttributeFormulaService', () => {
  let service: MetricsAttributeFormulaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsAttributeFormulaService],
    }).compile();

    service = module.get<MetricsAttributeFormulaService>(
      MetricsAttributeFormulaService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
